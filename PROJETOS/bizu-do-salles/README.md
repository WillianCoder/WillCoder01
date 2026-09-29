# Bizu do Salles

Plataforma de estudos por questões para cursos de formação da Polícia Militar — **Ciclo Básico**, **Ciclo Específico** e plano **Básico + Específico**.

Versão **0.1.0** — fundação: banco de dados, regras de acesso, sessão única, desempenho e primeiras questões originais. Interface web vem na v0.2 ([roadmap](docs/AUDITORIA.md#12-roadmap-mvp-primeiro)).

## Onde fica cada coisa

| Quero… | Onde |
|---|---|
| Ver o modelo do banco | `prisma/schema.prisma` · [docs/DATABASE.md](docs/DATABASE.md) |
| Alterar preço / plano | Tabela `Plan` (painel admin na v0.7). Valores iniciais só no `prisma/seed.ts` |
| Adicionar questões | `content/questoes/*.json` · [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) |
| Regra de acesso por plano | `src/core/access.ts` |
| Sessão única | `src/core/session.ts` |
| Raio-X / desempenho | `src/core/performance.ts` |
| Variáveis de ambiente | `.env.example` · `src/config/env.ts` |
| Arquitetura e decisões | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/AUDITORIA.md](docs/AUDITORIA.md) |

## Como rodar

```bash
cd PROJETOS/bizu-do-salles
npm install
cp .env.example .env          # ajuste DATABASE_URL (PostgreSQL 16)
npm test                      # testes das regras
npm run typecheck
npm run db:migrate            # cria as tabelas
npm run db:seed               # planos, ciclos, flags e questões
```

Nunca coloque segredos no código: use `.env` (ignorado pelo git).

Documentos: [CHANGELOG](CHANGELOG.md) · [ARCHITECTURE](docs/ARCHITECTURE.md) · [DATABASE](docs/DATABASE.md) · [CONTENT_GUIDE](docs/CONTENT_GUIDE.md) · [AUDITORIA](docs/AUDITORIA.md)
