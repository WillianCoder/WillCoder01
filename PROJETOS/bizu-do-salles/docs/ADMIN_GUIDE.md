# Guia do administrador

Acesse `/admin` com uma conta de administrador (criada com `npm run admin:create`).

## Papéis
| Papel | Pode |
|---|---|
| **ADMIN** | Tudo: planos, preços, usuários, liberar assinaturas, escolas, configurações, publicar questões, auditoria. |
| **EDITOR** | Criar e editar questões (até "Aprovada"), tratar problemas relatados. **Não** publica, não vê pagamentos. |
| **STUDENT** | Aluno. |

Para tornar alguém editor, por enquanto: `npx prisma studio` → tabela `User` → campo `role` = `EDITOR` (tela própria na v0.7).

## Telas
- **Visão geral** — números (usuários, assinaturas, questões, problemas) + WhatsApp/e-mail de suporte + recursos ligados/desligados.
- **Questões** — busca e filtro por status; *Nova questão* com formulário completo (alternativas A–E, gabarito, "por que está errada", explicação, referência e origem). A questão só aparece para alunos quando o status é **Publicada**. Marque **Grátis** para usá-la como amostra.
- **Problemas relatados** — o que os alunos apontaram em "Encontrou um problema?". Corrija a questão e marque como resolvido.
- **Usuários e assinaturas** — pedidos pendentes (confirme o pagamento e libere), busca de alunos, cancelar plano, desconectar aparelho, bloquear/desbloquear.
- **Planos e preços** — nome, preço, duração, descrição, à venda ou não.
- **Escolas** — lista fechada que o aluno escolhe no cadastro.
- **Auditoria** — tudo que a equipe fez, com data e autor.

## Fluxo de qualidade da questão
`Em revisão` → `Revisada` → `Aprovada` → **`Publicada`** (só ADMIN). Questões geradas por IA (futuro) entram como `Gerada` e seguem o mesmo caminho — nunca vão direto para o aluno.

## Checklist antes de publicar uma questão
- [ ] O artigo citado em "Referência" existe e está na redação **atual** da lei.
- [ ] Só uma alternativa correta; as outras são plausíveis, mas erradas.
- [ ] A explicação justifica pela lei, não por "porque sim".
- [ ] Texto 100% seu (não copiado de apostila/curso).
