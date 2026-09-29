# Segurança — Bizu do Salles

## Implementado (v0.1.x)
- Acesso premium decidido só no servidor (`canAccess`) a partir de assinatura ativa e pagamento aprovado.
- Sessão única: token aleatório de 256 bits; no banco só o hash SHA-256; login novo revoga sessões anteriores.
- Conteúdo validado por esquema (zod) antes de entrar no banco; seed nunca sobrescreve dados editados.
- Alternativas embaralhadas por aluno (`src/core/shuffle.ts`): dificulta "cola" de gabarito por letra e o ranking combinado entre alunos.
- Segredos só em `.env`/gerenciador de segredos; `.env` e `backups/` fora do git.

## Obrigatório nas próximas versões
| Item | Versão |
|---|---|
| Senhas com Argon2id; rate limit por IP e por conta no login e na recuperação de senha | v0.2 |
| Cookies `httpOnly`, `Secure`, `SameSite=Lax`; proteção CSRF nas rotas de mutação | v0.2 |
| Gabarito e explicação só enviados ao cliente **depois** da resposta | v0.4 |
| Webhook de pagamento com verificação de assinatura e idempotência | v0.8 |
| Uploads: limite de tamanho, checagem de MIME real, bucket privado com URL assinada | v1.x |
| Auditoria de ações administrativas (`AuditLog`) | v0.7 |
| Cabeçalhos de segurança (CSP, HSTS), dependências monitoradas (npm audit/Dependabot) | v1.0 |

## Reportar vulnerabilidade
Não abra issue pública; contate o responsável pelo repositório (ver `SECURITY.md` na raiz).
