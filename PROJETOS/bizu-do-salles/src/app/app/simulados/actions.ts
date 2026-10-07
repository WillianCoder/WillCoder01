"use server";
/**
 * 📄 O QUE É: AÇÕES DOS SIMULADOS no servidor: criar (sortear questões) e finalizar (corrigir).
 * ✏️ EDITÁVEL: limites em src/config/regras.ts (simulado).
 * ⚠️ CUIDADO: área de SEGURANÇA — só sorteia questões que o aluno pode ver; correção só no servidor.
 */
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { filterWhere, FILTERS, visibleWhere, type Filter } from "@/lib/questions";
import { pickRandom, smartPick, type SmartCandidate } from "@/core/simulation";
import { orderFor, originalLetter } from "@/core/shuffle";
import { rateLimit } from "@/lib/rate-limit";
import { REGRAS } from "@/config/regras";

const fail = (msg: string): never => redirect(`/app/simulados?erro=${encodeURIComponent(msg)}`);

export async function createSimulation(form: FormData) {
  const user = await requireUser();
  const flag = await db.featureFlag.findUnique({ where: { key: "simulations" } });
  if (flag && !flag.enabled) fail("Simulados estão temporariamente desativados.");
  if (!rateLimit(`sim:${user.id}`, 20, 60 * 60_000)) fail("Muitos simulados criados em pouco tempo. Tente mais tarde.");

  const R = REGRAS.simulado;
  if (form.get("tipo") === "inteligente") return createSmartSimulation(user, Number(form.get("tempo")));
  const rapido = form.get("tipo") === "rapido";
  const filtro = String(form.get("filtro") ?? "todas");
  const filter: Filter = filtro in FILTERS ? (filtro as Filter) : "todas";
  const subjectId = String(form.get("disciplina") ?? "") || undefined;
  const notebookId = String(form.get("caderno") ?? "") || undefined;
  const n = rapido ? R.rapidoQuestoes : Math.min(Math.max(Number(form.get("quantidade")) || R.minQuestoes, R.minQuestoes), R.maxQuestoes);
  const minutos = rapido ? 0 : Math.min(Math.max(Number(form.get("minutos")) || 0, 0), R.maxMinutos);

  const { cycles } = await userAccess(user.id, user.role);
  const pool = await db.question.findMany({
    where: { AND: [visibleWhere(user, cycles), rapido ? {} : filterWhere(user.id, filter, subjectId, notebookId)] },
    select: { id: true },
    take: 3000,
  });
  if (pool.length === 0) fail("Nenhuma questão disponível com esses filtros.");
  const chosen = pickRandom(pool.map((q) => q.id), n);

  const subject = subjectId ? await db.subject.findUnique({ where: { id: subjectId } }) : null;
  const nb = notebookId ? await db.notebook.findFirst({ where: { id: notebookId, userId: user.id } }) : null;
  const label = nb ? ` · 📒 ${nb.name}` : subject ? ` · ${subject.name}` : "";
  const title = rapido ? "Simulado rápido" : `Simulado${label} · ${chosen.length} questões`;
  const sim = await db.simulation.create({
    data: {
      title, kind: rapido ? "quick" : filter === "erradas" ? "errors" : subjectId ? "subject" : "custom",
      timeLimitS: minutos ? minutos * 60 : null, createdBy: user.id,
      items: { create: chosen.map((questionId, position) => ({ questionId, position })) },
    },
  });
  const attempt = await db.simulationAttempt.create({ data: { simulationId: sim.id, userId: user.id, total: chosen.length } });
  redirect(`/app/simulados/${attempt.id}`);
}

