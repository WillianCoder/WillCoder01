"use server";
/**
 * 📄 O QUE É: AÇÕES DO ALUNO no servidor: responder, favoritar, relatar problema, pedir plano, salvar preferências.
 * ✏️ EDITÁVEL: Limites de tentativa: src/config/regras.ts.
 * ⚠️ CUIDADO: Área de SEGURANÇA: toda ação confere login e acesso de novo. Não remova essas verificações.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { visibleWhere } from "@/lib/questions";
import { orderFor, originalLetter } from "@/core/shuffle";
import { rateLimit } from "@/lib/rate-limit";
import { REGRAS, janela } from "@/config/regras";

const back = (form: FormData) => String(form.get("back") ?? "/app/questoes").replace(/[^\w\-/?=&%.]/g, "");

async function loadVisible(userId: string, stateCode: string | null, questionId: string, role = "STUDENT") {
  const { cycles } = await userAccess(userId, role);
  return db.question.findFirst({ where: { id: questionId, ...visibleWhere({ id: userId, stateCode }, cycles) } });
}

export async function answer(form: FormData) {
  const user = await requireUser();
  const questionId = String(form.get("questionId"));
  const shown = Number(form.get("choice"));
  if (!Number.isInteger(shown) || shown < 0 || shown > 4) redirect(`${back(form)}&erro=escolha`);
  if (!rateLimit(`answer:${user.id}`, ...janela(REGRAS.limites.respostasPorAluno))) redirect(`${back(form)}&erro=limite`);
  const q = await loadVisible(user.id, user.stateCode, questionId, user.role);
  if (!q) redirect("/app/planos?bloqueado=1"); // sem acesso: nunca confiar no que veio do navegador
  const opts = await db.questionOption.findMany({ where: { questionId: q!.id }, select: { letter: true, text: true }, orderBy: { letter: "asc" } });
  const chosen = originalLetter(user.id, q!.id, shown, orderFor(user.id, { id: q!.id, options: opts }));
  const started = Number(form.get("startedAt"));
  const timeMs = Number.isFinite(started) ? Math.min(Math.max(Date.now() - started, 0), 60 * 60_000) : null;
  const attempt = await db.questionAttempt.create({
    data: { userId: user.id, questionId: q!.id, chosenLetter: chosen, correct: chosen === q!.correctLetter, timeMs },
  });
  redirect(`${back(form)}&tentativa=${attempt.id}`);
}

export async function toggleMark(form: FormData) {
  const user = await requireUser();
  const questionId = String(form.get("questionId"));
  const kind = form.get("kind") === "REVIEW_LATER" ? "REVIEW_LATER" : "FAVORITE";
  if (!(await loadVisible(user.id, user.stateCode, questionId, user.role))) redirect("/app/planos?bloqueado=1");
  const key = { userId_questionId_kind: { userId: user.id, questionId, kind } };
  if (await db.favorite.findUnique({ where: key })) await db.favorite.delete({ where: key });
  else await db.favorite.create({ data: { userId: user.id, questionId, kind } });
  redirect(back(form));
}

const FLAG_KINDS = ["gabarito", "portugues", "duplicada", "alternativa", "explicacao", "fonte", "outro"];

export async function reportProblem(form: FormData) {
  const user = await requireUser();
  const kind = String(form.get("kind"));
  if (!FLAG_KINDS.includes(kind) || !rateLimit(`flag:${user.id}`, ...janela(REGRAS.limites.relatosPorAluno))) redirect(back(form));
  const questionId = String(form.get("questionId"));
  if (!(await loadVisible(user.id, user.stateCode, questionId, user.role))) redirect(back(form));
  await db.questionFlag.create({ data: { userId: user.id, questionId, kind, message: String(form.get("message") ?? "").slice(0, 1000) || null } });
  redirect(`${back(form)}&reportado=1`);
}

export async function subscribe(form: FormData) {
  const user = await requireUser();
  const plan = await db.plan.findFirst({ where: { id: String(form.get("planId")), active: true } });
  if (!plan) redirect("/app/planos");
  // Pedido fica PENDENTE. Só vira ATIVO por confirmação do gateway (webhook) ou do administrador.
  const pending = await db.subscription.findFirst({ where: { userId: user.id, planId: plan!.id, status: "PENDING" } });
  if (!pending) await db.subscription.create({ data: { userId: user.id, planId: plan!.id, status: "PENDING" } });
  redirect("/app/planos?pedido=1");
}

export async function savePreferences(form: FormData) {
  await requireUser();
  const jar = await cookies();
  const opts = { path: "/", maxAge: 365 * 86_400, sameSite: "lax" as const };
  const tema = String(form.get("tema"));
  const fonte = String(form.get("fonte"));
  if (["light", "dark", "auto"].includes(tema)) jar.set("tema", tema, opts);
  if (["small", "normal", "large", "xlarge"].includes(fonte)) jar.set("fonte", fonte, opts);
  // Apelido: só letras, números, espaço, ponto, hífen e sublinhado (evita conteúdo ofensivo/HTML).
  const nickname = String(form.get("nickname") ?? "").normalize("NFC").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().replace(/\s+/g, " ").slice(0, 30);
  const user = await requireUser();
  await db.user.update({ where: { id: user.id }, data: { nickname: nickname || null, rankingOptIn: form.get("rankingOptIn") === "on" && nickname.length >= 2 } });
  const meta = Math.min(Math.max(Math.round(Number(form.get("metaDiaria")) || 0), 0), 500);
  await db.goal.upsert({ where: { userId: user.id }, update: { questionsDay: meta || null }, create: { userId: user.id, questionsDay: meta || null } });
  revalidatePath("/", "layout");
  redirect("/app/configuracoes?salvo=1");
}

/**
 * EXCLUSÃO DE CONTA (LGPD, art. 18, VI). Apaga o histórico de estudo e anonimiza o cadastro.
 * Assinaturas e pagamentos são mantidos, sem dados pessoais, por obrigação fiscal/legal.
 */
