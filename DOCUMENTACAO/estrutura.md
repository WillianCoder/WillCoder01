# Estrutura de pastas

```
WillCoder01/
├── index.html            # painel (abre direto no navegador)
├── perfil.json           # seus dados públicos (nome, links, interesses)
├── site/                 # código do painel (CSS, JS, catálogo gerado)
├── scripts/              # catalogo.py (estatísticas/validação) e novo.py (novos itens)
├── PROJETOS/             # projetos de desenvolvimento e pessoais
├── ACADEMICO/<ano-sem>/<disciplina>/<trabalho>/
├── ESTUDOS/<assunto>/
├── EXPERIMENTOS/<ano>/<nome>/
├── PORTFOLIO/            # explica o critério; os itens vêm de "destaque": true
├── DOCUMENTACAO/         # você está aqui
├── RECURSOS/             # imagens, diagramas, materiais reutilizáveis
├── ARQUIVO/              # itens encerrados (nada é apagado)
├── TEMPLATES/            # modelos usados por scripts/novo.py
└── .github/              # CI, templates de issue e pull request
```

## Decisões de arquitetura
- **Uma pasta por item, um `meta.json` por pasta.** É a única fonte de verdade: o painel, o dashboard e a tabela do README são gerados a partir dele. Nenhum número é digitado à mão.
- **Tecnologia é etiqueta, não pasta.** Pastas como `/PYTHON`, `/IA` ou `/AUTOMACAO` obrigariam a duplicar um projeto que usa Python *e* IA. Em vez disso, o campo `tecnologias`/`categoria` alimenta a busca e os filtros.
- **Portfólio é uma vitrine, não uma cópia.** `"destaque": true` basta.
- **Arquivo em vez de exclusão.** Itens antigos vão para `ARQUIVO/` com `status: arquivado`.
- **Arquivos originais do primeiro commit** (`gato.html`, `style.css`, `script.js`, `desktop.ini`) permanecem na raiz, intactos. Ver [registro](../EXPERIMENTOS/2024/primeira-pagina-web/README.md).
