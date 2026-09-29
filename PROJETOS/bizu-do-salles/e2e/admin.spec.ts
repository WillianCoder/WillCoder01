import { expect, test, type Page } from "@playwright/test";

// Requer um admin de teste: ADMIN_PASSWORD=admin-teste-12345 npm run admin:create -- admin@teste.dev "Admin Teste"
async function loginAdmin(page: Page) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("admin@teste.dev");
  await page.getByLabel("Senha").fill("admin-teste-12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin/);
}

test("conteúdo pago bloqueado; admin libera o plano e o aluno passa a ver", async ({ browser }) => {
  const aluno = await browser.newPage();
  const email = `pago${Date.now()}@teste.dev`;
  await aluno.goto("/cadastro");
  await aluno.getByLabel("Nome completo").fill("Aluno Pagante");
  await aluno.getByLabel("E-mail").fill(email);
  await aluno.getByLabel("Senha (mínimo 8 caracteres)").fill("senha-forte-123");
  await aluno.getByLabel("Confirme a senha").fill("senha-forte-123");
  await aluno.getByRole("checkbox").check();
  await aluno.getByRole("button", { name: "Criar conta" }).click();
  await expect(aluno).toHaveURL(/\/app/);

  await aluno.goto("/app/questoes?filtro=todas");
  await expect(aluno.getByText(/questões estão bloqueadas/)).toBeVisible();

  await aluno.goto("/app/planos");
  await aluno.locator("form", { hasText: "Básico + Específico" }).getByRole("button").click();
  await expect(aluno.getByText("Pedido registrado:")).toBeVisible();

  const admin = await browser.newPage();
  await loginAdmin(admin);
  await admin.goto("/admin/usuarios");
  const pedido = admin.locator("form", { hasText: email });
  await pedido.getByPlaceholder("Comprovante / observação").fill("Pix conferido (teste)");
  await pedido.getByRole("button").click();
  await expect(admin.getByText("Feito. Ação registrada na auditoria.")).toBeVisible();
  await admin.goto("/admin/auditoria");
  await expect(admin.getByText("subscription.activate_manual").first()).toBeVisible();

  await aluno.goto("/app");
  await expect(aluno.getByText(/dias restantes/)).toBeVisible();
  await aluno.goto("/app/questoes?filtro=todas");
  await expect(aluno.getByText(/questões estão bloqueadas/)).toHaveCount(0);
});

test("admin cria questão pelo painel", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/questoes/nova");
  await page.getByLabel("Código").fill(`TST-E2E-${String(Date.now() % 1000).padStart(3, "0")}`);
  await page.getByLabel("Assunto").fill("Teste automático");
  await page.getByLabel("Enunciado").fill("Questão criada pelo teste automático do painel?");
  for (const l of ["A", "B", "C", "D", "E"]) await page.getByLabel(`Alternativa ${l}`, { exact: true }).fill(`Opção ${l}`);
  await page.getByLabel("Gabarito").selectOption("C");
  await page.getByLabel("Explicação (por que a correta está certa)").fill("Explicação de teste.");
  await page.getByLabel("Referência exata").fill("Teste");
  await page.getByLabel("Status").selectOption("ARCHIVED");
  await page.getByRole("button", { name: "Salvar questão" }).click();
  await expect(page.getByText("Questão salva e registrada na auditoria.")).toBeVisible();
});
