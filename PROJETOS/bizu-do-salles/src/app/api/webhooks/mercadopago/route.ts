/**
 * 📄 O QUE É: ENDEREÇO QUE O MERCADO PAGO CHAMA quando um pagamento muda (webhook).
 *   Configure no painel do Mercado Pago: https://SEU-SITE/api/webhooks/mercadopago (evento "Pagamentos").
 * ⚠️ CUIDADO: confere a assinatura; depois consulta o pagamento na API (não confia no corpo do aviso).
 */
import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/core/mercadopago-signature";
import { mercadoPagoEnabled, processPayment } from "@/lib/mercadopago";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!mercadoPagoEnabled()) return NextResponse.json({ erro: "Pagamentos automáticos desativados." }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (!rateLimit(`mp-webhook:${ip}`, 300, 60_000)) return NextResponse.json({ erro: "limite" }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as { type?: string; data?: { id?: string | number } };
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? body.type ?? "";
  const dataId = String(url.searchParams.get("data.id") ?? body.data?.id ?? "");

  const ok = verifyWebhookSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: req.headers.get("x-request-id"),
    dataId,
    secret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
  });
  if (!ok) return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
  if (type !== "payment") return NextResponse.json({ ok: true, ignorado: type });

  try {
    const resultado = await processPayment(dataId);
    return NextResponse.json({ ok: true, resultado });
  } catch (e) {
    console.error("Webhook Mercado Pago:", e);
    // 500 faz o Mercado Pago tentar de novo mais tarde.
    return NextResponse.json({ erro: "falha ao processar" }, { status: 500 });
  }
}
