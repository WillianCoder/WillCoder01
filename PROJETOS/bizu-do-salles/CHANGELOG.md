# Changelog — Bizu do Salles

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), versões [SemVer](https://semver.org/lang/pt-BR/).

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
