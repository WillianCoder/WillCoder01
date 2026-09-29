// Simulador do Mercado Pago usado SOMENTE nos testes automáticos (nenhum dinheiro envolvido).
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_MP_PORT ?? 3999);
const APP = process.env.MOCK_APP_URL ?? "http://localhost:3100";
const payments = new Map();
const prefs = [];

const read = (req) => new Promise((ok) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => ok(b ? JSON.parse(b) : {})); });
const send = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "GET" && url.pathname === "/") return send(res, 200, { ok: true });
  if (req.method === "POST" && url.pathname === "/checkout/preferences") {
    if (req.headers.authorization !== "Bearer teste") return send(res, 401, { message: "token" });
    const body = await read(req);
    prefs.push(body);
    return send(res, 201, { id: `pref-${prefs.length}`, init_point: `${APP}/app/planos?pedido=1&mock=1` });
  }
  if (req.method === "GET" && url.pathname === "/__preferences/last") return send(res, 200, prefs.at(-1) ?? {});
  if (req.method === "POST" && url.pathname === "/__payments") { const p = await read(req); payments.set(String(p.id), p); return send(res, 200, { ok: true }); }
  const m = url.pathname.match(/^\/v1\/payments\/(\d+)$/);
  if (req.method === "GET" && m) return payments.has(m[1]) ? send(res, 200, payments.get(m[1])) : send(res, 404, { message: "not found" });
  send(res, 404, { message: "rota desconhecida" });
}).listen(PORT, () => console.log(`mock mercadopago em ${PORT}`));
