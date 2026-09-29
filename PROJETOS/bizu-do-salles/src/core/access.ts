/** Regra única de acesso premium. Sempre executada no servidor; o frontend só exibe o resultado. */
export type Cycle = "BASIC" | "SPECIFIC";

export interface SubscriptionView {
  status: "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED";
  endsAt: Date | null;
  cycles: Cycle[];
}

export function canAccess(subs: SubscriptionView[], cycle: Cycle, now = new Date()): boolean {
  return subs.some(
    (s) => s.status === "ACTIVE" && s.endsAt !== null && s.endsAt > now && s.cycles.includes(cycle),
  );
}

export function daysRemaining(endsAt: Date | null, now = new Date()): number {
  if (!endsAt) return 0;
  return Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 86_400_000));
}

/** Ativa a assinatura somente a partir de um pagamento aprovado pelo gateway (webhook verificado). */
export function activationWindow(paymentStatus: string, durationDays: number, confirmedAt: Date) {
  if (paymentStatus !== "APPROVED") return null;
  return { startsAt: confirmedAt, endsAt: new Date(confirmedAt.getTime() + durationDays * 86_400_000) };
}