export async function finishSimulation(form: FormData) {
  const user = await requireUser();
  const attempt = await db.simulationAttempt.findFirst({
    where: { id: String(form.get("attemptId")), userId: user.id },
    include: { simulation: { include: { items: { include: { question: { select: { id: true, correctLetter: true, options: { select: { letter: true, text: true }, orderBy: { letter: "asc" } } } } } } } } },
  });
  if (!attempt) redirect("/app/simulados");
  if (attempt!.finishedAt) redirect(`/app/simulados/${attempt!.id}`);

  const limit = attempt!.simulation.timeLimitS;
  const elapsedS = (Date.now() - attempt!.startedAt.getTime()) / 1000;
  // Enviou muito depois do fim do tempo: respostas não contam (evita burlar o cronômetro).
  const late = limit !== null && elapsedS > limit + REGRAS.simulado.toleranciaSegundos;
  const perQuestion = Math.round((Math.min(elapsedS, limit ?? elapsedS) * 1000) / Math.max(attempt!.simulation.items.length, 1));

  const answers = attempt!.simulation.items.flatMap(({ question: q }) => {
    const raw = form.get(`q_${q.id}`);
    const idx = Number(raw);
    if (late || raw === null || !Number.isInteger(idx) || idx < 0 || idx > 4) return [];
    const chosen = originalLetter(user.id, q.id, idx, orderFor(user.id, q));
    return [{ userId: user.id, questionId: q.id, chosenLetter: chosen, correct: chosen === q.correctLetter, timeMs: perQuestion, simulationAttemptId: attempt!.id }];
  });
  // Grava só se ninguém finalizou antes (evita envio duplo).
  const done = await db.simulationAttempt.updateMany({
    where: { id: attempt!.id, finishedAt: null },
    data: { finishedAt: new Date(), correct: answers.filter((a) => a.correct).length, total: attempt!.simulation.items.length },
  });
  if (done.count === 1 && answers.length) await db.questionAttempt.createMany({ data: answers });
  redirect(`/app/simulados/${attempt!.id}${late ? "?atrasado=1" : ""}`);
}

/**
 * Simulado inteligente ("Tenho 10/30/60 minutos"): prioriza questões que o aluno errou
 * e questões novas das matérias em que ele vai pior. Tempo e quantidade em REGRAS.simulado.tenhoMinutos.
 */
async function createSmartSimulation(user: Awaited<ReturnType<typeof requireUser>>, tempo: number) {
  const n = REGRAS.simulado.tenhoMinutos[tempo];
  if (!n) fail("Tempo inválido.");
  const { cycles } = await userAccess(user.id, user.role);
  const [pool, tentativas] = await Promise.all([
    db.question.findMany({ where: visibleWhere(user, cycles), select: { id: true, subjectId: true }, take: 3000 }),
    db.questionAttempt.findMany({ where: { userId: user.id }, select: { questionId: true, correct: true, question: { select: { subjectId: true } } }, orderBy: { createdAt: "desc" }, take: 5000 }),
  ]);
  if (pool.length === 0) fail("Nenhuma questão disponível para você ainda.");
  const errou = new Set(tentativas.filter((t) => !t.correct).map((t) => t.questionId));
  const respondeu = new Set(tentativas.map((t) => t.questionId));
  const porMateria = new Map<string, { total: number; certas: number }>();
  for (const t of tentativas) {
    const m = porMateria.get(t.question.subjectId) ?? { total: 0, certas: 0 };
    m.total++; if (t.correct) m.certas++;
    porMateria.set(t.question.subjectId, m);
  }
  const candidatos: SmartCandidate[] = pool.map((q) => {
    const m = porMateria.get(q.subjectId);
    return { id: q.id, answered: respondeu.has(q.id), wrongBefore: errou.has(q.id), subjectRate: m ? Math.round((m.certas / m.total) * 100) : null };
  });
  const chosen = smartPick(candidatos, n!);
  const sim = await db.simulation.create({
    data: {
      title: `Simulado inteligente · Tenho ${tempo} min · ${chosen.length} questões`, kind: "smart",
      timeLimitS: tempo * 60, createdBy: user.id,
      items: { create: chosen.map((questionId, position) => ({ questionId, position })) },
    },
  });
  const attempt = await db.simulationAttempt.create({ data: { simulationId: sim.id, userId: user.id, total: chosen.length } });
  redirect(`/app/simulados/${attempt.id}`);
}
