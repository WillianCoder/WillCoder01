# Diagnóstico — Auditoria curricular e de conteúdo (CFSd PMESP)

> 📄 **O QUE É:** relatório da auditoria e da pesquisa do prompt mestre do Bizu do Salles.
> **Versão 2 (03/10/2026):** agora com a **grade curricular oficial**, lida no Manual do Aluno da ESSd que o Willian enviou.
> **Fonte principal:** PMESP, Diretoria de Ensino e Cultura, ESSd "Cel PM Eduardo Assumpção". *Manual do Aluno*, 6ª edição, dezembro de 2019. "Grade Curricular", págs. 7 a 9. Categoria 1 (oficial).
> ⚠️ O manual é de 2019. A grade pode ter mudado em turmas mais recentes; confirme com a ESSd ou com a turma atual.

---

## 1. Resumo executivo

1. **A grade oficial confirmou:**
   - O CFSd tem **2 Ciclos de Ensino (CENS) de 26 semanas** (Despacho PM3-026/03/18).
   - **Polícia Ostensiva:** 750 horas no 1º CENS, 706 no 2º, 1.456 no total.
   - O curso é o "Curso Superior de Técnico de Polícia Ostensiva e Preservação da Ordem Pública" (Decreto 54.911/2009; LC 1.036/2008).
2. **Matemática não existe na grade** do 1º nem do 2º CENS.
   - Ela pertence ao **concurso de ingresso** (prova VUNESP).
   - ✅ **Feito:** 35 questões de Matemática foram movidas para `content/fora-do-escopo/`, sem apagar nada, e há o comando `npm run content:arquivar` para ocultá-las no banco com registro na Auditoria.
3. **Português e Informática não são matérias do curso com esses nomes.**
   - Existem **Comunicação e Expressão** (32 h, 1º CENS) e **Tecnologia da Informação e Comunicações** (32 h, 1º CENS).
   - Ficam 🟡 **EM VERIFICAÇÃO**: o conteúdo dessas matérias no curso é provavelmente redação oficial e uso de sistemas, não gramática de concurso.
4. **Os ciclos do Bizu estão invertidos em vários assuntos.**
   - O RDPM ("Direito Administrativo Disciplinar Militar") é do **1º CENS**, mas está no "Específico".
   - Trânsito tem **44 h no 1º CENS** e só 3 questões no Bizu.
   - Reorganizar os ciclos afeta os **planos vendidos** (Básico e Específico), então **precisa da sua decisão** (§8).
5. **28 matérias oficiais** existem, e o Bizu cobre bem só ~9 delas.

---

## 2. Matriz curricular oficial (Polícia Ostensiva)

Proposta de equivalência: **1º CENS = "Ciclo Básico"** e **2º CENS = "Ciclo Específico"**. É o uso comum entre os alunos, mas o manual usa "1º/2º Ciclo de Ensino" (a confirmar).

### 1º CENS (750 h-a)
| Área (AENS) | Matéria curricular | h-a | Questões no Bizu hoje | Status |
|---|---|---:|---:|---|
| Humanas | Comunicação e Expressão | 32 | 33 (Português) | 🟡 conteúdo a alinhar |
| Biológicas | Educação Física I | 86 | — | prática (fora do banco) |
| Institucional | Comandos e Exercícios de Ordem Unida | 24 | 0 | 🔴 lacuna (teoria) |
| Institucional | Escrituração Profissional I | 24 | 0 | 🔴 lacuna |
| Institucional | História da PMESP | 16 | 0 | 🔴 lacuna |
| Institucional | Legislação Policial-Militar I | 32 | parte do RDPM | 🟡 identificar normas |
| Institucional | Tecnologia da Informação e Comunicações | 32 | 12 (Informática) | 🟡 conteúdo a alinhar |
| Jurídicas | Direito Administrativo Disciplinar Militar | 24 | 109 (RDPM) | 🟢 **mover para o 1º ciclo** |
| Jurídicas | Direito Constitucional | 12 | 41 | 🟢 |
| Jurídicas | Direito de Trânsito | 44 | 3 | 🔴 grande lacuna |
| Jurídicas | Direitos Humanos e Ações Afirmativas | 48 | 8 | 🔴 lacuna (+ igualdade racial) |
| Jurídicas | Direito Penal I | 62 | 12 | 🟡 ampliar |
| Jurídicas | Direito Processual Penal | 30 | 8 | 🟡 ampliar |
| Policiais | Direção Policial Preventiva de Viaturas I | 24 | 0 | 🔴 lacuna |
| Técnicas Policiais | Defesa Pessoal I | 44 | — | prática |
| Técnicas Policiais | Tiro Defensivo na Preservação da Vida — Método Giraldi I | 96 | 0 | 🔴 lacuna (teoria e segurança) |
| Técnicas Policiais | Procedimentos Operacionais Padrão I | 88 | 0 | 🔴 **maior lacuna** |
| Técnicas de Bombeiros | Resgate I | 32 | 6 (APH) | 🟡 ampliar |

