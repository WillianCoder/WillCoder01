"""Boneco Árvore IA: fica ouvindo, acorda pelo nome e responde com voz grossa.

Tudo roda offline: Vosk (ouvir) -> Ollama (pensar) -> Piper + SoX (falar).
Executar:  python boneco.py
"""

import json
import os
import queue
import subprocess

import requests
import sounddevice as sd
from vosk import KaldiRecognizer, Model

import personagem_logica as pl

PASTA = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(PASTA, "config.json")
OLLAMA = "http://localhost:11434/api/chat"
TAXA = 16000

cfg = pl.carregar_config(CONFIG)
audio = queue.Queue()
historico = []  # últimas perguntas/respostas (apagado a cada reinício)


def caminho(rel):
    return os.path.join(PASTA, rel)


def limpar_microfone():
    with audio.mutex:
        audio.queue.clear()


def falar(texto):
    print(f"[{cfg['nome']}] {texto}")
    wav, grossa = caminho("fala.wav"), caminho("fala_grossa.wav")
    subprocess.run(["piper", "-m", caminho(cfg["voz_piper"]), "-f", wav],
                   input=texto.encode("utf-8"), check=True, capture_output=True)
    subprocess.run(["sox", wav, grossa, *cfg["efeito_voz"]], check=True)
    limpar_microfone()  # não ouvir a própria voz
    subprocess.run(["aplay", "-q", grossa], check=True)
    limpar_microfone()


def pensar(pergunta):
    if pl.e_tentativa_de_desprogramar(pergunta):
        return pl.FRASE_PROTECAO
    mensagens = historico + [{
        "role": "user",
        "content": f"(Seu nome é {cfg['nome'].title()}.) {pergunta}",
    }]
    try:
        r = requests.post(OLLAMA, timeout=90, json={
            "model": cfg["modelo_ia"], "messages": mensagens, "stream": False})
        resposta = pl.limpar_resposta(r.json()["message"]["content"])
    except Exception as erro:
        print("Erro na IA:", erro)
        return "Hmmm... o vento levou meus pensamentos. Pergunte de novo."
    historico.extend([mensagens[-1], {"role": "assistant", "content": resposta}])
    del historico[:-2 * cfg["memoria_conversa"]]
    return resposta


def ouvir_frase(rec, segundos):
    """Espera a pessoa terminar uma frase (ou o tempo acabar)."""
    blocos = int(segundos * TAXA / 8000)
    for _ in range(blocos):
        if rec.AcceptWaveform(audio.get()):
            texto = json.loads(rec.Result())["text"]
            if texto:
                return texto
    return json.loads(rec.FinalResult())["text"]


def tratar(frase, rec):
    novo = pl.pedido_de_troca_de_nome(frase, cfg["senha"])
    if novo:
        cfg["nome"] = novo
        pl.salvar_config(CONFIG, cfg)
        historico.clear()
        falar(f"Hmmm... agora me chamo {novo.title()}.")
        return
    pergunta = pl.pergunta_depois_do_nome(frase, cfg["nome"])
    if not pergunta:
        falar("Hmm?")
        pergunta = ouvir_frase(rec, cfg["segundos_para_pergunta"])
    if pergunta:
        print("[pergunta]", pergunta)
        falar(pensar(pergunta))


def main():
    modelo = Model(caminho(cfg["modelo_vosk"]))
    rec = KaldiRecognizer(modelo, TAXA)
    with sd.RawInputStream(samplerate=TAXA, blocksize=8000, dtype="int16", channels=1,
                           callback=lambda dados, *_: audio.put(bytes(dados))):
        falar(f"Hmmm... {cfg['nome'].title()} despertou.")
        while True:
            if not rec.AcceptWaveform(audio.get()):
                continue
            frase = json.loads(rec.Result())["text"]
            if frase and pl.chamou_o_nome(frase, cfg["nome"]):
                print("[ouvi]", frase)
                tratar(frase, rec)


if __name__ == "__main__":
    main()
