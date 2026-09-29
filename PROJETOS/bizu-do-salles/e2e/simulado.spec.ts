import { expect, test } from "@playwright/test";

test("simulado: montar, responder, finalizar e ver a correção", async ({ page }) => {
  const email = `sim${Date.now()}@teste.dev`;
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Aluno Simulado");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha (mínimo 8 caracteres)").fill("senha-forte-123");
  await page.getByLabel("Confirme a senha").fill("senha-forte-123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/app/);

  await page.goto("/app/simulados");
  await page.getByLabel("Quantidade").fill("5");
  await page.getByLabel("Tempo (min, 0 = livre)").fill("30");
  await page.getByRole("button", { name: "Montar simulado" }).click();
  await expect(page).toHaveURL(/\/app\/simulados\/\w+/);
  await expect(page.getByRole("timer")).toBeVisible();
  // O gabarito não pode estar na página antes de finalizar.
  await expect(page.getByText("Gabarito:")).toHaveCount(0);

  const blocks = page.locator("fieldset");
  const n = await blocks.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n - 1; i++) await blocks.nth(i).locator(".option").first().click(); // deixa a última em branco
  await page.getByRole("button", { name: "Finalizar simulado" }).click();

  await expect(page.getByRole("heading", { name: /Resultado/ })).toBeVisible();
  await expect(page.getByText("Aproveitamento")).toBeVisible();
  await expect(page.getByText("Por disciplina")).toBeVisible();
  await expect(page.getByText(/Gabarito: [A-E]/).first()).toBeAttached();

  await page.goto("/app/simulados");
  await expect(page.getByRole("link", { name: "Ver correção" })).toBeVisible();
});