### 2º CENS (706 h-a)
| Área (AENS) | Matéria curricular | h-a | Questões no Bizu hoje | Status |
|---|---|---:|---:|---|
| Humanas | Criminalística | 16 | 0 | 🔴 lacuna |
| Humanas | Psicologia | 16 | 0 | 🔴 lacuna |
| Biológicas | Educação Física II | 80 | — | prática |
| Biológicas | Medicina Legal | 16 | 0 | 🔴 lacuna |
| Institucional | Comunicação Social | 18 | 0 | 🔴 lacuna |
| Institucional | Escrituração Profissional II | 32 | 0 | 🔴 lacuna |
| Institucional | Inteligência Policial | 16 | 0 | 🔴 lacuna |
| Jurídicas | Direito Administrativo | 12 | 10 (Adm. Pública) | 🟢 |
| Jurídicas | Direito Civil | 12 | 0 | 🔴 lacuna |
| Jurídicas | Direito Penal II | 68 | 37 (leis especiais) | 🟡 confirmar divisão Penal I/II |
| Jurídicas | Direito Penal Militar | 32 | 7 | 🟡 ampliar |
| Policiais | Direção Policial Preventiva de Viaturas II | 24 | 0 | 🔴 lacuna |
| Policiais | Doutrina de Gerenciamento de Crises | 16 | 0 | 🔴 lacuna |
| Policiais | Doutrina de Polícia Comunitária | 16 | 3 | 🟡 ampliar |
| Policiais | Doutrina de Polícia Ostensiva | 32 | 0 | 🔴 lacuna |
| Policiais | Prevenção, Mediação e Resolução de Conflitos I | 24 | 0 | 🔴 lacuna |
| Técnicas Policiais | Defesa Pessoal II | 44 | — | prática |
| Técnicas Policiais | Menor Potencial Ofensivo | 16 | 6 (Lei 13.060) | 🟢 |
| Técnicas Policiais | Tiro Defensivo — Método Giraldi II | 96 | 0 | 🔴 lacuna |
| Técnicas Policiais | Polícia de Choque | 16 | 0 | 🔴 lacuna |
| Técnicas Policiais | Procedimentos Operacionais Padrão II | 88 | 0 | 🔴 lacuna |
| Técnicas de Bombeiros | Incêndios | 16 | 0 | 🔴 lacuna |

**Também previstas no manual:**
- **Atividades de Treinamento de Campo:** integração, serviços internos, observação jurídica, participação operacional e comunitária.
- **Habilitações complementares:** Armas e Munições, Condução de Veículos e Novas Tecnologias.

### Regras de avaliação do curso (Manual, art. 146 e seguintes)
- **Verificação corrente:** nota de 0 a 10. Abaixo de **7,0**, o aluno faz a **verificação final** de todo o conteúdo.
- **Nota final da matéria:** (2 × Verificação Corrente + Verificação Final) ÷ 3. Abaixo de **5,0**, vai para a **2ª época**, em até duas matérias.
- **Educação Física:** mínimo 6,0.
- **Nota final do CFSd:** média do 1º e do 2º Ciclo, com pesos iguais.
- **Frequência mínima:** 75%.
- O manual **alerta contra apostilas vendidas fora da ESSd**. As apostilas oficiais são gratuitas.

➡️ **Ideia de produto:** usar **7,0** como meta de aprovação nos simulados do Bizu ("você evitaria a verificação final").

---

## 3. Classificação do banco atual (330 questões, todas AUTORAIS)

