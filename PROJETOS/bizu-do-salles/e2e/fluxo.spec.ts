import { expect, test, type Page } from "./fixtures";

const email = `aluno${Date.now()}@teste.dev`;
const senha = "senha-forte-123";

async function entrar(page: Page) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("cadastro, questão, desempenho e sessão única", async ({ browser }) => {
  const celular = await browser.newPage();
  await celular.goto("/cadastro");
  await celular.getByLabel("Nome completo").fill("Aluno Teste");
  await celular.getByLabel("E-mail").fill(email);
  await celular.getByLabel("Senha (mínimo 8 caracteres)").fill(senha);
  await celular.getByLabel("Confirme a senha").fill(senha);
  await celular.getByRole("checkbox").check();
  await celular.getByRole("button", { name: "Criar conta" }).click();
  await expect(celular.getByRole("heading", { name: /Olá, Aluno/ })).toBeVisible();

  // Responde uma questão grátis: o gabarito só aparece depois.
  await celular.goto("/app/questoes");
  await expect(celular.getByText("Por quê?")).toHaveCount(0);
  await celular.locator(".option").first().click();
  await celular.getByRole("button", { name: "Responder" }).click();
  await expect(celular.getByText(/Gabarito:/)).toBeVisible();
  await expect(celular.getByText("Por quê?")).toBeVisible();

  await celular.goto("/app/desempenho");
  await expect(celular.getByText("Questões respondidas")).toBeVisible();

  // Aluno não entra no painel administrativo.
  await celular.goto("/admin");
  await expect(celular).toHaveURL(/\/app$/);

  // Novo login em outro "aparelho" derruba o primeiro.
  const computador = await browser.newPage();
  await entrar(computador);
  await expect(computador).toHaveURL(/\/app/);
  await celular.goto("/app");
  await expect(celular.getByText("Sua conta foi conectada em outro dispositivo.")).toBeVisible();
});

test("sem login não acessa a área do aluno", async ({ page }) => {
  await page.goto("/app/questoes");
  await expect(page).toHaveURL(/\/entrar/);
});

test("senha errada mostra mensagem genérica", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("ninguem@teste.dev");
  await page.getByLabel("Senha").fill("qualquer-coisa");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
});

test("cabeçalhos de segurança presentes", async ({ request }) => {
  const r = await request.get("/");
  expect(r.headers()["x-frame-options"]).toBe("DENY");
  expect(r.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(r.headers()["x-powered-by"]).toBeUndefined();
});
