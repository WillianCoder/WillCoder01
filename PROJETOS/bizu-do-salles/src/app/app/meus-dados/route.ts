/**
 * 📄 O QUE É: DOWNLOAD "MEUS DADOS" (LGPD, art. 18) — arquivo JSON com tudo que o sistema guarda do aluno.
 * ⚠️ CUIDADO: nunca incluir o hash da senha nem dados de outros usuários.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await currentUser();
  if (!user) return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  const [subscriptions, payments, attempts, favorites, notebooks, simulations, goal, sessions] = await Promise.all([
    db.subscription.findMany({ where: { userId: user.id }, include: { plan: { select: { name: true } } } }),
    db.payment.findMany({ where: { userId: user.id }, select: { amountCents: true, status: true, createdAt: true, confirmedAt: true, gateway: true } }),
    db.questionAttempt.findMany({ where: { userId: user.id }, select: { createdAt: true, chosenLetter: true, correct: true, timeMs: true, question: { select: { code: true } } } }),
    db.favorite.findMany({ where: { userId: user.id }, select: { kind: true, createdAt: true, question: { select: { code: true } } } }),
    db.notebook.findMany({ where: { userId: user.id }, select: { name: true, createdAt: true, items: { select: { question: { select: { code: true } } } } } }),
    db.simulationAttempt.findMany({ where: { userId: user.id }, select: { startedAt: true, finishedAt: true, correct: true, total: true, simulation: { select: { title: true } } } }),
    db.goal.findUnique({ where: { userId: user.id }, select: { questionsDay: true } }),
    db.session.findMany({ where: { userId: user.id }, select: { createdAt: true, lastSeenAt: true, deviceLabel: true, revokedAt: true } }),
  ]);
  const data = {
    geradoEm: new Date().toISOString(),
    perfil: {
      nome: user.name, email: user.email, apelido: user.nickname, telefone: user.phone, estado: user.stateCode,
      escolaId: user.schoolId, participaRanking: user.rankingOptIn, criadoEm: user.createdAt,
      termosAceitosEm: user.termsAcceptedAt, privacidadeAceitaEm: user.privacyAcceptedAt,
    },
    assinaturas: subscriptions.map((s) => ({ plano: s.plan.name, status: s.status, inicio: s.startsAt, fim: s.endsAt, origem: s.source })),
    pagamentos: payments,
    respostas: attempts.map((a) => ({ questao: a.question.code, marcou: a.chosenLetter, acertou: a.correct, tempoMs: a.timeMs, em: a.createdAt })),
    marcacoes: favorites.map((f) => ({ questao: f.question.code, tipo: f.kind, em: f.createdAt })),
    cadernos: notebooks.map((n) => ({ nome: n.name, criadoEm: n.createdAt, questoes: n.items.map((i) => i.question.code) })),
    simulados: simulations.map((s) => ({ titulo: s.simulation.title, inicio: s.startedAt, fim: s.finishedAt, acertos: s.correct, total: s.total })),
    metaDiaria: goal?.questionsDay ?? null,
    acessos: sessions,
  };
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="meus-dados-bizu.json"`,
      "Cache-Control": "no-store",
    },
  });
}
