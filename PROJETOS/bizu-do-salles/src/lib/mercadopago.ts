/**
 * 📄 O QUE É: INTEGRAÇÃO COM O MERCADO PAGO (servidor): cria o checkout e processa pagamentos confirmados.
 * ✏️ EDITÁVEL: nada aqui. Configure MERCADOPAGO_ACCESS_TOKEN e MERCADOPAGO_WEBHOOK_SECRET no .env
 *   (passo a passo em docs/PAYMENTS.md). Sem elas, o site usa a liberação manual pelo painel.
 * ⚠️ CUIDADO: área de SEGURANÇA e DINHEIRO.
 *   - O acesso só é liberado depois de CONSULTAR o pagamento na API do Mercado Pago (nunca pelo corpo do aviso).
 *   - O valor pago precisa bater com o valor do pedido.
 *   - Cada pagamento é gravado uma única vez (idempotência por gatewayId).
 */
import "server-only";
import { db } from "./db";
import { activationWindow } from "../core/access";

const API = () => (process.env.MERCADOPAGO_API_BASE ?? "https://api.mercadopago.com").replace(/\/$/, "");
export const mercadoPagoEnabled = () => Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN && process.env.MERCADOPAGO_WEBHOOK_SECRET);

async function mp(path: string, init?: RequestInit) {
  const r = await fetch(`${API()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Mercado Pago ${path}: HTTP ${r.status}`);
  return r.json();
}

/** Cria a página de pagamento (Pix, cartão, boleto) e devolve o endereço para o aluno. */
export async function createCheckout(opts: { subscriptionId: string; title: string; amountCents: number; email: string; baseUrl: string }) {
  const pref = await mp("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": `pref-${opts.subscriptionId}` },
    body: JSON.stringify({
      items: [{ id: opts.subscriptionId, title: opts.title, quantity: 1, currency_id: "BRL", unit_price: opts.amountCents / 100 }],
      payer: { email: opts.email },
      external_reference: opts.subscriptionId,
      notification_url: `${opts.baseUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${opts.baseUrl}/app/planos?retorno=aprovado`,
        pending: `${opts.baseUrl}/app/planos?retorno=pendente`,
        failure: `${opts.baseUrl}/app/planos?retorno=falhou`,
      },
      auto_return: "approved",
      statement_descriptor: "BIZU DO SALLES",
    }),
  });
  const url = (process.env.MERCADOPAGO_SANDBOX === "1" ? pref.sandbox_init_point : pref.init_point) ?? pref.init_point;
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) throw new Error("Mercado Pago não retornou o link de pagamento.");
  return url;
}

const STATUS: Record<string, "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "CANCELED"> = {
  approved: "APPROVED", pending: "PENDING", in_process: "PENDING", authorized: "PENDING", in_mediation: "PENDING",
  rejected: "REJECTED", cancelled: "CANCELED", refunded: "REFUNDED", charged_back: "REFUNDED",
};

/** Consulta o pagamento no Mercado Pago e atualiza pedido/assinatura. Retorna um resumo do que foi feito. */
export async function processPayment(paymentId: string) {
  if (!/^\d{1,30}$/.test(paymentId)) return "id-invalido";
  const p = await mp(`/v1/payments/${paymentId}`);
  const subscriptionId = String(p.external_reference ?? "");
  const sub = await db.subscription.findUnique({ where: { id: subscriptionId }, include: { plan: true } });
  if (!sub) return "pedido-desconhecido";

  const status = STATUS[String(p.status)] ?? "PENDING";
  const paidCents = Math.round(Number(p.transaction_amount) * 100);
  const amountOk = p.currency_id === "BRL" && sub.amountCents !== null && paidCents === sub.amountCents;
  const now = new Date();

  const payment = await db.payment.upsert({
    where: { gatewayId: String(p.id) },
    update: { status, rawEvent: { status: p.status, status_detail: p.status_detail, amount: p.transaction_amount } },
    create: {
      userId: sub.userId, subscriptionId: sub.id, gateway: "mercadopago", gatewayId: String(p.id), amountCents: paidCents,
      couponId: sub.couponId, status, rawEvent: { status: p.status, status_detail: p.status_detail, amount: p.transaction_amount },
    },
  });

  if (status === "APPROVED" && !amountOk) {
    await db.auditLog.create({ data: { actorId: "sistema", action: "payment.amount_mismatch", entity: "Payment", entityId: payment.id, after: { pago: paidCents, esperado: sub.amountCents } } });
    return "valor-divergente";
  }
  if (status === "APPROVED" && sub.status !== "ACTIVE") {
    const w = activationWindow("APPROVED", sub.plan.durationDays, now)!;
    // updateMany com condição evita ativar duas vezes se dois avisos chegarem juntos.
    const done = await db.subscription.updateMany({ where: { id: sub.id, status: { not: "ACTIVE" } }, data: { status: "ACTIVE", startsAt: w.startsAt, endsAt: w.endsAt, source: "web" } });
    if (done.count === 1) {
      await db.payment.update({ where: { id: payment.id }, data: { confirmedAt: now } });
      if (sub.couponId) await db.coupon.update({ where: { id: sub.couponId }, data: { used: { increment: 1 } } });
      await db.auditLog.create({ data: { actorId: "sistema", action: "subscription.activate_gateway", entity: "Subscription", entityId: sub.id, after: { pagamento: String(p.id), endsAt: w.endsAt } } });
    }
    return "ativado";
  }
  if ((status === "REFUNDED" || status === "CANCELED") && sub.status === "ACTIVE") {
    await db.subscription.update({ where: { id: sub.id }, data: { status: "CANCELED" } });
    await db.auditLog.create({ data: { actorId: "sistema", action: "subscription.cancel_gateway", entity: "Subscription", entityId: sub.id, after: { pagamento: String(p.id), status: p.status } } });
    return "cancelado";
  }
  return "registrado";
}
