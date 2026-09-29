#!/usr/bin/env python3
"""Gera o catálogo do laboratório a partir dos arquivos `meta.json`.

Uso:
    python scripts/catalogo.py          # gera site/data/catalog.js e atualiza o README
    python scripts/catalogo.py --check  # valida e falha se algo estiver desatualizado (CI)

Sem dependências externas: apenas a biblioteca padrão do Python 3.9+.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SAIDA_JS = RAIZ / "site" / "data" / "catalog.js"
README = RAIZ / "README.md"
PERFIL = RAIZ / "perfil.json"

IGNORAR = {".git", "TEMPLATES", "site", "node_modules", ".github"}
PASTA_TIPO = {
    "PROJETOS": "projeto",
    "ACADEMICO": "academico",
    "ESTUDOS": "estudo",
    "EXPERIMENTOS": "experimento",
    "DOCUMENTACAO": "documentacao",
    "ARQUIVO": "arquivo",
}
TIPOS = set(PASTA_TIPO.values()) | {"ideia", "conquista"}
STATUS = {"concluido", "desenvolvimento", "planejado", "teste", "bloqueado", "arquivado"}
OBRIGATORIOS = ("titulo", "status", "resumo")
DATA_RE = re.compile(r"^\d{4}-\d{2}(-\d{2})?$")
VERSAO_RE = re.compile(r"^\d+\.\d+\.\d+$")
LINK_MD_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")


def carregar_itens(erros: list[str]) -> list[dict]:
    itens = []
    for meta in sorted(RAIZ.rglob("meta.json")):
        rel = meta.relative_to(RAIZ)
        if rel.parts[0] in IGNORAR:
            continue
        try:
            dados = json.loads(meta.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            erros.append(f"{rel}: JSON inválido ({exc})")
            continue
        dados.setdefault("tipo", PASTA_TIPO.get(rel.parts[0], "projeto"))
        dados["caminho"] = rel.parent.as_posix()
        validar(dados, rel, erros)
        itens.append(dados)
    itens.sort(key=lambda i: i.get("atualizado") or i.get("data") or "", reverse=True)
    return itens


def validar(item: dict, rel: Path, erros: list[str]) -> None:
    for campo in OBRIGATORIOS:
        if not item.get(campo):
            erros.append(f"{rel}: campo obrigatório ausente: '{campo}'")
    if item.get("tipo") not in TIPOS:
        erros.append(f"{rel}: tipo inválido '{item.get('tipo')}' (use {sorted(TIPOS)})")
    if item.get("status") and item["status"] not in STATUS:
        erros.append(f"{rel}: status inválido '{item['status']}' (use {sorted(STATUS)})")
    for campo in ("data", "atualizado"):
        if item.get(campo) and not DATA_RE.match(item[campo]):
            erros.append(f"{rel}: '{campo}' deve ser AAAA-MM-DD")
    if item.get("versao") and not VERSAO_RE.match(item["versao"]):
        erros.append(f"{rel}: 'versao' deve seguir MAJOR.MINOR.PATCH")
    if not (RAIZ / item["caminho"] / "README.md").exists():
        erros.append(f"{rel}: pasta sem README.md")


def verificar_links(erros: list[str]) -> None:
    """Confere links relativos em todos os .md (links externos não são acessados)."""
    for md in RAIZ.rglob("*.md"):
        rel = md.relative_to(RAIZ)
        if rel.parts[0] in {".git", "node_modules"}:
            continue
        texto = re.sub(r"<!--.*?-->|```.*?```", "", md.read_text(encoding="utf-8"), flags=re.S)
        for alvo in LINK_MD_RE.findall(texto):
            if re.match(r"^(https?:|mailto:|#)", alvo) or "<" in alvo:
                continue
            caminho = (md.parent / alvo.split("#")[0]).resolve()
            if not caminho.exists():
                erros.append(f"{rel}: link quebrado -> {alvo}")


def estatisticas(itens: list[dict]) -> dict:
    projetos = [i for i in itens if i["tipo"] == "projeto"]
    tecnologias = sorted({t for i in itens for t in i.get("tecnologias", [])}, key=str.lower)
    docs = [p for p in (RAIZ / "DOCUMENTACAO").rglob("*.md")]
    docs += [RAIZ / i["caminho"] / "docs" for i in itens if (RAIZ / i["caminho"] / "docs").is_dir()]
    return {
        "total": len(itens),
        "projetos": len(projetos),
        "concluidos": sum(i["status"] == "concluido" for i in itens),
        "desenvolvimento": sum(i["status"] == "desenvolvimento" for i in itens),
        "academicos": sum(i["tipo"] == "academico" for i in itens),
        "estudos": sum(i["tipo"] == "estudo" for i in itens),
        "experimentos": sum(i["tipo"] == "experimento" for i in itens),
        "portfolio": sum(bool(i.get("destaque")) for i in itens),
        "documentos": len(docs),
        "tecnologias": tecnologias,
    }


def bloco_readme(stats: dict) -> str:
    tecs = ", ".join(stats["tecnologias"]) or "—"
    return (
        "| Itens | Projetos | Concluídos | Em desenvolvimento | Acadêmicos | Estudos | Experimentos | Documentos |\n"
        "|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|\n"
        f"| {stats['total']} | {stats['projetos']} | {stats['concluidos']} | {stats['desenvolvimento']} "
        f"| {stats['academicos']} | {stats['estudos']} | {stats['experimentos']} | {stats['documentos']} |\n\n"
        f"**Tecnologias registradas:** {tecs}"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true", help="apenas valida; não escreve arquivos")
    args = parser.parse_args()

    erros: list[str] = []
    itens = carregar_itens(erros)
    verificar_links(erros)
    perfil = json.loads(PERFIL.read_text(encoding="utf-8")) if PERFIL.exists() else {}
    stats = estatisticas(itens)

    # A data de geração vem do item mais recente, para que o arquivo só mude quando o conteúdo mudar.
    gerado = max((i.get("atualizado") or i.get("data") or "" for i in itens), default=str(date.today()))
    catalogo = {"gerado": gerado, "perfil": perfil, "estatisticas": stats, "itens": itens}
    js = "// Arquivo gerado por scripts/catalogo.py — não edite manualmente.\n"
    js += "window.CATALOGO = " + json.dumps(catalogo, ensure_ascii=False, indent=2) + ";\n"

    readme = README.read_text(encoding="utf-8")
    novo_readme = re.sub(
        r"(<!-- STATS:INICIO -->)\n.*?\n?(<!-- STATS:FIM -->)",
        lambda m: f"{m.group(1)}\n{bloco_readme(stats)}\n{m.group(2)}",
        readme,
        flags=re.S,
    )

    desatualizados = []
    if not SAIDA_JS.exists() or SAIDA_JS.read_text(encoding="utf-8") != js:
        desatualizados.append(SAIDA_JS.relative_to(RAIZ).as_posix())
    if novo_readme != readme:
        desatualizados.append("README.md")

    for erro in erros:
        print(f"ERRO  {erro}")

    if args.check:
        for arq in desatualizados:
            print(f"ERRO  {arq} desatualizado — rode: python scripts/catalogo.py")
        return 1 if erros or desatualizados else 0

    SAIDA_JS.parent.mkdir(parents=True, exist_ok=True)
    SAIDA_JS.write_text(js, encoding="utf-8")
    README.write_text(novo_readme, encoding="utf-8")
    print(f"OK    {stats['total']} itens catalogados; {len(stats['tecnologias'])} tecnologias.")
    return 1 if erros else 0


if __name__ == "__main__":
    sys.exit(main())
