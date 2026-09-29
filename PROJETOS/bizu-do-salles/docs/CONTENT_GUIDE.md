# Guia de conteúdo

## Regra de direitos autorais (obrigatória)
O Bizu do Salles publica **somente**:
- conteúdo **original** escrito por nós;
- **textos de leis, decretos e atos oficiais** (não protegidos — Lei 9.610/98, art. 8º, IV) como base de questões e resumos;
- material de terceiros com **autorização escrita** ou licença que permita uso comercial (registrar em `sourceLicense`).

**Proibido:** baixar PDFs, apostilas, questões ou áudios de outros cursos/sites (mesmo gratuitos), remover marca d'água, trocar a marca ou reescrever/parafrasear as questões deles. "Estar grátis na internet" não dá direito de uso comercial. Sites de concorrentes servem só para entender quais **assuntos** são cobrados; a questão é escrita do zero a partir da lei.

## Como adicionar questões
1. Crie ou edite um arquivo em `content/questoes/` (um por disciplina + assunto), seguindo os existentes.
2. Cada questão: `code` único (`SIGLA-ASSUNTO-000`), enunciado, alternativas A–E sem repetição, `correct`, `explanation`, `whyWrong` (opcional), `reference` com artigo exato. **Nunca invente referência.**
3. Rode `npm test` — valida formato, códigos repetidos e alternativas duplicadas.
4. Rode `npm run db:seed` — questões novas entram; as já existentes não são sobrescritas.

## Meta de 500 questões
Distribuição sugerida (ajustável ao currículo do estado alvo): Constitucional 80, Direitos Humanos 50, Administrativo 50, Penal/Processo Penal 60, Penal Militar 40, Legislação da PM/Estatuto 60, Português 70, Matemática 30, Informática 30, História/Geografia 30.
Fontes oficiais para basear: Constituição Federal, Código Penal, CPP, Código Penal Militar, Lei 13.869/19 (abuso de autoridade), Lei 9.455/97 (tortura), ECA, Estatuto do Desarmamento, estatuto e regulamento disciplinar da PM do estado — todos em planalto.gov.br ou no diário oficial do estado.
