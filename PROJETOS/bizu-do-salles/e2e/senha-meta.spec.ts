import { expect, test, type Page } from "./fixtures";

async function signup(page: Page, email: string, senha: string) {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Aluno Senha");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha (mínimo 8 caracteres)").fill(senha);
  await page.getByLabel("Confirme a senha").fill(senha);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/app/);
}

test("esqueci minha senha: resposta genérica para qualquer e-mail", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await expect(page).toHaveURL(/\/esqueci-senha/);
  await expect(page.getByRole("heading", { name: "Esqueci minha senha" })).toBeVisible();
  await page.getByLabel("E-mail").fill("ninguem-existe@teste.dev");
  await page.getByRole("button", { name: "Enviar link" }).click();
  await expect(page.getByText(/Se existir uma conta com esse e-mail/)).toBeVisible();
});

test("admin gera link, aluno troca a senha, link não pode ser reutilizado", async ({ browser }) => {
  const email = `senha${Date.now()}@teste.dev`;
  const aluno = await browser.newPage();
  await signup(aluno, email, "senha-antiga-123");

  const admin = await browser.newPage();
  await admin.goto("/entrar");
  await admin.getByLabel("E-mail").fill("admin@teste.dev");
  await admin.getByLabel("Senha").fill("admin-teste-12345");
  await admin.getByRole("button", { name: "Entrar" }).click();
  await expect(admin).toHaveURL(/\/admin/);
  await admin.goto(`/admin/usuarios?busca=${encodeURIComponent(email)}`);
  await admin.getByRole("button", { name: "Link de senha" }).click();
  await expect(admin.getByLabel("Link de nova senha")).toBeVisible();
  const link = await admin.getByLabel("Link de nova senha").inputValue();
  expect(link).toContain("/redefinir-senha?token=");

  const url = new URL(link);
  await aluno.goto(url.pathname + url.search);
  await aluno.getByLabel("Nova senha (mínimo 8 caracteres)").fill("senha-nova-456");
  await aluno.getByLabel("Confirme a nova senha").fill("senha-nova-456");
  await aluno.getByRole("button", { name: "Salvar nova senha" }).click();
  await expect(aluno.getByText("Senha alterada. Entre com a nova senha.")).toBeVisible();

  await aluno.getByLabel("E-mail").fill(email);
  await aluno.getByLabel("Senha").fill("senha-nova-456");
  await aluno.getByRole("button", { name: "Entrar" }).click();
  await expect(aluno).toHaveURL(/\/app/);

  await aluno.goto(url.pathname + url.search);
  await expect(aluno.getByRole("heading", { name: "Link inválido" })).toBeVisible();
});

test("meta diária aparece no painel", async ({ page }) => {
  await signup(page, `meta${Date.now()}@teste.dev`, "senha-forte-123");
  await page.goto("/app/configuracoes");
  await page.getByLabel(/Meta diária de questões/).fill("15");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByText("Preferências salvas.")).toBeVisible();
  await page.goto("/app");
  await expect(page.getByText("0/15 questões")).toBeVisible();
});
