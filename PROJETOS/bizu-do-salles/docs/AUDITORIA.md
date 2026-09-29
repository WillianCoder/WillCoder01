# Auditoria do Projeto — Plataforma de Estudos (Fase 1)

Data: 2026-09-29 · Versão do documento: 0.0.1

> Primeira entrega obrigatória do prompt mestre. Nada foi apagado ou alterado no repositório existente; apenas esta pasta foi criada.

---

## 1. Stack atual

O repositório `WillianCoder/WillCoder01` **não contém uma plataforma de estudos**. Ele é o "Laboratório Digital": portfólio/painel pessoal estático.

| Camada | Tecnologia |
|---|---|
| Frontend | HTML + CSS + JavaScript puro (`index.html`, `site/css/main.css`, `site/js/app.js` ~270 linhas) |
| Dados | `meta.json` por item → `scripts/catalogo.py` gera `site/data/catalog.js` |
| Scripts | Python 3.12, somente biblioteca padrão (`scripts/catalogo.py`, `scripts/novo.py`) |
| CI/CD | GitHub Actions: `validar.yml` (valida catálogo) e `pages.yml` (publica a raiz no GitHub Pages) |
| Backend / banco / auth / pagamentos | **inexistentes** |

Arquivos legados na raiz: `gato.html`, `script.js`, `style.css`, `desktop.ini` (primeiro commit; preservados).

## 2. Estrutura

Pastas por tipo de conteúdo (`PROJETOS/`, `ACADEMICO/`, `ESTUDOS/`, `EXPERIMENTOS/`, `PORTFOLIO/`, `DOCUMENTACAO/`, `TEMPLATES/`, `RECURSOS/`, `ARQUIVO/`), cada item com `README.md` + `meta.json`. Já existem `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`, templates de issue/PR e `.gitignore` que bloqueia `.env`, chaves e `node_modules`.

## 3. Banco

Não há banco de dados. Os únicos "dados" são JSON de metadados do portfólio.

## 4. Autenticação

Não há. O site é público e estático (GitHub Pages não executa código de servidor).

## 5. Funcionalidades existentes

- Painel do portfólio com tema claro/escuro salvo em `localStorage`, preferência de movimento reduzido, link "pular para o conteúdo" (boas práticas de acessibilidade reaproveitáveis).
- Geração automática de catálogo e estatísticas no README.
- Validação em CI e deploy automático.

## 6. Problemas encontrados

1. **Nenhum requisito da plataforma existe** — é um projeto novo, não uma evolução.
2. `pages.yml` publica **a raiz inteira** (`path: .`). Se o código da plataforma for colocado aqui, tudo (inclusive arquivos de configuração) seria publicado como site estático.
3. GitHub Pages não suporta backend, webhooks de pagamento, sessão única nem autorização server-side — requisitos críticos do prompt.
4. O repositório é um portfólio pessoal com identidade visual própria (Pac-Man/retro), incompatível com a marca de um produto comercial.

## 7. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Misturar produto comercial com portfólio pessoal | Deploy acidental, histórico poluído, dificulta vender/transferir o produto | **Repositório próprio** para a plataforma (recomendado) |
| Conteúdo de terceiros (Bizu do Souza, Gran, QConcursos etc.) | Violação de direito autoral | Usar concorrentes só como referência funcional; conteúdo próprio/licenciado; registrar origem de cada questão |
| 500 questões "geradas para preencher" | Gabaritos errados, dano à reputação | IA só gera rascunho; fluxo GERADA → REVISÃO → APROVADA → PUBLICADA com revisor humano |
| Cobrança dentro de apps iOS/Android | Rejeição nas lojas | Definir estratégia de billing por loja antes da Fase 18 (ver §14) |
| Liberação de acesso sem pagamento confirmado | Perda de receita | Acesso decidido só no backend, a partir de webhook verificado do gateway |
| LGPD (CPF, dados de alunos) | Multas, incidentes | Não coletar CPF salvo exigência do gateway; minimização; termos e política |
| Escopo enorme (21 fases) | Projeto nunca termina | MVP enxuto e entregas incrementais versionadas |