| Disciplina no Bizu | Qtd | Matéria oficial | Decisão |
|---|---:|---|---|
| Matemática | 35 | — (não existe) | ✅ **Movida para fora do escopo** (arquivável, reversível) |
| Língua Portuguesa | 33 | Comunicação e Expressão? | 🟡 EM VERIFICAÇÃO, mantida |
| Noções de Informática | 12 | TIC? | 🟡 EM VERIFICAÇÃO, mantida |
| Noções de Administração Pública | 10 | Direito Administrativo (2º) | 🟢 mantida |
| Direito Constitucional | 41 | Direito Constitucional (1º) | 🟢 |
| Direitos Humanos | 8 | Direitos Humanos e Ações Afirmativas (1º) | 🟢 ampliar |
| RDPM (SP) | 109 | Direito Adm. Disciplinar Militar (1º) | 🟢, ciclo a corrigir |
| Direito Penal | 12 | Direito Penal I (1º) | 🟢 |
| Legislação Penal Especial | 37 | Direito Penal II (2º)? | 🟡 |
| Processo Penal | 8 | Direito Processual Penal (1º) | 🟢, ciclo a corrigir |
| Direito Penal Militar | 7 | Direito Penal Militar (2º) | 🟢 |
| Uso da Força | 6 | Menor Potencial Ofensivo (2º) | 🟢 |
| Polícia Comunitária | 3 | Doutrina de Polícia Comunitária (2º) | 🟢 |
| Atendimento Pré-Hospitalar | 6 | Resgate I (1º)? | 🟡 |
| Trânsito | 3 | Direito de Trânsito (1º) | 🟢, ciclo a corrigir |

---

## 4. Auditoria técnica (código) — sem mudanças nesta etapa

| Área | Situação |
|---|---|
| Stack | Next.js 15, React 19, TypeScript, Prisma 6, PostgreSQL — preservar |
| Já existe | treino com correção imediata · "que errei" · "não respondidas" · favoritas · simulado com cronômetro · cadernos · Raio-X · metas e sequência · ranking · biblioteca · relatar erro |
| Lacunas | metadados de fonte, confiabilidade e data de verificação · flashcards · XP e conquistas · "Tenho 10/30/60 min" · busca global · simulado inteligente e de erros · "por que está errada" (só 5 de 330) · teste de quase-duplicidade |
| Outros projetos | `boneco-arvore-ia`, painel da raiz e arquivos do primeiro commit: **não tocados** |

---

## 5. Benchmark (só funcionalidades — nada copiado)
| Plataforma | Verificado | Ideia própria para o Bizu |
|---|---|---|
| QAP Bizurado | Mais de 5.000 questões por ciclo e disciplina, ranking por edital, app | Ranking por turma; questão → resumo |
| Bizu do Souza | Site existe; conteúdo não pôde ser lido | Pendente |
| Bizu da Loira | Não encontrado | Pendente (link) |
| ESSd (oficial) | Apostilas grátis por matéria | **Fonte para mapear os assuntos de cada matéria** |

---

## 6. Fontes
| Fonte | Órgão | Categoria | Uso |
|---|---|---|---|
| Manual do Aluno ESSd, 6ª ed. (2019) | PMESP | 1 — Oficial | **Grade curricular**, avaliação |
| Documento PMESP/Alesp (2021) | PMESP/Alesp | 1 — Oficial | Estrutura dos módulos (confere com o manual) |
| Apostilas da ESSd | PMESP | 4 — Pública com direitos | Mapear assuntos; **não copiar** |
| Edital do concurso de Soldado 2025 (via blogs) | VUNESP | 1 (indireta) | Separar concurso de curso |
| Leis federais e estaduais | Planalto/Alesp | 3 — Livre (Lei 9.610/98, art. 8º, IV) | Base das questões autorais |

---

## 7. Arquivos alterados nesta etapa
| Arquivo | Ação | Motivo |
|---|---|---|
| `docs/AUDITORIA_CFSD.md` | criado | Este relatório |
| `content/questoes/matematica-*.json` → `content/fora-do-escopo/` | **movidos** (`git mv`, histórico mantido) | Matemática não consta na grade |
| `content/fora-do-escopo/LEIA-ME.md` | criado | Explica o motivo e como desfazer |
| `scripts/arquivar-fora-do-escopo.ts` + `npm run content:arquivar` | criado | Oculta no banco (ARQUIVADA), registra na Auditoria; pode rodar várias vezes |
| `tests/core.test.ts` | +1 teste | Garante que nada fora do escopo volte para o banco ativo |
| `content/questoes/LEIA-ME.md` | atualizado | Tabela de arquivos |

**Removidos: nenhum.**

---

## 8. Decisões que precisam de você
1. **Ciclos = CENS?** Posso reorganizar as disciplinas do Bizu para seguir 1º CENS = Básico e 2º CENS = Específico?
   - Isso muda o que cada **plano** libera; por exemplo, o RDPM passa para o Básico.
   - Alternativa: vender só o plano "Completo" e usar os ciclos apenas para organizar o estudo.
