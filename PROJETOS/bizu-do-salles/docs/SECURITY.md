# Segurança — Bizu do Salles

## Implementado (v0.1.x)
- Acesso premium decidido só no servidor (`canAccess`) a partir de assinatura ativa e pagamento aprovado.
- Sessão única: token aleatório de 256 bits; no banco só o hash SHA-256; login novo revoga sessões anteriores.
- Conteúdo validado por esquema (zod) antes de entrar no banco; seed nunca sobrescreve dados editados.
- Alternativas embaralhadas por aluno (`src/core/shuffle.ts`): dificulta "cola" de gabarito por letra e o ranking combinado entre alunos.
- Segredos só em `.env`/gerenciador de segredos; `.env` e `backups/` fora do git.

## Implementado (v0.2)
- Senhas com Argon2id; mensagem genérica em login inválido (não revela quem tem conta).
- Cookie de sessão `httpOnly`, `SameSite=Lax`, `Secure` em produção; Server Actions do Next.js checam a origem (proteção CSRF).
- Limite de tentativas: login (8/conta e 20/IP a cada 15 min), cadastro (5/IP por hora), respostas (120/min), relatos (10/hora).
- Gabarito, explicação e "por que está errada" só saem do servidor **depois** da resposta.
- Toda ação confere acesso de novo no servidor (plano, estado, status publicado).
- Cabeçalhos: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; sem `X-Powered-By`.
- Bloqueio de usuário derruba as sessões; admin não bloqueia a si mesmo.
- Toda ação administrativa gravada em `AuditLog`.

## Obrigatório nas próximas versões
| Item | Versão |
|---|---|
| Recuperação de senha com token de uso único e expiração curta | v0.3 |
| Limite de tentativas compartilhado (Upstash Redis) quando houver várias instâncias | v1.0 |
| Webhook de pagamento com verificação de assinatura e idempotência | v0.8 |
| Uploads: limite de tamanho, checagem de MIME real, bucket privado com URL assinada | v1.x |
| Cabeçalhos de segurança (CSP, HSTS), dependências monitoradas (npm audit/Dependabot) | v1.0 |

## Reportar vulnerabilidade
Não abra issue pública; contate o responsável pelo repositório (ver `SECURITY.md` na raiz).
