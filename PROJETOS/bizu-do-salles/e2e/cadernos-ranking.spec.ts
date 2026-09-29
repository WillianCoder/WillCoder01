import { expect, test, type Page } from "./fixtures";

async function signup(page: Page, email: string) {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Aluno Caderno");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha (mínimo 8 caracteres)").fill("senha-forte-123");
  await page.getByLabel("Confirme a senha").fill("senha-forte-123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/app/);
}

test("caderno: adicionar questão, estudar e gerar simulado", async ({ page }) => {
  await signup(page, `cad${Date.now()}@teste.dev`);
  await page.goto("/app/questoes");
  await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();
  await page.getByText("📒 Adicionar ao caderno").click();
  await page.getByLabel("Nome do novo caderno").fill("Revisão teste");
  await page.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(page.getByText("Adicionada ao caderno “Revisão teste”.")).toBeVisible();

  await page.goto("/app/cadernos");
  await expect(page.getByRole("heading", { name: "Revisão teste" })).toBeVisible();
  await expect(page.getByText("1 questão")).toBeVisible();
  await page.getByRole("link", { name: "Estudar" }).click();
  await expect(page.getByRole("heading", { name: /📒 Revisão teste/ })).toBeVisible();

  await page.goto("/app/cadernos");
  await page.getByRole("button", { name: "Simulado" }).click();
  await expect(page.getByRole("heading", { name: /📒 Revisão teste/ })).toBeVisible();
  await expect(page.locator("fieldset")).toHaveCount(1);
});

test("ranking: aparece só com autorização e apelido", async ({ page }) => {
  await signup(page, `rank${Date.now()}@teste.dev`);
  await page.goto("/app/questoes");
  await page.locator(".option").first().click();
  await page.getByRole("button", { name: "Responder" }).click();
  await expect(page.getByText(/Gabarito:/)).toBeVisible();

  await page.goto("/app/ranking");
  await expect(page.getByText("Você ainda não aparece no ranking.")).toBeVisible();

  const apelido = `Recruta${Date.now() % 100000}`;
  await page.goto("/app/configuracoes");
  await page.getByLabel("Apelido (aparece no ranking)").fill(`${apelido}<b>`);
  await page.getByText("🏆 Participar do ranking").click();
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByText("Preferências salvas.")).toBeVisible();
  await expect(page.getByLabel("Apelido (aparece no ranking)")).toHaveValue(`${apelido}b`); // caracteres especiais removidos

  await page.goto("/app/ranking?escopo=geral&periodo=geral");
  await expect(page.getByRole("cell", { name: `${apelido}b` })).toBeVisible();
});
