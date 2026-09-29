# Como contribuir / manter o repositório

Este é um repositório pessoal; este guia existe para manter o padrão ao longo dos anos.

1. **Preservar:** nada é apagado — itens encerrados vão para `ARQUIVO/` com `status: arquivado`.
2. **Criar pelo template:** `python scripts/novo.py <tipo> "Nome"` ([guia](DOCUMENTACAO/como-adicionar-conteudo.md)).
3. **Validar:** `python scripts/catalogo.py` antes de cada commit (o CI roda `--check`).
4. **Versionar:** SemVer + CHANGELOG ([padrões](DOCUMENTACAO/padroes.md)).
5. **Commits:** Conventional Commits, ex. `feat(projetos): adiciona API de tarefas`.
6. **Segurança:** leia [SECURITY.md](SECURITY.md).

Sugestões externas são bem-vindas via issue.
