"""Confere se tudo está pronto (Windows e Raspberry).   python diagnostico.py"""

import importlib
import os
import sys

import personagem_logica as pl

PASTA = os.path.dirname(os.path.abspath(__file__))
problemas = 0


def item(nome, ok, solucao=""):
    global problemas
    if ok:
        print(f"  [OK]  {nome}")
    else:
        problemas += 1
        print(f"  [X]   {nome}  ->  {solucao}")


def tem_modulo(nome):
    try:
        importlib.import_module(nome)
        return True
    except Exception:
        return False


print("Verificando o boneco...\n")
try:
    cfg = pl.carregar_config(os.path.join(PASTA, "config.json"))
    item("config.json válido", True)
except Exception as erro:
    item("config.json válido", False, f"erro no arquivo (vírgula ou aspas?): {erro}")
    sys.exit(1)

for modulo, uso in (("vosk", "ouvir"), ("piper", "falar"), ("sounddevice", "som"), ("requests", "IA")):
    item(f"Biblioteca {modulo} ({uso})", tem_modulo(modulo), "rode o instalador de novo")

item("Modelo de ouvir (Vosk)", os.path.isdir(os.path.join(PASTA, cfg["modelo_vosk"])), "rode o instalador de novo")
item("Voz (Piper)", os.path.isfile(os.path.join(PASTA, cfg["voz_piper"])), "rode o instalador de novo")

import boneco  # noqa: E402  (depois das checagens acima, para dar mensagens claras)

item("SoX (efeito de voz)", boneco.achar_sox() is not None, "instale o SoX (o instalador faz isso)")

ia = boneco.ia_disponivel()
item("IA (Ollama) respondendo", ia, "abra o Ollama (Windows) ou rode: sudo systemctl start ollama")
if ia:
    import requests
    modelos = [m["name"].split(":")[0] for m in requests.get(boneco.OLLAMA + "/api/tags").json()["models"]]
    item(f"Personagem '{cfg['modelo_ia']}' criado na IA", cfg["modelo_ia"] in modelos,
         "rode: python personagem.py aplicar")

try:
    import sounddevice as sd
    dispositivos = sd.query_devices()
    item("Microfone encontrado", any(d["max_input_channels"] > 0 for d in dispositivos), "plugue o microfone")
    item("Saída de som encontrada", any(d["max_output_channels"] > 0 for d in dispositivos), "plugue a caixa de som")
except Exception as erro:
    item("Dispositivos de som", False, str(erro))

print()
print(f"Personagem ativo: {cfg['personagem']}  |  nome: {cfg['nome']}  |  IA base: {cfg['modelo_base']}")
print("Tudo certo!" if problemas == 0 else f"{problemas} problema(s) encontrado(s). Veja as soluções acima.")