## 8. O que pode ser aproveitado

- Convenções de documentação, `CHANGELOG.md` (SemVer), templates de issue/PR, `.gitignore` de segredos, `SECURITY.md` como base.
- Padrões de acessibilidade e tema do painel (implementação de referência, não o visual).
- Este portfólio passa a listar a plataforma como projeto (esta pasta + `meta.json`).

## 9. O que deve ser corrigido (no repositório atual)

- Nada bloqueante. Opcional: restringir `pages.yml` a publicar só `index.html`, `site/` e ativos, em vez da raiz inteira.

## 10. O que precisa ser criado

Praticamente tudo: backend, banco, autenticação com sessão única, planos/assinaturas, pagamentos com webhook, banco de questões, simulados, desempenho, admin, app mobile, documentação (`ARCHITECTURE.md`, `DATABASE.md`, `PAYMENTS.md`, etc.), testes e deploy.

## 11. Arquitetura proposta

Critérios: um único desenvolvedor, custo baixo, web + Android + iOS, segurança server-side, fácil de manter.

```
plataforma/ (monorepo, pnpm + Turborepo)
├─ apps/
│  ├─ web/      Next.js (App Router, TypeScript) — landing, área do aluno, painel admin, API
│  └─ mobile/   Expo (React Native) — consome a mesma API (Fase 18)
├─ packages/
│  ├─ core/     regras de negócio puras: acesso por plano, cálculo de desempenho, simulados
│  ├─ db/       Prisma + PostgreSQL: schema, migrations, seed
│  ├─ ui/       tokens de design (cores, tipografia, tema claro/escuro/auto)
│  └─ config/   leitura validada (zod) de env + settings/feature flags do banco
└─ docs/        ARCHITECTURE, DATABASE, SECURITY, PAYMENTS, DEPLOY, BACKUP, ...
```

Decisões-chave:

- **Next.js** em vez de React Native Web: SEO na landing, SSR, API no mesmo projeto. Mobile com **Expo** reaproveitando `core`, tipos e a API. PWA na web como ponte até os apps.
- **PostgreSQL + Prisma**: relacional (ciclo → disciplina → assunto → subassunto → questão → alternativas), migrations versionadas, `pg_trgm`/`pgvector` para detectar questões duplicadas.
- **Autenticação própria com sessões no banco** (tabela `sessions`, cookie httpOnly na web, token opaco no app). Login novo revoga a sessão anterior → requisito de **sessão única** atendido no servidor; o dispositivo antigo recebe `401 SESSION_REPLACED` e mostra "Sua conta foi conectada em outro dispositivo". Senhas com Argon2id; rate limit por IP e por conta.
- **Acesso premium** decidido por uma única função no backend (`canAccess(user, cycle)`) que consulta `subscriptions` (status, validade, ciclos do plano). Frontend só exibe.
- **Pagamentos**: Mercado Pago (Pix + cartão) via webhook com verificação de assinatura, idempotência por `payment_id` e conciliação. Nunca liberar por "Paguei".
- **Preços, planos, disciplinas, escolas, feature flags** em tabelas administráveis (`plans`, `settings`, `feature_flags`) — nada fixo no código; seed inicial com R$ 35,00 / R$ 35,00 / combinado 90 dias.
- **IA de geração de questões** (Fase 15): API Claude no servidor, saída estruturada em JSON, grava como `status=GERADA` com trecho-base; publicação só após aprovação humana; toda ação registrada em `audit_logs`.
- **Hospedagem sugerida**: Vercel (web) + Neon ou Supabase (Postgres gerenciado com backup diário) + Cloudflare R2 (PDFs/áudios com URLs assinadas) + Resend (e-mail).

Entidades do banco: as listadas no prompt, com ajustes — `topics` e `subtopics` unificados em uma tabela hierárquica (`topics.parent_id`); `backups` fica fora do banco (gerenciado pelo provedor + script de dump); `rankings` calculado por view/materialização em vez de tabela editável.

## 12. Roadmap (MVP primeiro)

