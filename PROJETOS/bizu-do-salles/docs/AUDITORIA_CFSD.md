# Diagnóstico — Auditoria curricular e de conteúdo (CFSd PMESP)

> 📄 **O QUE É:** relatório da Etapa 1 (auditoria + pesquisa) do prompt mestre do Bizu do Salles.
> Nenhum arquivo, questão ou disciplina foi apagado ou alterado para produzir este documento.
> ⚠️ **Data da pesquisa:** 03/10/2026. As fontes oficiais estavam **bloqueadas para leitura direta** neste ambiente (Alesp, PMESP, Planalto, CEE-SP); só os resumos do buscador estavam disponíveis. Por isso, várias conclusões estão marcadas como **EM VERIFICAÇÃO**.

---

## 1. Resumo executivo

1. **Achado principal:** o curso de formação (CFSd) e o **concurso de ingresso** (prova VUNESP) são coisas diferentes, e o Bizu hoje mistura os dois.
   - O concurso cobra Português, Matemática, Conhecimentos Gerais, Informática e Administração Pública.
   - Os documentos públicos do **curso** citam Direitos Humanos, Direito Penal e Penal Militar, Direito Civil, Direito Administrativo, Sociologia, Psicologia, Telecomunicações, Tiro Defensivo, Educação Física, Polícia Comunitária e outras. Matemática e Português não aparecem.
2. **Os nomes "Ciclo Básico" e "Ciclo Específico"** do Bizu não correspondem aos **módulos oficiais**:
   - Módulo Básico: 984 h-a, 25 semanas, na ESSd.
   - Módulo Específico: 976 h-a, 25 semanas, nas unidades.

   Hoje o RDPM está classificado como "Específico" e a Matemática como "Básico". Isso precisa ser revisto com a grade oficial.
3. **A própria PMESP oferece as apostilas do CFSd de graça** no site da ESSd e alerta que não autoriza nenhuma empresa a vender material didático. Essa é a melhor fonte para mapear o conteúdo, mas não para copiar (ver §7).
4. **O código já tem boa parte do que o prompt pede:**
   - treino com correção imediata;
   - filtros "que errei", "não respondidas", "favoritas" e "revisar";
   - simulado com cronômetro;
   - cadernos;
   - Raio-X por disciplina;
   - ranking;
   - metas e sequência de estudos;
   - biblioteca de resumos.

   **Faltam:** metadados de fonte e confiabilidade, flashcards, XP e conquistas, modo "Tenho 10 minutos", busca global, simulado inteligente e de erros, e "por que errei" completo (só 5 de 330 questões explicam as alternativas erradas).
5. **Bloqueio para fechar a matriz curricular:** preciso do **Manual do Aluno da ESSd** (que tem a "Grade Curricular") ou da liberação de rede (§10).

---

## 2. Auditoria técnica (código)

| Área | Situação | Classificação |
|---|---|---|
| Stack | Next.js 15, React 19, TypeScript, Prisma 6, PostgreSQL | A — preservar |
| Autenticação | Argon2id, sessão única com hash, limite de tentativas | A — preservar |
| Questões | Treino com correção imediata, embaralhamento por aluno, relatar erro, favoritar | A — melhorar |
| Filtros | Não respondidas · Que errei · Favoritas · Revisar depois · Todas | A — base do "Modo só erros" |
| Simulados | Montagem por filtro, disciplina ou caderno; cronômetro; correção comentada | A — ampliar (inteligente, de erros, por tema) |
| Desempenho | Raio-X por disciplina (forte, fraco, recomendações) e sequência de estudos | A — ampliar (🔥/⚠️/✅/🔄 por tema) |
| Biblioteca | Resumos com formatação segura, áudio, PDF | A — preservar |
| Gamificação | Meta diária e ranking opcional; **sem** XP, níveis ou conquistas | Lacuna |
| Flashcards | Não existe | Lacuna |
| Busca global | Não existe (há filtros na tela de questões) | Lacuna |
| Mobile | Barra inferior no celular; testes em 360 px sem rolagem lateral | A — preservar |
| Qualidade | 26 testes de regras, 18 de navegador, CI no GitHub | A — preservar |
| Outros projetos | `boneco-arvore-ia`, painel da raiz, arquivos do primeiro commit | **B — não tocar** |

**Arquivos a remover: nenhum.** Não encontrei arquivo comprovadamente obsoleto (categoria E) no Bizu.

---

## 3. Banco de questões atual (330)