export async function deleteAccount(form: FormData) {
  const user = await requireUser();
  const fail = (m: string): never => redirect(`/app/configuracoes?erro_exclusao=${encodeURIComponent(m)}`);
  if (user.role !== "STUDENT") fail("Contas da equipe não podem ser excluídas por aqui. Mude o papel no painel primeiro.");
  if (String(form.get("confirmacao") ?? "").trim().toUpperCase() !== "EXCLUIR") fail("Digite EXCLUIR para confirmar.");
  if (!rateLimit(`delete:${user.id}`, 5, 60 * 60_000)) fail("Muitas tentativas. Aguarde.");
  if (!(await verifyPassword(user.passwordHash, String(form.get("senha") ?? "")))) fail("Senha incorreta.");
  const id = user.id;
  const anon = `excluido-${id}@conta-excluida.invalid`;
  await db.$transaction([
    db.questionAttempt.deleteMany({ where: { userId: id } }),
    db.simulationAttempt.deleteMany({ where: { userId: id } }),
    db.simulation.deleteMany({ where: { createdBy: id } }),
    db.favorite.deleteMany({ where: { userId: id } }),
    db.notebook.deleteMany({ where: { userId: id } }),
    db.questionFlag.deleteMany({ where: { userId: id } }),
    db.goal.deleteMany({ where: { userId: id } }),
    db.notification.deleteMany({ where: { userId: id } }),
    db.passwordReset.deleteMany({ where: { userId: id } }),
    db.session.deleteMany({ where: { userId: id } }),
    db.user.update({
      where: { id },
      data: {
        name: "Conta excluída", email: anon, nickname: null, phone: null, schoolId: null, rankingOptIn: false,
        blocked: true, passwordHash: await hashPassword(crypto.randomUUID() + crypto.randomUUID()),
      },
    }),
    db.auditLog.create({ data: { actorId: id, action: "user.self_delete", entity: "User", entityId: id } }),
  ]);
  (await cookies()).delete("bizu_session");
  redirect("/?conta_excluida=1");
}
