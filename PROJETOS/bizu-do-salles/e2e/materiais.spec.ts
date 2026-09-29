import { expect, test, type Page } from "./fixtures";

async function loginAdmin(page: Page) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("admin@teste.dev");
  await page.getByLabel("Senha").fill("admin-teste-12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin/);
}

test("aluno sem plano lê o resumo grátis e vê os demais bloqueados", async ({ page }) => {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Aluno Leitor");
  await page.getByLabel("E-mail").fill(`leitor${Date.now()}@teste.dev`);
  await page.getByLabel("Senha (mínimo 8 caracteres)").fill("senha-forte-123");
  await page.getByLabel("Confirme a senha").fill("senha-forte-123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/app/);

  await page.goto("/app/materiais");
  await page.getByRole("link", { name: /Transgressões: conceito e classificação/ }).click();
  await expect(page.getByRole("heading", { name: "Graves, médias e leves" })).toBeVisible();
  await expect(page.locator("strong", { hasText: "infração administrativa" })).toBeVisible(); // **negrito** vira destaque, sem HTML cru
  await page.goto("/app/materiais");
  await expect(page.getByText(/materiais fazem parte de planos/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Sanções disciplinares/ })).toHaveCount(0);
});

test("admin cadastra áudio: recusa link inseguro e publica com https", async ({ browser }) => {
  const admin = await browser.newPage();
  await loginAdmin(admin);
  await admin.goto("/admin/materiais/novo");
  const titulo = `Áudio teste ${Date.now()}`;
  await admin.getByLabel("Título").fill(titulo);
  await admin.getByLabel("Tipo").selectOption("audio");
  await admin.getByLabel(/Link do áudio\/PDF/).fill("http://inseguro.dev/a.mp3");
  await admin.getByText("Grátis (amostra").click();
  await admin.getByText("Publicado (alunos veem)").click();
  await admin.getByRole("button", { name: "Salvar material" }).click();
  await expect(admin.getByText("Informe um link https:// válido")).toBeVisible();

  await admin.getByLabel("Título").fill(titulo);
  await admin.getByLabel("Tipo").selectOption("audio");
  await admin.getByLabel(/Link do áudio\/PDF/).fill("https://exemplo.invalid/audio.mp3");
  await admin.getByText("Grátis (amostra").click();
  await admin.getByText("Publicado (alunos veem)").click();
  await admin.getByRole("button", { name: "Salvar material" }).click();
  await expect(admin.getByText("Material salvo")).toBeVisible();
  await admin.getByRole("link", { name: "Ver como aluno →" }).click();
  await expect(admin.getByRole("heading", { name: titulo })).toBeVisible();
  await expect(admin.locator("audio")).toHaveAttribute("src", "https://exemplo.invalid/audio.mp3");
  await expect(admin.getByRole("button", { name: "1,5×" })).toBeVisible();
});
