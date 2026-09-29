"""Troca e aplica personagens.

    python personagem.py listar            mostra os personagens prontos
    python personagem.py escolher dragao   usa outro personagem (nome, voz, frases e personalidade)
    python personagem.py aplicar           aplica o Modelfile depois de você editar
"""

import os
import re
import subprocess
import sys

import personagem_logica as pl

PASTA = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(PASTA, "config.json")
PERSONAGENS = os.path.join(PASTA, "personagens")
# Estes campos vêm do personagem; senha, modelos e LED continuam os seus.
DO_PERFIL = ("nome", "apelidos", "efeito_voz", "frases", "respostas_fixas")


def listar(cfg):
    for pasta in sorted(os.listdir(PERSONAGENS)):
        perfil = pl.carregar_config(os.path.join(PERSONAGENS, pasta, "perfil.json"))
        ativo = "  <- ATIVO" if pasta == cfg["personagem"] else ""
        print(f"  {pasta:<10} {perfil.get('titulo', '')}  (nome: {perfil['nome']}){ativo}")


def aplicar(cfg):
    """Cria o modelo 'boneco' no Ollama usando o Modelfile do personagem ativo."""
    origem = os.path.join(PERSONAGENS, cfg["personagem"], "Modelfile")
    with open(origem, encoding="utf-8") as f:
        texto = re.sub(r"^FROM .*$", f"FROM {cfg['modelo_base']}", f.read(), flags=re.M)
    temporario = os.path.join(PASTA, "modelos", "Modelfile.ativo")
    os.makedirs(os.path.dirname(temporario), exist_ok=True)
    with open(temporario, "w", encoding="utf-8") as f:
        f.write(texto)
    subprocess.run(["ollama", "create", cfg["modelo_ia"], "-f", temporario], check=True)
    print(f"Personagem '{cfg['personagem']}' aplicado. Reinicie o boneco para usar.")


def escolher(cfg, nome):
    pasta = os.path.join(PERSONAGENS, nome)
    if not os.path.isdir(pasta):
        sys.exit(f"Personagem '{nome}' não existe. Use: python personagem.py listar")
    perfil = pl.carregar_config(os.path.join(pasta, "perfil.json"))
    for campo in DO_PERFIL:
        cfg[campo] = perfil[campo]
    cfg["personagem"] = nome
    pl.salvar_config(CONFIG, cfg)
    aplicar(cfg)


def main():
    cfg = pl.carregar_config(CONFIG)
    acao = sys.argv[1] if len(sys.argv) > 1 else "listar"
    if acao == "listar":
        listar(cfg)
    elif acao == "aplicar":
        aplicar(cfg)
    elif acao == "escolher" and len(sys.argv) > 2:
        escolher(cfg, sys.argv[2])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
