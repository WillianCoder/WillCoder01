# Arquitetura

Visão completa, riscos e roadmap: [AUDITORIA.md](AUDITORIA.md) §11–12.

## Princípios
1. **O servidor decide.** Acesso premium, sessão e preço nunca são decididos no frontend (`src/core/access.ts`, `src/core/session.ts`).
2. **Regras puras em `src/core/`**: sem banco nem HTTP, testáveis e reaproveitáveis pela web (Next.js, v0.2) e pelo app (Expo, v2.0).
3. **Nada de configuração espalhada.** Preços/planos na tabela `Plan`; chaves e flags em `Setting`/`FeatureFlag`; segredos só em `.env` via `src/config/env.ts`.
4. **Conteúdo com origem.** Toda questão/material tem `sourceLicense` (ver CONTENT_GUIDE).

## Fluxos críticos
- **Login:** cria sessão (token opaco; banco guarda só SHA-256) → revoga as sessões ativas anteriores com motivo `SESSION_REPLACED` → o dispositivo antigo recebe esse código e mostra "Sua conta foi conectada em outro dispositivo."
- **Pagamento:** checkout Mercado Pago → webhook com assinatura verificada → `Payment` idempotente por `gatewayId` → `activationWindow()` só com `APPROVED` → `Subscription` ativa. O botão "Paguei" não libera nada.
- **Questões por IA (v1.x):** entram como `GENERATED`; somente um editor muda para `APPROVED`/`PUBLISHED`; cada mudança grava `AuditLog`.
