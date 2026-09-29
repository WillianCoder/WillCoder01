/**
 * 📄 O QUE É: VERIFICAÇÃO DA ASSINATURA DO WEBHOOK DO MERCADO PAGO (regra pura, testada).
 *   O Mercado Pago envia o cabeçalho x-signature = "ts=<tempo>,v1=<hmac>". O HMAC-SHA256 é calculado
 *   com a chave secreta sobre o texto "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
 * ⚠️ CUIDADO: área de SEGURANÇA. Sem assinatura válida, o aviso é ignorado.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export function signatureManifest(dataId: string, requestId: string | null, ts: string) {
  // IDs alfanuméricos devem ir em minúsculas, conforme a documentação do Mercado Pago.
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  return `id:${id};${requestId ? `request-id:${requestId};` : ""}ts:${ts};`;
}

export function signWebhook(secret: string, dataId: string, requestId: string | null, ts: string) {
  return createHmac("sha256", secret).update(signatureManifest(dataId, requestId, ts)).digest("hex");
}

export function verifyWebhookSignature(opts: { xSignature: string | null; xRequestId: string | null; dataId: string; secret: string }) {
  if (!opts.xSignature || !opts.dataId || !opts.secret) return false;
  const parts = Object.fromEntries(opts.xSignature.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1 || !/^[0-9a-f]{64}$/i.test(v1)) return false;
  const expected = Buffer.from(signWebhook(opts.secret, opts.dataId, opts.xRequestId, ts), "hex");
  const got = Buffer.from(v1.toLowerCase(), "hex");
  return expected.length === got.length && timingSafeEqual(expected, got);
}
