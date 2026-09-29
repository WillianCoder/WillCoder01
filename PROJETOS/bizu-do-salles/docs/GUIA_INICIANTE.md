# Guia do iniciante — entenda o Bizu do Salles

Este guia explica **o que é cada coisa** do projeto, sem supor conhecimento prévio. Leia na ordem.

---

## 1. Como o sistema funciona (visão geral)

```
 Aluno (celular/computador)
        │  abre o site no navegador
        ▼
 ┌──────────────────────────────┐
 │  Aplicação Next.js           │  ← páginas + regras (src/)
 │  - mostra as telas           │
 │  - confere login e plano     │
 │  - corrige as respostas      │
 └──────────────┬───────────────┘
                │ lê/grava
                ▼
 ┌──────────────────────────────┐
 │  Banco PostgreSQL            │  ← alunos, questões, respostas, planos
 └──────────────────────────────┘
```

**Regra de ouro de segurança:** o navegador do aluno só *mostra* as coisas. Quem decide se o aluno pode ver uma questão, se o plano está válido e se a resposta está certa é sempre o **servidor**. Por isso ninguém consegue "liberar" conteúdo mexendo no navegador.

## 2. Glossário

| Termo | O que significa aqui |
|---|---|
| **Repositório (repo)** | A "pasta na nuvem" do GitHub que guarda todo o código e o histórico de mudanças. |
| **Commit** | Uma "foto" salva das mudanças, com descrição. Dá para voltar a qualquer foto antiga. |
| **Branch** | Uma linha paralela de trabalho. As mudanças ficam em `claude/...` até você aprovar e juntar na `main`. |
| **Pull Request (PR)** | Pedido para juntar uma branch na `main`. É onde você revisa antes de aprovar. |
| **Node.js / npm** | Node roda o código JavaScript/TypeScript no servidor; npm instala as bibliotecas (`npm install`). |
| **TypeScript** | JavaScript com tipos: o editor avisa erros antes de rodar. |
| **Next.js** | O framework do site: cada pasta em `src/app/` vira uma página (ex.: `src/app/entrar/` → `/entrar`). |
| **PostgreSQL** | O banco de dados, onde tudo fica guardado. |
| **Prisma** | Ferramenta que conversa com o banco. O desenho das tabelas está em `prisma/schema.prisma`. |
| **Migração** | Arquivo que altera a estrutura do banco de forma segura e registrada (`prisma/migrations/`). |
| **Seed** | Carga inicial: planos, estados, disciplinas e as questões de `content/questoes/`. |
| **`.env`** | Arquivo com senhas e chaves (banco, pagamento). **Nunca vai para o GitHub.** O modelo é `.env.example`. |
| **Sessão** | "Crachá" que o site entrega após o login (um cookie). Só vale um por conta: novo login derruba o anterior. |
| **Hash de senha (Argon2id)** | A senha é transformada de forma irreversível; nem o administrador consegue ler a senha do aluno. |
| **Server Action** | Função que roda no servidor quando o aluno envia um formulário (responder, favoritar, cadastrar). |
| **Webhook** | Aviso automático que o gateway de pagamento manda ao nosso servidor dizendo "pagamento aprovado". |
| **Deploy** | Publicar o site na internet (ver `DEPLOY.md`). |
| **Backup** | Cópia de segurança do banco (ver `BACKUP.md`). |
| **Teste automatizado** | Programa que confere se tudo funciona. `npm test` (regras) e `npm run test:e2e` (navegador de verdade). |
| **CI** | O GitHub roda os testes sozinho a cada envio (`.github/workflows/validar.yml`). Se ficar vermelho, algo quebrou. |
| **Auditoria** | Registro de toda ação do administrador (quem, quando, o quê). |

## 3. Mapa das pastas

