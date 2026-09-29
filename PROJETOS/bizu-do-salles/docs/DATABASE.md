# Banco de dados

PostgreSQL 16 + Prisma. Fonte da verdade: `prisma/schema.prisma`.

Hierarquia: `Cycle` → `Subject` → `Topic` (assunto; subassunto = `Topic` com `parentId`) → `Question` → `QuestionOption` (A–E).
Aluno: `User` → `Session` (sessão única), `Subscription` → `Plan`, `Payment`, `QuestionAttempt`, `Favorite` (`FAVORITE` ou `REVIEW_LATER`), `Notebook`, `SimulationAttempt`.

Regras de migração: backup (`pg_dump`) antes de qualquer `migrate deploy` em produção; nunca apagar colunas com dados sem migração em duas etapas; o seed nunca sobrescreve dados editados.

Decisões: `Topic` unifica assunto/subassunto; ranking será calculado a partir de `QuestionAttempt`/`SimulationAttempt` (sem tabela editável, dificulta manipulação); backups ficam no provedor + dump agendado, não em tabela.
