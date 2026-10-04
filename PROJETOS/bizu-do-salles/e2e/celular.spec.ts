import { expect, test } from "./fixtures";

// iPhone 14 Pro (393×852): o painel do admin precisa ser usável inteiro pelo celular.
test.use({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });

test("celular: admin acessa todas as áreas pelo botão ☰ Mais, sem rolagem lateral", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("admin@teste.dev");
  await page.getByLabel("Senha").fill("admin-teste-12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin/);
  await page.locator("details.more summary").click();
  for (const nome of ["Materiais", "Cupons", "Planos e preços", "Auditoria", "Escolas", "Importar planilha"]) {
    await expect(page.getByRole("menuitem", { name: new RegExp(nome) })).toBeVisible();
  }
  await page.getByRole("menuitem", { name: /Cupons/ }).click();
  await expect(page).toHaveURL(/\/admin\/cupons/);
  await expect(page.locator("details.more")).not.toHaveAttribute("open", "");
  const largura = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(largura).toBeLessThanOrEqual(393);
});
