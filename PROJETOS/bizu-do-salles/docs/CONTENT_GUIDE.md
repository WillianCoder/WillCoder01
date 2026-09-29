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

## Conteúdo nacional e estadual
O Bizu do Salles atende **todos os estados**. O aluno escolhe a UF no cadastro.
- **Nacional** (sem `state` no arquivo): Constituição Federal, leis federais, Português, Matemática etc. Aparece para todos.
- **Estadual** (`"state": "SP"` no arquivo): constituição estadual, estatuto, regulamento disciplinar e normas da PM daquele estado. Aparece só para alunos da UF (`src/core/states.ts`).

Nome de arquivo sugerido: `sp-rdpm-transgressoes.json`, `mg-estatuto-deveres.json`.

### Primeiro estado: São Paulo
Fontes oficiais para as questões de SP, a conferir sempre no texto consolidado da Alesp (al.sp.gov.br):
- Constituição do Estado de São Paulo (1989), capítulo da segurança pública;
- Lei Complementar nº 893/2001 — Regulamento Disciplinar da Polícia Militar (RDPM);
- demais leis e decretos da PMESP indicados no edital/currículo do curso.

Regra: só escrever questão estadual com o texto oficial vigente em mãos (as leis mudam; confira alterações posteriores).

## Plano de conteúdo — foco São Paulo (PMESP)
Status em 29/09/2026: **178 questões** — 69 nacionais + **109 de SP (RDPM completo)**.

| Bloco | Base legal (texto oficial) | Abrangência | Status |
|---|---|---|---|
| Constituição Federal (direitos fundamentais, adm. pública, nacionalidade, militares, segurança pública) | CF/88 | Nacional | ✅ 35 |
| Direitos Humanos | DUDH (1948); depois Pacto de San José (Dec. 678/1992) | Nacional | ✅ 5 |
| Tortura, Abuso de Autoridade | Lei 9.455/97; Lei 13.869/19 | Nacional | ✅ 11 |
| Português, Matemática | Conteúdo próprio | Nacional | ✅ 18 |
| Código Penal, CPP, Código Penal Militar, CPPM | Decretos-Leis 2.848/40, 3.689/41, 1.001/69, 1.002/69 | Nacional | ⏳ |
| ECA, Estatuto do Desarmamento, Maria da Penha, Lei de Drogas | Leis 8.069/90, 10.826/03, 11.340/06, 11.343/06 | Nacional | ⏳ |
| Constituição do Estado de SP — segurança pública e servidores militares | CE-SP/1989 | SP | ⏳ precisa texto |
| Regulamento Disciplinar da PM (RDPM) — todos os 14 capítulos | LC 893/2001, texto compilado Alesp (atualizado até a Lei 18.442/2026) | SP | ✅ 109 |
| Demais normas das aulas internas (estatuto, polícia comunitária, POP etc.) | Conforme ementa do curso | SP | ⏳ precisa ementa |

### Uso de material gratuito da internet
Apostilas e questões de cursos (mesmo gratuitas) servem **apenas como mapa de assuntos**: quais artigos e temas são mais cobrados nas aulas internas. Nenhum texto, questão, imagem ou arquivo delas é copiado, parafraseado ou redistribuído. Cada questão do Bizu é escrita do zero a partir da lei, com o artigo em `reference`.

### Controles automáticos de qualidade (`npm test` / `npm run content:report`)
- esquema, códigos únicos, alternativas sem repetição, fonte/licença obrigatória;
- nenhuma letra com mais de 35% dos gabaritos;
- relatório por ciclo, disciplina, dificuldade, abrangência e letra.

### Registro de fontes oficiais usadas
| Norma | Fonte | Versão conferida | Data |
|---|---|---|---|
| LC 893/2001 (RDPM) | Alesp — texto compilado | Última atualização: Lei 18.442, de 02/04/2026 (inclui LC 915/2002) | 29/09/2026 |
| LC 893/2001 (RDPM) | PMESP — PDF de downloads (conferência) | Texto original | 29/09/2026 |

As 26 questões de classificação (G/M/L) do art. 13 foram conferidas automaticamente contra o texto oficial (132 itens): nenhuma divergência.
**Quando a lei mudar:** atualize esta tabela, revise as questões do artigo alterado (busque pela referência) e registre no CHANGELOG.
