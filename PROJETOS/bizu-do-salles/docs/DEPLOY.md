# Publicar na internet (deploy)

Recomendação para começar com custo zero ou baixo: **Vercel** (site) + **Neon** (banco PostgreSQL). Ambos têm plano gratuito.

## Passo a passo
1. **Banco (Neon):** crie conta em neon.tech → novo projeto (região São Paulo, se disponível) → copie a *connection string* (`postgresql://...?sslmode=require`).
2. **Site (Vercel):** crie conta em vercel.com com o GitHub → *Add New Project* → escolha o repositório → em **Root Directory** coloque `PROJETOS/bizu-do-salles`.
3. Em **Environment Variables** da Vercel, adicione (valores reais, nunca no código):
   - `DATABASE_URL` = connection string do Neon
   - `APP_NAME` = Bizu do Salles
   - `APP_URL` = endereço público (ex.: `https://bizudosalles.com.br`) — usado nos links de senha
   - (opcional) `RESEND_API_KEY` e `EMAIL_FROM` — para o site enviar e-mails de "esqueci minha senha" sozinho (conta grátis em resend.com)
4. **Build Command:** `npx prisma migrate deploy && npm run build` (aplica migrações a cada publicação).
5. Faça o deploy. Depois, no seu computador, com `DATABASE_URL` do Neon no `.env`:
   `npm run db:seed` e `npm run admin:create -- seu@email.com "Seu Nome"`.
6. **Domínio:** compre `bizudosalles.com.br` (registro.br) e aponte na Vercel (*Settings → Domains*). HTTPS é automático.

## Antes de vender
- [ ] Revisar termos e privacidade com advogado.
- [ ] Backup diário configurado e **um teste de restauração feito** (BACKUP.md).
- [ ] Gateway de pagamento ligado (PAYMENTS.md).
- [ ] CI verde no GitHub.
- [ ] Senha forte (12+ caracteres) na conta de admin.

## Observação sobre o limite de tentativas de login
O limite atual guarda contagens na memória do servidor. Na Vercel há várias instâncias; ele continua ajudando, mas o ideal em produção é trocar por Upstash Redis (mesma função em `src/lib/rate-limit.ts`).
