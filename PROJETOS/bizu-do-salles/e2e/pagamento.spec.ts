import { createHmac } from "node:crypto";
import { expect, test, type Page } from "./fixtures";

const MOCK = "http://localhost:3999";
const SECRET = "segredo-teste";

function sign(dataId: string, requestId: string, ts: string) {
  return createHmac("sha256", SECRET).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");
}

async function signup(page: Page, email: string) {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Aluno Pagante MP");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha (mínimo 8 caracteres)").fill("senha-forte-123");
  await page.getByLabel("Confirme a senha").fill("senha-forte-123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/app/);
}

async function webhook(page: Page, paymentId: string, opts: { secretOk?: boolean } = {}) {
  const ts = String(Date.now());
  const reqId = `req-${paymentId}`;
  const v1 = opts.secretOk === false ? "0".repeat(64) : sign(paymentId, reqId, ts);
  return page.request.post(`/api/webhooks/mercadopago?data.id=${paymentId}&type=payment`, {
    headers: { "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": reqId },
    data: { type: "payment", data: { id: paymentId } },
  });
}

test("admin cria cupom; aluno paga com desconto; webhook assinado libera o acesso", async ({ browser }) => {
  const code = `TESTE${Date.now() % 100000}`;
  const admin = await browser.newPage();
  await admin.goto("/entrar");
  await admin.getByLabel("E-mail").fill("admin@teste.dev");
  await admin.getByLabel("Senha").fill("admin-teste-12345");
  await admin.getByRole("button", { name: "Entrar" }).click();
  await expect(admin).toHaveURL(/\/admin/);
  await admin.goto("/admin/cupons");
  await admin.getByLabel("Código").fill(code);
  await admin.getByLabel("Desconto em %").fill("10");
  await admin.getByRole("button", { name: "Criar cupom" }).click();
  await expect(admin.getByText("Cupom criado")).toBeVisible();

  const aluno = await browser.newPage();
  await signup(aluno, `mp${Date.now()}@teste.dev`);
  await aluno.goto("/app/planos");
  const form = aluno.locator("form", { hasText: "Básico + Específico" });
  await form.getByPlaceholder("Cupom de desconto (opcional)").fill(code);
  await form.getByRole("button", { name: "Pagar com Pix ou cartão" }).click();
  await expect(aluno.getByText("Pedido registrado:")).toBeVisible(); // o simulador devolve para esta página

  const pref = await (await aluno.request.get(`${MOCK}/__preferences/last`)).json();
  expect(pref.items[0].unit_price).toBe(44.91); // R$ 49,90 − 10% = R$ 44,91, calculado no servidor
  const subscriptionId = pref.external_reference;

  // Assinatura errada: recusado, nada é liberado.
  const pid = String(Date.now());
  await aluno.request.post(`${MOCK}/__payments`, { data: { id: pid, status: "approved", external_reference: subscriptionId, transaction_amount: 44.91, currency_id: "BRL" } });
  expect((await webhook(aluno, pid, { secretOk: false })).status()).toBe(401);
  await aluno.goto("/app");
  await expect(aluno.getByText(/dias restantes/)).toHaveCount(0);

  // Valor divergente: registrado, mas não libera.
  const pidRuim = String(Date.now() + 1);
  await aluno.request.post(`${MOCK}/__payments`, { data: { id: pidRuim, status: "approved", external_reference: subscriptionId, transaction_amount: 1, currency_id: "BRL" } });
  expect(await (await webhook(aluno, pidRuim)).json()).toMatchObject({ resultado: "valor-divergente" });

  // Assinatura correta + valor certo: libera.
  const r = await webhook(aluno, pid);
  expect(await r.json()).toMatchObject({ resultado: "ativado" });
  // Repetir o aviso não duplica nada.
  expect((await webhook(aluno, pid)).status()).toBe(200);
  await aluno.goto("/app");
  await expect(aluno.getByText(/dias restantes/)).toBeVisible();

  await admin.goto("/admin/cupons");
  await expect(admin.getByRole("row", { name: new RegExp(code) }).getByRole("cell").nth(2)).toHaveText("1");
});