| Ciclo atual | Disciplina | Qtd | Escopo do **curso** (CFSd) |
|---|---|---:|---|
| BÁSICO | Língua Portuguesa | 33 | 🔴 Concurso de ingresso (não encontrado na grade do curso) — EM VERIFICAÇÃO |
| BÁSICO | Matemática | 35 | 🔴 Concurso de ingresso — EM VERIFICAÇÃO |
| BÁSICO | Noções de Informática | 12 | 🔴 Concurso de ingresso — EM VERIFICAÇÃO |
| BÁSICO | Noções de Administração Pública | 10 | 🟡 Há "Direito Administrativo" no Módulo Básico |
| BÁSICO | Direito Constitucional | 30 | 🟡 Provável (base de DH e Direito Administrativo) |
| BÁSICO | Direitos Humanos | 8 | 🟢 Citado em fonte oficial (Alesp/ESSd) |
| ESPECÍFICO | RDPM (SP) | 109 | 🟢 Legislação institucional da PMESP |
| ESPECÍFICO | Legislação Penal Especial | 37 | 🟡 Provável (dentro de "Direito Penal e Penal Militar") |
| ESPECÍFICO | Direito Penal | 12 | 🟢 "Direito Penal e Penal Militar" citado |
| ESPECÍFICO | Direito Penal Militar | 7 | 🟢 Idem |
| ESPECÍFICO | Processo Penal | 8 | 🟡 Provável |
| ESPECÍFICO | Direito Constitucional (Seg. Pública/Militares) | 11 | 🟡 Provável |
| ESPECÍFICO | Uso da Força e DH | 6 | 🟢 Ligado a POP e Tiro Defensivo (Método Giraldi) |
| ESPECÍFICO | Polícia Comunitária | 3 | 🟢 Objetivo oficial do curso |
| ESPECÍFICO | Atendimento Pré-Hospitalar | 6 | 🟡 Provável |
| ESPECÍFICO | Legislação de Trânsito | 3 | ⚪ Não conclusivo |

- Dificuldade: 80 fáceis · 173 médias · 77 difíceis.
- **Todas as 330 são QUESTÃO AUTORAL** (criadas pelo Bizu a partir da lei). Nenhuma é cópia de prova, nem pode ser apresentada como "questão real".

**Duplicidade:** os testes já bloqueiam código repetido e alternativas iguais. Similaridade de enunciado entre arquivos ainda não é verificada (lacuna, §9).

---

## 4. Matriz curricular — o que a pesquisa confirmou

**Estrutura oficial (fonte: documento PMESP enviado à Alesp em 2021):**
- 2 módulos, 1.960 horas-aula de 45 minutos, mais estágio supervisionado.
- **Módulo Básico:** 984 h-a (25 semanas).
- **Módulo Específico:** 976 h-a (25 semanas).
- Objetivos: formar o soldado para o policiamento ostensivo e para atuar conforme os procedimentos do **policiamento comunitário**.

| Disciplina | Existe no CFSd? | Fonte | Carga | Status |
|---|---|---|---|---|
| Direitos Humanos | Sim | Alesp 2021; Manual do Aluno ESSd | 75 h | 🟢 |
| Direito Penal e Penal Militar | Sim | Alesp 2021 | 85 h | 🟢 |
| Direito Civil | Sim | Alesp 2021 | 10 h | 🟢 — **sem questões no Bizu** |
| Direito Administrativo | Sim | Alesp 2021 | 15 h | 🟢 |
| Sociologia | Sim | Alesp 2021 | 20 h | 🟢 — **sem questões** |
| Psicologia e Dinâmica de Grupo | Sim | Alesp 2021 | 20 h | 🟢 — **sem questões** |
| Telecomunicações | Sim | Alesp 2021 | 30 h | 🟢 — **sem questões** |
| Tiro Defensivo na Preservação da Vida (Método Giraldi) | Sim | Alesp 2021; Manual do Aluno | 80 h | 🟢 — prática; cabe teoria e normas |
| Educação Física | Sim | Alesp 2021 | 150 h | 🟢 — prática (fora do banco de questões) |
| Igualdade Racial e Ações Afirmativas | Sim | Manual do Aluno ESSd (via buscador) | ? | 🟢 — **sem questões** |
| Polícia Comunitária | Sim (objetivo do curso) | Alesp 2021 | ? | 🟢 |
| Inteligência policial, ciências criminais, defesa pessoal | Citadas como exemplos ("quase 50 disciplinas") | Notícia Alesp | ? | 🟡 |
| POP, abordagem, uso da força, APH | Comuns em CFSd de outros estados; PMESP é pioneira em POP | Fontes de outras PMs | ? | 🟡 — **confirmar na grade SP** |
| Língua Portuguesa / Matemática / Informática | **Não** encontradas na grade do curso | Edital do **concurso** VUNESP 2025 | — | 🔴 Concurso, EM VERIFICAÇÃO |

> Regra seguida: "não encontrei" ≠ "não cai". Matemática **não foi removida**. Ela fica marcada como EM VERIFICAÇÃO até ser conferida no Manual do Aluno.

---

## 5. Benchmark (só referência funcional — nada copiado)

| Plataforma | O que foi possível verificar | Ideias para o Bizu (implementação própria) |
|---|---|---|
| QAP Bizurado | Videoaulas, mais de 5.000 questões, resumos, simulados; separação Ciclo Básico/Específico por disciplina; ranking em tempo real por edital; app Android/iOS | Ranking por **turma**; questões ligadas a resumos; app (PWA já existe) |
| Bizu do Souza | O site existe (bizudosouza.com.br), mas o conteúdo não pôde ser lido | Benchmark pendente (§10) |
| Bizu da Loira | Não encontrado pelo buscador | Pendente: preciso do link |
| ESSd (oficial) | Apostilas grátis e Manual do Aluno; alerta contra venda de material | **Fonte primária** de mapeamento de assuntos |

