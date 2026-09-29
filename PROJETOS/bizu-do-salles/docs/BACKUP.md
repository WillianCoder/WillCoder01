# Backup e recuperação

| O quê | Como | Frequência | Retenção |
|---|---|---|---|
| Banco (PostgreSQL) | Backup automático do provedor (Neon/Supabase, com restauração a um ponto no tempo) | Contínuo | Conforme o plano (7–30 dias) |
| Banco (cópia própria) | `npm run db:backup` (pg_dump + SHA-256 + verificação) em job agendado, enviado ao armazenamento externo | Diário | 30 dias (`BACKUP_RETENTION_DAYS`) |
| Questões e textos | Versionados no git (`content/questoes/*.json`) | A cada commit | Histórico completo |
| Arquivos (PDF/áudio) | Bucket R2 com versionamento de objetos ligado | Contínuo | 30 dias de versões |
| Configurações | `.env` no gerenciador de segredos da hospedagem; `.env.example` no git | A cada mudança | — |

## Regras
1. Antes de qualquer migração em produção: `npm run db:backup` e conferir a mensagem "Backup OK".
2. **Teste de restauração mensal**: restaurar o último backup em um banco vazio de teste (`npm run db:restore -- arquivo.dump`) e abrir o sistema apontando para ele.
3. Backups nunca vão para o git (`backups/` está no `.gitignore`) e contêm dados pessoais — guardar criptografados e com acesso restrito (LGPD).

## Recuperação (passo a passo)
1. Criar banco vazio → 2. `npm run db:restore -- <arquivo>` (o script confere o SHA-256 antes) → 3. `npx prisma migrate deploy` para aplicar migrações posteriores → 4. apontar `DATABASE_URL` da aplicação → 5. registrar o incidente no CHANGELOG/relatório.
