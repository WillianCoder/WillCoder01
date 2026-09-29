"""Boneco IA: fica ouvindo, acorda pelo nome e responde com a voz do personagem.

Tudo roda offline: Vosk (ouvir) -> Ollama (pensar) -> Piper + SoX (falar).

    python boneco.py            modo normal (microfone)
    python boneco.py --teclado  digita a pergunta e ouve a resposta (sem microfone)
"""

import glob
import hashlib
import json
import os
import queue
import shutil
import subprocess
import sys
import tempfile
import wave

import requests
import sounddevice as sd

import personagem_logica as pl

PASTA = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(PASTA, "config.json")
CACHE = os.path.join(PASTA, "modelos", "cache_frases")
OLLAMA = "http://localhost:11434"
TAXA = 16000

cfg = pl.carregar_config(CONFIG)
audio = queue.Queue()
historico = []  # últimas perguntas/respostas (apagado a cada reinício)
_voz = None
_led = None


def caminho(rel):
    return os.path.join(PASTA, rel)


# ---------------------------------------------------------------- olhos (LED)
def olhos(acesos):
    """Acende/apaga o LED dos olhos, se "led_gpio" estiver configurado (só Raspberry)."""
    global _led
    if cfg["led_gpio"] is None:
        return
    try:
        if _led is None:
            from gpiozero import LED
            _led = LED(cfg["led_gpio"])
        _led.on() if acesos else _led.off()
    except Exception as erro:
        print("LED desativado:", erro)
        cfg["led_gpio"] = None


# ---------------------------------------------------------------- voz
def achar_sox():
    """SoX no PATH (Raspberry) ou na pasta padrão do Windows."""
    return shutil.which("sox") or next(iter(glob.glob(r"C:\Program Files*\sox*\sox.exe")), None)


def voz():
    """Carrega a voz do Piper uma vez só (antes: recarregava a cada frase)."""
    global _voz
    if _voz is None:
        from piper import PiperVoice
        _voz = PiperVoice.load(caminho(cfg["voz_piper"]))
    return _voz


def limpar_microfone():
    with audio.mutex:
        audio.queue.clear()


def tocar(arquivo):
    """Toca um .wav pela saída de som padrão (funciona no Windows e no Raspberry)."""
    with wave.open(arquivo, "rb") as w:
        with sd.RawOutputStream(samplerate=w.getframerate(), channels=w.getnchannels(),
                                dtype="int16") as saida:
            saida.write(w.readframes(w.getnframes()))


def gerar_audio(texto, destino, efeito=None):
    """Texto -> voz do Piper -> efeito do SoX -> destino.wav"""
    efeito = efeito or cfg["efeito_voz"]
    bruto = destino + ".bruto.wav"
    with wave.open(bruto, "wb") as w:
        voz().synthesize_wav(texto, w)
    sox = achar_sox()
    if sox:
        subprocess.run([sox, bruto, destino, *efeito], check=True)
        os.remove(bruto)
    else:
        print("Aviso: SoX não encontrado, tocando a voz sem efeito.")
        os.replace(bruto, destino)


def falar(texto, efeito=None, guardar=False):
    """Fala o texto. guardar=True reaproveita o áudio de frases que se repetem."""
    texto = texto.strip()
    if not texto:
        return
    print(f"[{cfg['nome']}] {texto}")
    if guardar:
        chave = hashlib.md5((texto + str(efeito or cfg["efeito_voz"]) + cfg["voz_piper"]).encode()).hexdigest()
        arquivo = os.path.join(CACHE, chave + ".wav")
        if not os.path.exists(arquivo):
            os.makedirs(CACHE, exist_ok=True)
            gerar_audio(texto, arquivo, efeito)
    else:
        arquivo = os.path.join(tempfile.gettempdir(), "boneco_fala.wav")
        gerar_audio(texto, arquivo, efeito)
    limpar_microfone()  # não ouvir a própria voz
    olhos(True)
    tocar(arquivo)
    olhos(False)
    limpar_microfone()


def falar_frase(chave):
    falar(pl.frase(cfg, chave), guardar=True)


# ---------------------------------------------------------------- IA
def ia_disponivel():
    try:
        return requests.get(OLLAMA + "/api/tags", timeout=5).ok
    except requests.RequestException:
        return False


