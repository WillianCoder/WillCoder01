import "server-only";
import { db } from "./db";
import { canAccess, daysRemaining, type Cycle } from "../core/access";

/** Ciclos liberados para o usuário + assinatura vigente (para exibir plano e validade). */
export async function userAccess(userId: string, role: string = "STUDENT") {
  const subs = await db.subscription.findMany({ where: { userId, status: "ACTIVE" }, include: { plan: true }, orderBy: { endsAt: "desc" } });
  const views = subs.map((s) => ({ status: s.status, endsAt: s.endsAt, cycles: s.plan.cycles as Cycle[] }));
  // Equipe (admin/editor) vê tudo para revisar o conteúdo, sem precisar de plano.
  const cycles = role !== "STUDENT" ? (["BASIC", "SPECIFIC"] as const).slice() : (["BASIC", "SPECIFIC"] as const).filter((c) => canAccess(views, c));
  const current = subs.find((s) => s.endsAt && s.endsAt > new Date()) ?? null;
  return { cycles, current, days: daysRemaining(current?.endsAt ?? null) };
}