| Versão | Entrega | Fases do prompt |
|---|---|---|
| v0.1 | Monorepo, schema, seed, CI (lint, typecheck, testes), docs base | 2–3 |
| v0.2 | Cadastro, login, recuperação de senha, sessão única, escolas | 4, 13 |
| v0.3 | Planos, assinaturas, bloqueio server-side, admin de planos/preços | 5, 12 |
| v0.4 | Questões A–E, filtros, favoritos, revisar depois, relatar problema | 7 |
| v0.5 | Dashboard, desempenho, Raio-X | 6, 8 |
| v0.6 | Simulados (rápido, personalizado, com tempo) e resultado | 9 |
| v0.7 | Painel admin completo + auditoria | 10 |
| v0.8 | Pagamento Mercado Pago + webhooks + cupons | 11 |
| **v1.0** | Segurança, testes, LGPD, deploy de produção (web + PWA) | 19–21 |
| v1.x | Materiais/áudios, IA geradora, ranking, gamificação, cadernos | 14–17 |
| v2.0 | Apps Android/iOS (Expo) com billing adequado | 18 |

## 13. Dependências principais

Node.js 22 LTS, pnpm, Next.js, React, TypeScript, Prisma, PostgreSQL 16, zod, Argon2, Tailwind CSS, Recharts (gráficos leves), Vitest + Playwright (testes), SDK Mercado Pago, SDK Anthropic (Fase 15), Expo (Fase 18).

## 14. Custos previstos (estimativa mensal, início)

| Item | Custo |
|---|---|
| Vercel Hobby → Pro quando comercial | US$ 0 → ~US$ 20 |
| Postgres gerenciado (Neon/Supabase) | US$ 0 → ~US$ 19–25 |
| Armazenamento R2 (PDF/áudio) | ~US$ 0–5 |
| E-mail transacional | US$ 0 (plano gratuito) |
| Domínio .com.br | ~R$ 40/ano |
| Mercado Pago | taxa por transação (Pix ~0,99%; cartão ~4–5%) |
| Apple Developer / Google Play | US$ 99/ano / US$ 25 único |
| IA para geração de questões | por uso; poucos dólares por lote de centenas de questões |

Lojas: compras digitais dentro dos apps em geral exigem o billing da Apple/Google (comissão de 15% no programa para pequenas empresas). Alternativa comum no MVP: app sem venda interna ("reader app"/login de conta já assinada na web), sujeito às regras vigentes de cada loja — validar antes da Fase 18.

## 15. Pontos de atenção e decisões pendentes

1. **Onde fica o código?** Recomendo **repositório novo** (ex.: `WillianCoder/plataforma-estudos`); este portfólio só aponta para ele.
2. **Nome e marca** do produto (necessário para identidade visual, domínio e termos de uso).
3. **Conteúdo das 500 questões**: você tem material próprio/autorizado (apostilas do curso, legislação oficial, editais)? Legislação e normas oficiais publicadas podem ser base de questões; apostilas de terceiros não.
4. **Instituição/estado alvo** (PMs diferem por estado) para montar a grade de disciplinas do Ciclo Básico e Específico.
5. **CPF**: só se o gateway exigir para Pix/nota fiscal.
6. **Pessoa jurídica/MEI** para receber pagamentos e publicar nas lojas.

### Melhorias propostas não pedidas

| Proposta | Por quê | Complexidade | Quando |
|---|---|---|---|
| Registro de origem/licença por questão e material (`source_license`) | Prova de direito de uso; protege em disputa autoral | Baixa | MVP |
| "Gabarito contestado" com fila no admin e SLA | Qualidade percebida; reduz reembolsos | Baixa | MVP |
| Ambiente de staging com dados fictícios | Testar pagamentos/webhooks sem risco | Baixa | MVP |
| Monitoramento de erros (Sentry, plano gratuito) | "Nunca esconder erro" na prática | Baixa | v1.0 |

---

**Próximo passo:** com as decisões da §15 respondidas (principalmente 1, 2 e 4), iniciar a v0.1 — monorepo, schema do banco, seed com planos configuráveis e documentação de arquitetura.
