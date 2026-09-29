"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { visibleWhere } from "@/lib/questions";
import { originalLetter } from "@/core/shuffle";
import { rateLimit } from "@/lib/rate-limit";

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
  if (!rateLimit(`answer:${user.id}`, 120, 60_000)) redirect(`${back(form)}&erro=limite`);
  const q = await loadVisible(user.id, user.stateCode, questionId, user.role);
  if (!q) redirect("/app/planos?bloqueado=1"); // sem acesso: nunca confiar no que veio do navegador
  const chosen = originalLetter(user.id, q!.id, shown);
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
  if (!FLAG_KINDS.includes(kind) || !rateLimit(`flag:${user.id}`, 10, 60 * 60_000)) redirect(back(form));
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
  const nickname = String(form.get("nickname") ?? "").trim().slice(0, 30);
  const user = await requireUser();
  await db.user.update({ where: { id: user.id }, data: { nickname: nickname || null } });
  revalidatePath("/", "layout");
  redirect("/app/configuracoes?salvo=1");
}
