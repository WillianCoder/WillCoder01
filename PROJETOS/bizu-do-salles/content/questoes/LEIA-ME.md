# 📚 Pasta de questões

📄 **O que é:** cada arquivo `.json` aqui é um **bloco de questões** de uma disciplina + assunto. Ao rodar `npm run db:seed`, as questões novas entram no banco (as já existentes não são alteradas).

✏️ **Como editar/adicionar:**
- **Mais fácil:** use o painel (Admin → Questões → *Nova questão*). Não precisa mexer aqui.
- **Em lote:** copie um arquivo existente, renomeie (ex.: `sp-cesp-01-seguranca.json`) e troque o conteúdo. Cada questão precisa de: `code` único (ex.: `CESP-SEG-001`), `statement` (enunciado), `options` A–E, `correct` (letra), `explanation` (mínimo 20 caracteres), `reference` (artigo exato).
- `"state": "SP"` no topo = só alunos de SP veem. Sem `state` = nacional.
- `"cycle"`: `"BASIC"` (Ciclo Básico) ou `"SPECIFIC"` (Ciclo Específico).

⚠️ **Cuidado:** depois de editar, rode `npm test` — ele avisa se faltou vírgula, se há código repetido ou alternativas iguais. Nunca copie questões de outros cursos (ver `docs/CONTENT_GUIDE.md`).

| Prefixo do arquivo | Conteúdo |
|---|---|
| `cf88-*` | Constituição Federal |
| `lei-*`, `dudh-*` | Leis federais e Direitos Humanos |
| `portugues-*` | Língua Portuguesa (ver Comunicação e Expressão na grade) |
| `sp-rdpm-01` … `08` | Regulamento Disciplinar da PM de SP (por capítulo) |
| `portugues-vunesp-estilo` | Português no estilo VUNESP (escopo em verificação) |
| `informatica-nocoes`, `administracao-publica` | Noções de Informática e de Administração Pública |
| `cp-*`, `cpp-*`, `cpm-*` | Direito Penal, Processo Penal e Penal Militar |
| `lei-10826-*`, `lei-11340-*`, `lei-11343-*`, `lei-13060-*`, `eca-*`, `ctb-*` | Leis especiais da rotina policial |
| `aph-*`, `policia-comunitaria`, `direitos-humanos-*` | Primeiros socorros, polícia comunitária e direitos humanos |
| ~~`matematica-*`~~ | Movidos para `content/fora-do-escopo/` (não constam na grade do CFSd) |
| `historia-pmesp`, `dh-igualdade-racial`, `ctb-normas-gerais`, `direito-civil-*`, `criminalistica-*`, `medicina-legal-*`, `policia-ostensiva-*`, `gerenciamento-de-crises` | Matérias da grade oficial (0.12.0) |

## Campos de rastreabilidade (obrigatórios em arquivos novos)
- `"origem"`: `AUTORAL` (criada do zero) · `BASEADA_EM_PROVA` (nova, inspirada no tema de uma prova) · `OFICIAL` (reprodução autorizada).
- `"confianca"`: `ALTA` (conferida no texto oficial vigente) · `MEDIA` (precisa de revisão) · `REVISAO` (não vai para o aluno).
- `"verificadoEm"`: data da conferência da lei (AAAA-MM-DD).
- `"fontes"`: ids de `content/fontes/fontes.json`.
- `"subject"` precisa ser o nome de uma matéria de `src/config/grade.ts`, no ciclo certo.