```
bizu-do-salles/
├─ src/
│  ├─ app/                  ← PÁGINAS (cada pasta = um endereço do site)
│  │  ├─ page.tsx           → página inicial (/)
│  │  ├─ cadastro/ entrar/  → criar conta e login
│  │  ├─ app/               → área do aluno (/app): painel, questões, desempenho, plano, configurações
│  │  ├─ admin/             → painel do administrador (/admin)
│  │  ├─ termos/ privacidade/ ajuda/ → textos públicos (edite à vontade)
│  │  └─ globals.css        → CORES e visual (mude só as variáveis do topo)
│  ├─ core/                 ← REGRAS PURAS, testadas: acesso por plano, sessão, desempenho, embaralhar, estados
│  ├─ lib/                  ← ligação com banco, login, auditoria, limite de tentativas
│  ├─ components/           ← pedaços de tela reaproveitados
│  └─ content.ts            ← leitor/validador dos arquivos de questões
├─ content/questoes/        ← QUESTÕES em arquivos JSON (versionadas no Git)
├─ prisma/                  ← desenho do banco, migrações e seed
├─ scripts/                 ← comandos: criar admin, backup, restaurar, relatório de conteúdo
├─ tests/  e2e/             ← testes automáticos (regras / navegador)
├─ docs/                    ← toda a documentação
└─ public/                  ← ícone e manifesto (instalar no celular)
```

## 4. Onde eu mudo…

| Quero mudar… | Onde / como |
|---|---|
| Preço, nome ou duração de um plano | Painel → **Planos e preços** (sem código) |
| Adicionar/editar questão | Painel → **Questões** → *Nova questão* (ou arquivo JSON, ver `CONTENT_GUIDE.md`) |
| Liberar acesso de quem pagou por Pix | Painel → **Usuários e assinaturas** → *Confirmar pagamento* |
| WhatsApp/e-mail de suporte, ligar/desligar recursos | Painel → **Visão geral** → Configurações gerais |
| Escolas da lista do cadastro | Painel → **Escolas** |
| Cores do site | `src/app/globals.css` (variáveis no topo) |
| Texto da página inicial | `src/app/page.tsx` |
| Termos de uso / privacidade / FAQ | `src/app/termos/`, `src/app/privacidade/`, `src/app/ajuda/` |

## 5. Rodar no seu computador (passo a passo)

1. Instale o **Node.js 22 LTS** (nodejs.org) e o **Git**.
2. Banco de dados — escolha um:
   - **Docker Desktop** instalado → na pasta do projeto: `docker compose up -d`; ou
   - instale o **PostgreSQL 16** e crie usuário `bizu`, senha `bizu`, banco `bizu`.
3. No terminal, dentro de `PROJETOS/bizu-do-salles`:
   ```bash
   npm install                 # baixa as bibliotecas
   cp .env.example .env        # cria o arquivo de configuração (no Windows: copy .env.example .env)
   npx prisma migrate deploy   # cria as tabelas
   npm run db:seed             # planos, estados e questões
   npm run admin:create -- seu@email.com "Seu Nome"   # cria você como administrador (pede a senha)
   npm run dev                 # liga o site
   ```
4. Abra **http://localhost:3000**. Entre com seu e-mail de admin para ver o painel em `/admin`.

## 6. Comandos do dia a dia

| Comando | Para quê |
|---|---|
| `npm run dev` | Ligar o site no seu computador (atualiza sozinho quando você edita). |
| `npm test` | Conferir regras e o banco de questões (rápido). |
| `npm run test:e2e` | Testar o site num navegador de verdade (precisa `npm run build` antes). |
| `npm run content:report` | Ver quantas questões há por disciplina, dificuldade e letra. |
| `npm run db:seed` | Carregar questões novas dos arquivos JSON (não apaga nem sobrescreve nada). |
| `npm run db:backup` | Fazer backup do banco. |
| `npm run admin:create -- email "Nome"` | Criar/promover administrador. |

## 7. Regras que protegem o seu negócio

1. **Nunca** envie o arquivo `.env` ou senhas para o GitHub.
2. **Nunca** libere plano sem ver o pagamento (no painel fica registrado quem liberou).
3. **Nunca** publique questão copiada de outro curso ou apostila (ver `CONTENT_GUIDE.md`).
4. Faça backup antes de qualquer mudança grande no banco (ver `BACKUP.md`).
5. Mudança no código → rode `npm test` → só depois envie.
