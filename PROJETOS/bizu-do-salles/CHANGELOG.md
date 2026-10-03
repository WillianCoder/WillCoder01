# Changelog — Bizu do Salles

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), versões [SemVer](https://semver.org/lang/pt-BR/).

## [0.11.0] — 2026-10-03
### Alterado
- **Ciclos alinhados à grade oficial:** 1º CENS = Ciclo Básico e 2º CENS = Ciclo Específico.
  - As disciplinas agora têm os nomes oficiais das matérias (`src/config/grade.ts`).
  - O RDPM passou a ser "Direito Administrativo Disciplinar Militar" e foi para o Ciclo Básico.
- `npm run content:realinhar`: aplica a reorganização no banco existente.
  - Move questões e resumos (inclusive os criados pelo painel) e ordena as matérias como na grade.
  - Desativa, sem apagar, as matérias antigas que ficaram vazias.
  - Registra cada mudança na Auditoria.
- **Preços menores que os da concorrência** (`src/config/planos.ts`):
  - Ciclo Básico: R$ 29,90 por 6 meses.
  - Ciclo Específico: R$ 29,90 por 6 meses.
  - Completo: R$ 49,90 por 12 meses.
  - `npm run planos:atualizar` aplica os novos valores no banco. Assinaturas já pagas não mudam.
- Importação por planilha reativa a matéria se ela estava desativada.
### Testes
- Toda disciplina do conteúdo precisa existir na grade oficial, no ciclo certo.

## [0.10.0] — 2026-10-03
### Auditoria curricular (CFSd PMESP)
- `docs/AUDITORIA_CFSD.md`: grade curricular oficial (Manual do Aluno ESSd, 6ª ed.) cruzada com o banco de questões, com lacunas e decisões pendentes.
- **Matemática fora do escopo do CFSd** (não consta na grade). As 35 questões foram **movidas**, não apagadas, para `content/fora-do-escopo/`.
- `npm run content:arquivar`: oculta essas questões no banco (status ARQUIVADA), registra na Auditoria e pode ser desfeito pelo painel.
- Novo teste garante que conteúdo fora do escopo não volte ao banco ativo.

## [0.9.0] — 2026-10-03
### Adicionado
- **152 questões originais novas** (total: 330) no estilo das provas: Português, Matemática e Raciocínio Lógico, Informática, Administração Pública, Direito Penal, Processo Penal, Penal Militar (CPM), Estatuto do Desarmamento, Maria da Penha, Lei de Drogas, ECA, uso da força (Lei 13.060), garantias constitucionais, Direitos Humanos, Polícia Comunitária, Trânsito (CTB) e Primeiros Socorros.
- **9 resumos novos** na biblioteca (4 gratuitos).
- `docs/APRENDIZADO.pdf` (`npm run aprendizado`): caderno "O que eu aprendi", com etapas, comandos, banco de dados, serviços, segurança, erros resolvidos e glossário.
- `npm run db:seed` mostra o andamento por arquivo.
### Melhorado
- Ranking mais leve, limpeza do limite de tentativas em memória, `robots.txt` e Open Graph.

## [0.8.2] — 2026-09-30
### Corrigido
- `npm install` agora roda `prisma generate` automaticamente (`postinstall`), evitando o erro "@prisma/client did not initialize yet" quando a instalação é refeita.

## [0.8.1] — 2026-09-30
### Corrigido
- Página em branco no modo de desenvolvimento (`npm run dev`): a política de segurança (CSP) bloqueava recursos que o Next.js usa só em desenvolvimento. Agora `unsafe-eval` e WebSocket são liberados **apenas** em desenvolvimento; produção continua igual.

## [0.8.0] — 2026-09-29
### Adicionado
- **Biblioteca de materiais** (`/app/materiais`): resumos em texto (subtítulos, listas, negrito — sem HTML, seguro), áudios com player de velocidade (0,75×–2×) e "continuar de onde parou", e PDFs por link https. Mesma regra de acesso das questões (plano, estado, amostra grátis); recurso "Áudios" respeita a chave liga/desliga.
- **Painel → 📖 Materiais**: criar/editar, rascunho/publicado (só admin publica), grátis, abrangência por estado; links só https; auditado.
- **3 resumos originais do RDPM de SP** (transgressões; sanções e limites; prazos, comportamento e recursos) em `content/materiais/`, carregados pelo seed.
- CSP permite áudio de endereços https (`media-src`). Migração `materiais`.
- Testes: 3 unitários (24 no total) e 2 de navegador (18 no total).

## [0.7.0] — 2026-09-29
### Adicionado
- **Pagamento automático com Mercado Pago** (Pix, cartão, boleto): checkout criado no servidor com preço do banco; webhook `/api/webhooks/mercadopago` com verificação de assinatura (HMAC-SHA256), consulta do pagamento na API, conferência de valor e moeda, idempotência por `gatewayId`, proteção contra ativação dupla, cancelamento automático em estorno; tudo auditado. Sem chaves, o site segue no modo manual.
- **Cupons de desconto** (Admin → 🎟️ Cupons): % ou R$, limite de usos, validade, planos; uso contado só com pagamento aprovado; valor mínimo configurável.
- Pedidos guardam o valor cobrado (`Subscription.amountCents`) e o cupom. Migração `pagamentos`.
- Simulador do Mercado Pago para testes (`e2e/mock-mercadopago.mjs`); teste de navegador do pagamento (16 no total) e 3 unitários (21 no total).
- `docs/PAYMENTS.md` com passo a passo para ligar o Mercado Pago.

## [0.6.0] — 2026-09-29
### Adicionado
- **Importar questões por planilha** (Admin → 📥 Importar planilha): CSV do Excel (`;` ou `,`, com BOM), modelo em `/modelo-questoes.csv`; até 1.000 linhas/2 MB; valida cada linha e aponta erros; códigos existentes são ignorados; tudo entra como **Em revisão**; auditado.
- **Papéis da equipe** no painel (Aluno / Editor / Administrador); ninguém muda o próprio papel; auditado.
- **LGPD**: "Baixar meus dados" (JSON completo, sem senha) e "Excluir minha conta" (senha + digitar EXCLUIR): apaga histórico e anonimiza o cadastro, mantendo pagamentos sem dados pessoais.
- Leitor de CSV testado (`src/core/csv.ts`); 3 novos testes de navegador (15 no total) e 2 unitários (18 no total).

## [0.5.0] — 2026-09-29
### Adicionado
- **Cadernos** (`/app/cadernos`): criar, renomear, excluir; "Adicionar ao caderno" na questão (inclusive criando caderno novo); estudar só as questões do caderno; gerar simulado a partir do caderno; ver e remover questões.
- **Ranking** (`/app/ranking`): por período (7 dias, 30 dias, geral), ciclo e abrangência (meu estado, minha escola, Brasil). Pontos = acertos na **primeira tentativa** de cada questão (refazer não soma). Participação só com autorização e apelido; mostra apenas apelido e escola; consulta SQL parametrizada.
- Apelido higienizado (só letras, números, espaço, ponto, hífen e sublinhado).
- Limites editáveis em `src/config/regras.ts` (`cadernos`, `ranking`). Migração `cadernos_ranking`.
- 2 novos testes de navegador (12 no total).

## [0.4.0] — 2026-09-29
### Adicionado
- **Recuperação de senha**: "Esqueci minha senha" no login; link de uso único que expira (`REGRAS.senha.linkMinutos`, 60 min), enviado por e-mail via Resend quando `RESEND_API_KEY`/`EMAIL_FROM` estão configurados. Sem e-mail, o administrador gera o link em **Usuários → Link de senha** (mostrado uma vez, auditado) e envia ao aluno.
- Trocar a senha desconecta todos os aparelhos e invalida links antigos; resposta sempre genérica (não revela se o e-mail tem conta); limites de tentativa por IP e por e-mail.
- **Meta diária** de questões (Configurações) com barra de progresso no painel do aluno.
- Migração `senha_e_meta` (tabela `PasswordReset`, uma meta por aluno). Novas variáveis: `APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.
- Testes de navegador: recuperação de senha, reutilização de link bloqueada, meta diária (10 no total). Cada teste simula um IP diferente (`e2e/fixtures.ts`), mantendo os limites de segurança ativos.

## [0.3.0] — 2026-09-29
### Adicionado
- **Simulados** (`/app/simulados`): simulado rápido (10 questões) e personalizado (disciplina, só não respondidas/erradas/favoritas, quantidade, tempo). Cronômetro com aviso nos 5 minutos finais e envio automático; resultado com nota, aproveitamento, erros/em branco, tempo, desempenho por disciplina e correção comentada; histórico.
- Segurança: sorteio só entre questões que o aluno pode ver; gabarito só depois de finalizar; envio após o tempo (com tolerância) não conta; proteção contra envio duplo; limite de 20 simulados/hora.
- Limites editáveis em `src/config/regras.ts` (`simulado`). Migração `simulados` (ligação resposta ↔ simulado + índices).
- Alternativas só numéricas (prazos, valores) não são mais embaralhadas, para facilitar a leitura.
- Teste de navegador do simulado (7 no total) e 4 novos testes unitários (16 no total).
### Corrigido
- Vulnerabilidades de dependências de build (postcss, deepmerge-ts) via `overrides`; `npm audit` limpo.

## [0.2.2] — 2026-09-29
### Adicionado
- **Relatório em PDF** (`docs/RELATORIO.pdf`, gerado de `docs/relatorio/relatorio.html` com `npm run relatorio`): resumo, glossário, segurança, conteúdo, painel, mapa do projeto, **Guia de edição** por assunto, custos, roteiro e checklist.
- Configuração central editável: `src/config/site.ts` (textos da página inicial e FAQ) e `src/config/regras.ts` (sessão, limites de tentativa, Raio-X, amostra grátis).
- Cabeçalho padrão `📄 O QUE É / ✏️ EDITÁVEL / ⚠️ CUIDADO` em 20 arquivos-chave, marcações `✏️` nos pontos de edição, `content/questoes/LEIA-ME.md` e cabeçalho no `.env.example`.

## [0.2.1] — 2026-09-29
### Adicionado
- **109 questões originais do RDPM de SP** (LC 893/2001, texto compilado da Alesp atualizado até a Lei 18.442/2026), cobrindo os 14 capítulos: disposições gerais, deontologia, disciplina, transgressões (26 de classificação G/M/L conferidas contra o texto oficial), sanções, recolhimento, procedimento, competência, aplicação, comportamento, recursos, revisão, recompensas e processo regular. Total do banco: 178.
- Registro de fontes oficiais no CONTENT_GUIDE.
### Alterado
- Explicações curtas agora trazem a resposta por extenso + fundamento; validador exige no mínimo 20 caracteres.

## [0.2.0] — 2026-09-29
### Adicionado
- Site Next.js 15: página inicial com planos do banco, cadastro (estado + escola), login, termos, privacidade, ajuda/FAQ, PWA (instalar na tela inicial).
- Área do aluno: painel (plano, validade, acertos, sequência), questões com filtros (não respondidas, erradas, favoritas, revisar depois, disciplina), alternativas embaralhadas, gabarito e explicação só após responder, "Encontrou um problema?", desempenho e raio-x, meu plano (pedido), configurações (tema claro/escuro/automático, tamanho da letra, apelido).
- Painel administrativo: visão geral e configurações, questões (buscar, criar, editar, fluxo de status), problemas relatados, usuários (liberar pagamento, cancelar, desconectar, bloquear), planos e preços, escolas, auditoria.
- Segurança: Argon2id, cookie httpOnly/SameSite, sessão única com aviso, limite de tentativas (login, cadastro, respostas, relatos), cabeçalhos CSP/HSTS/X-Frame-Options, verificação de acesso no servidor em toda ação.
- Questões grátis (`isFree`) como amostra; equipe (admin/editor) vê todo o conteúdo.
- `npm run admin:create`, `docker-compose.yml`, testes de navegador (Playwright), CI com PostgreSQL.
- Docs: GUIA_INICIANTE, ADMIN_GUIDE, DEPLOY, PAYMENTS, PRODUCT_ROADMAP.

## [0.1.2] — 2026-09-29
### Adicionado
- 44 questões originais: Lei de Tortura, Abuso de Autoridade, DUDH, nacionalidade e direitos políticos, militares (CF/88), Português e Matemática. Total: 69.
- Embaralhamento estável das alternativas por aluno (`src/core/shuffle.ts`).
- `npm run content:report` e regra de qualidade: nenhuma letra com mais de 35% dos gabaritos.
- Backup e restauração (`scripts/backup.sh`, `scripts/restore.sh`) com SHA-256 e retenção; docs BACKUP e SECURITY.
### Corrigido
- Gabaritos concentrados na letra B (46 de 69): redistribuídos sem alterar o conteúdo das alternativas.

## [0.1.1] — 2026-09-29
### Adicionado
- Suporte a todos os estados: tabela `State` (27 UFs), UF do aluno, conteúdo nacional x estadual (`src/core/states.ts`).
- 8 questões novas (Administração pública — CF/88, art. 37; Direitos fundamentais), total de 25.
- Guia de conteúdo estadual, começando por São Paulo.

## [0.1.0] — 2026-09-29
### Adicionado
- Esquema do banco (Prisma/PostgreSQL): usuários, sessões, escolas, planos, assinaturas, pagamentos, cupons, ciclos, disciplinas, assuntos, questões A–E, tentativas, favoritos/revisar depois, cadernos, simulados, materiais, metas, notificações, configurações, feature flags e auditoria.
- Regras centrais testadas: acesso por plano (`canAccess`), ativação só com pagamento aprovado, sessão única com revogação, Raio-X de desempenho.
- 17 questões originais (Direitos fundamentais e Segurança pública — CF/88), com explicação e referência.
- Validação automática do banco de questões e seed idempotente que não sobrescreve edições do painel.
- Documentação: README, ARCHITECTURE, DATABASE, CONTENT_GUIDE, AUDITORIA.

## [0.0.1] — 2026-09-29
### Adicionado
- Auditoria e plano (Fase 1).