---

## 6. Fontes consultadas

| Fonte | Órgão | Categoria | Uso |
|---|---|---|---|
| Documento PMESP/Alesp 2021 (estrutura do CFSd, módulos, cargas) — al.sp.gov.br | PMESP/Alesp | 1 — Oficial | Estrutura e disciplinas |
| Manual do Aluno ESSd (6ª ed., 2019) — policiamilitar.sp.gov.br/unidades/essd | PMESP | 1 — Oficial | Grade curricular (**ler na íntegra**) |
| Apostilas CFSd — site da ESSd | PMESP | 4 — Pública com direitos | Mapear assuntos; **não copiar** |
| Notícia "formatura ESSd" — al.sp.gov.br | Alesp | 1 — Oficial | "Quase 50 disciplinas", exemplos |
| Pareceres CEE-SP 142/2017 e 443/2018 | CEE-SP | 1 — Oficial | Curso superior de tecnologia (ementa a confirmar) |
| Dissertação R. S. Luiz (PUC-SP, 2003) | Acadêmica | 4 | Histórico do currículo |
| Edital Soldado PM-SP 2025 (via blogs) | VUNESP/PMESP | 1 (indireta) | Distinguir **concurso** de **curso** |
| Leis federais e estaduais citadas nas questões | Planalto/Alesp | 3 — Domínio público (art. 8º, IV, Lei 9.610/98) | Base das questões autorais |

---

## 7. Direitos autorais — regras aplicadas

- **Texto de lei e atos oficiais:** livres (Lei 9.610/98, art. 8º, IV). São a base das questões.
- **Apostilas da ESSd:** são gratuitas, mas isso não autoriza republicar. Uso apenas para identificar assuntos; o conteúdo do Bizu é reescrito do zero a partir da lei.
- **Concorrentes:** só análise de funcionalidades. Nenhum texto, questão, resumo, imagem ou layout copiado.
- **Provas anteriores (VUNESP/PM):** não reproduzir. Usar como "QUESTÃO BASEADA EM PROVA" (questão nova sobre o mesmo tema).

---

## 8. O que será preservado, melhorado e criado

**Preservado:** todo o código, todas as 330 questões, os resumos, os outros projetos do repositório e os arquivos do primeiro commit.

**Melhorias propostas (incrementais, cada uma em uma versão):**

| Versão | Entrega | Precisa de confirmação? |
|---|---|---|
| v1.0.0 | **Tag de backup** do estado atual | Não |
| v1.1.0 — Auditoria curricular | Metadados por questão: `origem` (AUTORAL / BASEADA EM PROVA / OFICIAL), `confiabilidade` (🟢/🟡/🔴), `lei/artigo/inciso/parágrafo`, `dataVerificacao`, `statusLegislacao`, `subtema`, `tipo` (memorização, caso prático…), `tags`; **banco de fontes** (`content/fontes/`); questões 🔴 ocultas para alunos | Sim (migração de banco) |
| v1.1.0 | Área **"Concurso de ingresso"** separada do CFSd para Português, Matemática e Informática (move, **não apaga**) | **Sim — decisão sua** |
| v1.2.0 — Banco de questões | Novas disciplinas confirmadas (Direito Civil, Sociologia, Psicologia, Telecomunicações, Igualdade Racial, Tiro Defensivo — teoria); "por que está errada" em todas as alternativas; teste de quase-duplicidade | Não |
| v1.3.0 — Revisão e simulados | "Por que errei?" completo; Simulado de Erros, Inteligente e por Tema; "Tenho 10/30/60 minutos"; mapa 🔥/⚠️/✅/🔄 por tema | Não |
| v1.4.0 — Estudo ativo | Flashcards com repetição espaçada; busca global; XP, níveis e conquistas | Não |

---

## 9. Lacunas e riscos

1. Sem a grade oficial completa, a divisão Básico/Específico do Bizu pode estar invertida em alguns assuntos.
2. 325 de 330 questões não explicam cada alternativa errada.
3. Não existe data de verificação legislativa por questão. Leis mudam: Maria da Penha em 2024, Estatuto do Desarmamento em 2019.
4. Não há verificação automática de enunciados quase duplicados.
5. Disciplinas oficiais sem nenhuma questão: Direito Civil, Sociologia, Psicologia, Telecomunicações e Igualdade Racial.

---

## 10. O que preciso para fechar a matriz

1. **Manual do Aluno da ESSd** (PDF) e a **lista de apostilas** do site da ESSd: baixe e me envie aqui; **ou**
2. libere na rede do ambiente estes domínios:
   - `policiamilitar.sp.gov.br`
   - `al.sp.gov.br`
   - `planalto.gov.br`
   - `ceesp.sp.gov.br`
   - `bizudosouza.com.br`
   - `qapbizurado.com.br`
3. O **link do Bizu da Loira**.
4. Sua decisão sobre Português, Matemática e Informática (§8).
