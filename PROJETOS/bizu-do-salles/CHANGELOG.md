# Changelog — Bizu do Salles

Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), versões [SemVer](https://semver.org/lang/pt-BR/).

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
