/**
 * 📄 O QUE É: CÁLCULO DO PREÇO COM CUPOM (regra pura, testada).
 * ✏️ EDITÁVEL: valor mínimo de cobrança em src/config/regras.ts (pagamento.minimoCentavos).
 * ⚠️ CUIDADO: o preço é sempre calculado no servidor a partir do banco — nunca vem do navegador.
 */
export interface CouponView {
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
  planSlugs: string[];
  maxUses: number | null;
  used: number;
  validUntil: Date | null;
  active: boolean;
}

export type CouponResult = { ok: true; finalCents: number; discountCents: number } | { ok: false; error: string };

export function applyCoupon(priceCents: number, planSlug: string, coupon: CouponView | null, minCents: number, now = new Date()): CouponResult {
  if (!coupon) return { ok: true, finalCents: priceCents, discountCents: 0 };
  if (!coupon.active) return { ok: false, error: "Cupom inativo." };
  if (coupon.validUntil && coupon.validUntil < now) return { ok: false, error: "Cupom expirado." };
  if (coupon.maxUses !== null && coupon.used >= coupon.maxUses) return { ok: false, error: "Cupom esgotado." };
  if (coupon.planSlugs.length > 0 && !coupon.planSlugs.includes(planSlug)) return { ok: false, error: "Cupom não vale para este plano." };
  const pct = Math.min(Math.max(coupon.percentOff ?? 0, 0), 100);
  const discount = Math.round((priceCents * pct) / 100) + Math.max(coupon.amountOffCents ?? 0, 0);
  const finalCents = Math.max(priceCents - discount, Math.min(minCents, priceCents));
  return { ok: true, finalCents, discountCents: priceCents - finalCents };
}
