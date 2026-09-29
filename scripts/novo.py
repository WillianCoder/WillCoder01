#!/usr/bin/env python3
"""Cria um novo item a partir de TEMPLATES/, já na pasta correta.

Uso:
    python scripts/novo.py projeto "Meu Projeto"
    python scripts/novo.py academico "Trabalho de Redes" --disciplina "Redes de Computadores" --semestre 2026-2
    python scripts/novo.py estudo "Python Básico"
    python scripts/novo.py experimento "Teste de API"
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import unicodedata
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINOS = {"projeto": "PROJETOS", "academico": "ACADEMICO", "estudo": "ESTUDOS", "experimento": "EXPERIMENTOS"}


def slug(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texto.lower()).strip("-")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("tipo", choices=DESTINOS)
    parser.add_argument("nome")
    parser.add_argument("--disciplina", default="")
    parser.add_argument("--semestre", default="", help="formato AAAA-S, ex.: 2026-2")
    args = parser.parse_args()

    hoje = date.today()
    destino = RAIZ / DESTINOS[args.tipo]
    if args.tipo == "academico":
        semestre = args.semestre or f"{hoje.year}-{1 if hoje.month <= 6 else 2}"
        destino = destino / semestre / (slug(args.disciplina) or "sem-disciplina")
    elif args.tipo == "experimento":
        destino = destino / str(hoje.year)
    destino = destino / slug(args.nome)

    if destino.exists():
        print(f"ERRO  {destino.relative_to(RAIZ)} já existe — nada foi alterado.")
        return 1

    shutil.copytree(RAIZ / "TEMPLATES" / args.tipo, destino)
    for arq in destino.rglob("*"):
        if arq.is_file() and arq.suffix in {".md", ".json"}:
            texto = arq.read_text(encoding="utf-8")
            texto = texto.replace("{{NOME}}", args.nome).replace("{{DATA}}", hoje.isoformat())
            arq.write_text(texto, encoding="utf-8")

    meta = destino / "meta.json"
    dados = json.loads(meta.read_text(encoding="utf-8"))
    if args.tipo == "academico":
        dados["academico"]["disciplina"] = args.disciplina
        dados["academico"]["semestre"] = semestre
        meta.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"OK    criado {destino.relative_to(RAIZ)}")
    print("      1) preencha meta.json e README.md  2) rode: python scripts/catalogo.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
