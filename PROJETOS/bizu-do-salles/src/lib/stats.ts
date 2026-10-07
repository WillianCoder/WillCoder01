import "server-only";
import { db } from "./db";
import type { Attempt } from "../core/performance";
import { maiorSequencia } from "../core/gamificacao";
import { notaDez } from "../core/simulation";

/** Tentativas do aluno no formato das regras de desempenho (limitado às 5.000 mais recentes). */
export async function userAttempts(userId: string): Promise<Attempt[]> {
  const rows = await db.questionAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: { correct: true, timeMs: true, question: { select: { subject: { select: { name: true } }, topic: { select: { name: true } } } } },
  });
  return rows.map((r) => ({ subject: r.question.subject.name, topic: r.question.topic?.name, correct: r.correct, timeMs: r.timeMs ?? undefined }));
}

/** Dias seguidos com pelo menos uma questão respondida (fuso de São Paulo). */
export async function streak(userId: string) {
  const rows = await db.questionAttempt.findMany({ where: { userId }, select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 3000 });
  const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const days = new Set(rows.map((r) => day(r.createdAt)));
  let n = 0;
  const cur = new Date();
  if (!days.has(day(cur))) cur.setDate(cur.getDate() - 1); // ainda não estudou hoje: conta até ontem
  while (days.has(day(cur))) { n++; cur.setDate(cur.getDate() - 1); }
  return { streak: n, recorde: maiorSequencia(days), today: rows.filter((r) => day(r.createdAt) === day(new Date())).length };
}

/** Totais para XP e conquistas (contam TODAS as respostas, sem o limite de 5.000). */
export async function totais(userId: string) {
  const [respondidas, acertos, simulados] = await Promise.all([
    db.questionAttempt.count({ where: { userId } }),
    db.questionAttempt.count({ where: { userId, correct: true } }),
    db.simulationAttempt.findMany({ where: { userId, finishedAt: { not: null } }, select: { correct: true, total: true, simulation: { select: { kind: true } } }, take: 2000 }),
  ]);
  return {
    respondidas,
    acertos,
    simulados: simulados.length,
    simuladosInteligentes: simulados.filter((s) => s.simulation.kind === "smart").length,
    melhorNotaSimulado: Math.max(0, ...simulados.filter((s) => s.total >= 10).map((s) => notaDez(s.correct, s.total))),
  };
}