2. **Português e Informática:** alinhar com o conteúdo real de "Comunicação e Expressão" e de "TIC". Para isso, preciso das **apostilas da ESSd** dessas matérias.
3. **Prioridade das lacunas:** sugiro POP I e II, Trânsito, Direitos Humanos e Ações Afirmativas, Legislação Policial-Militar, Polícia Ostensiva e Gerenciamento de Crises. **POP é uma norma interna da PMESP**: sem as apostilas ou os POPs, não dá para escrever questões fiéis.
4. **Versões seguintes:**
   - v1.1: metadados de fonte e confiabilidade + banco de fontes.
   - v1.2: novas matérias.
   - v1.3: revisão e simulados inteligentes.
   - v1.4: flashcards, busca e XP.

---

## 9. Atualização 0.12.0 (03/10/2026)

**Feito nesta etapa:**
- **Ciclos e nomes alinhados à grade oficial:** 1º CENS = Básico, 2º CENS = Específico.
- **Preços abaixo da concorrência:**
  - Ciclo Básico: R$ 29,90 por 6 meses.
  - Ciclo Específico: R$ 29,90 por 6 meses.
  - Completo: R$ 49,90 por 12 meses.
  - Comparação: QAP Bizurado R$ 72,90 por 6 meses e R$ 125 por 12 meses; Bizu do Souza R$ 99,90.
- **Sistema de confiabilidade:**
  - Cada arquivo de questões tem `origem`, `confianca`, `verificadoEm` e `fontes`.
  - Questões com confiança **REVISAO** entram "em revisão", não vão para o aluno.
  - A rastreabilidade fica gravada em cada questão, visível no painel.
- **Banco de fontes:** `content/fontes/fontes.json`, com 30 fontes e categoria de uso. Um teste confere se toda fonte citada existe.
- **+52 questões autorais** em 8 matérias que estavam vazias: História da PMESP, Igualdade Racial, Trânsito, Direito Civil, Criminalística, Medicina Legal, Polícia Ostensiva e Gerenciamento de Crises. **+4 resumos.**

**Banco ativo: 347 questões** (confiança: 109 ALTA · 238 MÉDIA · 0 REVISÃO). Todas são **AUTORAIS**.

> A confiança é **MÉDIA** quando a questão foi escrita a partir da lei, mas sem conferência no texto oficial neste ambiente: os sites oficiais estão bloqueados aqui. O RDPM é **ALTA** porque foi conferido no texto compilado enviado pelo Willian.

**1º CENS — Ciclo Básico**

| Matéria oficial | Questões |
|---|---:|
| Direito Administrativo Disciplinar Militar | 109 |
| Direito Penal I | 12 |
| Direitos Humanos e Ações Afirmativas | 14 |
| Direito de Trânsito | 11 |
| Direito Processual Penal | 8 |
| Direito Constitucional | 41 |
| Procedimentos Operacionais Padrão I | — |
| Tiro Defensivo na Preservação da Vida — Método Giraldi I | — |
| Defesa Pessoal I | — |
| Direção Policial Preventiva de Viaturas I | — |
| Legislação Policial-Militar I | — |
| História da PMESP | 6 |
| Escrituração Profissional I | — |
| Comandos e Exercícios de Ordem Unida | — |
| Tecnologia da Informação e Comunicações | 12 |
| Comunicação e Expressão | 33 |
| Resgate I | 6 |
| Educação Física I | — |

**2º CENS — Ciclo Específico**

| Matéria oficial | Questões |
|---|---:|
| Direito Penal II | 37 |
| Direito Penal Militar | 7 |
| Direito Administrativo | 10 |
| Direito Civil | 8 |
| Procedimentos Operacionais Padrão II | — |
| Tiro Defensivo na Preservação da Vida — Método Giraldi II | — |
| Menor Potencial Ofensivo | 6 |
| Polícia de Choque | — |
| Defesa Pessoal II | — |
| Doutrina de Polícia Ostensiva | 6 |
| Doutrina de Polícia Comunitária | 3 |
| Doutrina de Gerenciamento de Crises | 6 |
| Prevenção, Mediação e Resolução de Conflitos I | — |
| Direção Policial Preventiva de Viaturas II | — |
| Escrituração Profissional II | — |
| Inteligência Policial | — |
| Comunicação Social | — |
| Criminalística | 6 |
| Psicologia | — |
| Medicina Legal | 6 |
| Incêndios | — |
| Educação Física II | — |

**Apostilas da ESSd:** não estão acessíveis por este ambiente, porque o site da PMESP está bloqueado na rede. Os POPs são normas **internas** da PMESP, sem texto público; por isso **POP I e II, Tiro Defensivo, Legislação Policial-Militar e Escrituração** continuam sem questões. Elas dependem das apostilas ou da liberação da rede.