def pensar_e_falar(pergunta):
    """Pergunta à IA e já vai falando cada frase enquanto a resposta chega."""
    if pl.e_tentativa_de_desprogramar(pergunta):
        return falar_frase("protecao")
    fixa = pl.resposta_fixa(pergunta, cfg["respostas_fixas"])
    if fixa:
        return falar(fixa, guardar=True)

    mensagem = {"role": "user", "content": f"(Seu nome é {cfg['nome'].title()}.) {pergunta}"}
    resposta, buffer = [], ""
    try:
        with requests.post(OLLAMA + "/api/chat", stream=True, timeout=120, json={
                "model": cfg["modelo_ia"], "messages": historico + [mensagem],
                "stream": True, "keep_alive": -1}) as r:
            r.raise_for_status()
            for linha in r.iter_lines():
                if not linha:
                    continue
                pedaco = json.loads(linha)
                buffer += pedaco.get("message", {}).get("content", "")
                frases, buffer = pl.separar_frases(buffer)
                for f in frases:
                    f = pl.limpar_resposta(f)
                    resposta.append(f)
                    falar(f)
                if pedaco.get("done"):
                    break
        final = pl.limpar_resposta(buffer)
        if final:
            resposta.append(final)
            falar(final)
    except Exception as erro:
        print("Erro na IA:", erro)
        return falar_frase("erro")

    historico.extend([mensagem, {"role": "assistant", "content": " ".join(resposta)}])
    del historico[:-2 * cfg["memoria_conversa"]]


# ---------------------------------------------------------------- conversa
def tratar(texto, esperar_pergunta):
    """Decide o que fazer com uma frase em que chamaram o boneco."""
    novo = pl.pedido_de_troca_de_nome(texto, cfg["senha"])
    if novo:
        cfg["nome"] = novo
        cfg["apelidos"] = []
        pl.salvar_config(CONFIG, cfg)
        historico.clear()
        return falar_frase("nome_trocado")
    pergunta = pl.pergunta_depois_do_nome(texto, cfg)
    if not pergunta:
        falar_frase("chamado")
        pergunta = esperar_pergunta()
    if pergunta:
        print("[pergunta]", pergunta)
        pensar_e_falar(pergunta)


def modo_teclado():
    print(f"Modo teclado: escreva como se estivesse falando (ex.: '{cfg['nome']}, quem é você?').")
    print("Para sair: Ctrl+C\n")
    while True:
        texto = input("Você: ").strip()
        if not texto:
            continue
        if not pl.chamou_o_nome(texto, cfg):
            texto = f"{cfg['nome']} {texto}"  # no teclado não precisa escrever o nome
        tratar(texto, lambda: input("Você: "))


def modo_microfone():
    from vosk import KaldiRecognizer, Model, SetLogLevel
    SetLogLevel(-1)
    rec = KaldiRecognizer(Model(caminho(cfg["modelo_vosk"])), TAXA)

    def ouvir_frase():
        for _ in range(int(cfg["segundos_para_pergunta"] * TAXA / 8000)):
            if rec.AcceptWaveform(audio.get()):
                texto = json.loads(rec.Result())["text"]
                if texto:
                    return texto
        return json.loads(rec.FinalResult())["text"]

    with sd.RawInputStream(samplerate=TAXA, blocksize=8000, dtype="int16", channels=1,
                           callback=lambda dados, *_: audio.put(bytes(dados))):
        print(f"Ouvindo... fale '{cfg['nome']}' para chamar. (Ctrl+C para sair)")
        while True:
            if not rec.AcceptWaveform(audio.get()):
                continue
            texto = json.loads(rec.Result())["text"]
            if texto and pl.chamou_o_nome(texto, cfg):
                print("[ouvi]", texto)
                tratar(texto, ouvir_frase)


def main():
    if not ia_disponivel():
        print("A IA (Ollama) não está respondendo. Abra o Ollama ou rode: ollama serve")
    falar_frase("despertar")
    try:
        modo_teclado() if "--teclado" in sys.argv else modo_microfone()
    except KeyboardInterrupt:
        print("\nAté logo!")


if __name__ == "__main__":
    main()
