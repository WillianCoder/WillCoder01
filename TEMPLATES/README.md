# 🧩 Templates

Modelos reutilizáveis. **Não edite diretamente para criar conteúdo** — use o gerador, que copia o modelo para a pasta certa:

```bash
python scripts/novo.py projeto "Nome"        # -> PROJETOS/nome/
python scripts/novo.py academico "Tema" --disciplina "Disciplina" --semestre 2026-2
python scripts/novo.py estudo "Assunto"      # -> ESTUDOS/assunto/
python scripts/novo.py experimento "Teste"   # -> EXPERIMENTOS/<ano>/teste/
```

| Modelo | Uso |
|---|---|
| [`projeto/`](projeto/) | Novo projeto (README, meta.json, CHANGELOG, docs, src, tests…) |
| [`academico/`](academico/) | Novo trabalho acadêmico |
| [`estudo/`](estudo/) | Novo estudo / curso |
| [`experimento/`](experimento/) | Novo experimento |
| [`documentacao.md`](documentacao.md) | Nova documentação avulsa |
| [`versao.md`](versao.md) | Nova entrada de versão no CHANGELOG |
| Nova tarefa | Use a aba *Issues* do GitHub (modelo "Tarefa") |
