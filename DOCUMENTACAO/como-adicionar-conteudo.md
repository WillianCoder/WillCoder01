# Como adicionar conteúdo

Fluxo sempre igual, em 4 passos:

```bash
python scripts/novo.py <tipo> "Nome"   # 1. cria a pasta a partir do template
# 2. preencha meta.json e README.md; coloque seus arquivos nas subpastas
python scripts/catalogo.py             # 3. valida e atualiza painel + README
git add . && git commit -m "feat(projetos): adiciona Nome"   # 4. versiona
```

| Tipo | Comando | Destino |
|---|---|---|
| Projeto | `python scripts/novo.py projeto "Nome"` | `PROJETOS/nome/` |
| Trabalho acadêmico | `python scripts/novo.py academico "Tema" --disciplina "Disciplina" --semestre 2026-2` | `ACADEMICO/2026-2/disciplina/tema/` |
| Estudo | `python scripts/novo.py estudo "Assunto"` | `ESTUDOS/assunto/` |
| Experimento | `python scripts/novo.py experimento "Nome"` | `EXPERIMENTOS/<ano>/nome/` |
| Documento | copie [`TEMPLATES/documentacao.md`](../TEMPLATES/documentacao.md) | `DOCUMENTACAO/` |
| Nova versão | copie [`TEMPLATES/versao.md`](../TEMPLATES/versao.md) para o topo do CHANGELOG | — |

## Regras
1. **Nunca apague** — mova para `ARQUIVO/` e use `status: arquivado`.
2. Arquivos recebidos (trabalhos, PDFs, código) são **preservados como vieram**; organize ao redor deles.
3. Imagens vão em `screenshots/` ou `assets/`, com nome descritivo e texto alternativo no README. Prefira PNG/WebP com menos de 500 KB.
4. Nada de senhas, tokens ou dados pessoais — use `.env.example` (veja [SECURITY](../SECURITY.md)).
5. Para entrar no portfólio: `"destaque": true` + bloco `portfolio` preenchido.
6. Não tem Python? Copie a pasta do template à mão; o CI valida no GitHub.
