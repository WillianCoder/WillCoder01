import { expect, test, type Page } from "./fixtures";

async function signup(page: Page, email: string, senha = "senha-forte-123") {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Aluno LGPD");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha (mínimo 8 caracteres)").fill(senha);
  await page.getByLabel("Confirme a senha").fill(senha);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/app/);
}
async function loginAdmin(page: Page) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("admin@teste.dev");
  await page.getByLabel("Senha").fill("admin-teste-12345");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin/);
}

test("LGPD: baixar meus dados e excluir a conta", async ({ page }) => {
  const email = `lgpd${Date.now()}@teste.dev`;
  await signup(page, email);
  const r = await page.request.get("/app/meus-dados");
  expect(r.status()).toBe(200);
  const data = await r.json();
  expect(data.perfil.email).toBe(email);
  expect(JSON.stringify(data)).not.toContain("passwordHash");

  await page.goto("/app/configuracoes");
  await page.getByText("Excluir minha conta", { exact: true }).click();
  await page.getByLabel("Sua senha").fill("senha-forte-123");
  await page.getByLabel("Digite EXCLUIR para confirmar").fill("EXCLUIR");
  await page.getByRole("button", { name: "Excluir minha conta definitivamente" }).click();
  await expect(page.getByText("Sua conta foi excluída.")).toBeVisible();

  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha-forte-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
});

test("admin importa planilha: válidas entram em revisão, inválidas são apontadas", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/admin/importar");
  const n = String(Date.now() % 1000).padStart(3, "0");
  const csv =
    "codigo;ciclo;disciplina;assunto;estado;dificuldade;enunciado;A;B;C;D;E;gabarito;explicacao;referencia;fonte\n" +
    `IMP-OK-${n};ESPECIFICO;Regulamento Disciplinar da PM (RDPM);Importação;SP;MEDIA;Questão importada pela planilha de teste?;um;dois;três;quatro;cinco;C;Explicação suficiente para o validador.;LC 893/2001, art. 1º;Questão original de teste.\n` +
    `IMP-RUIM-${n};ESPECIFICO;RDPM;;SP;MEDIA;Curta?;a;b;c;d;e;Z;x;y;z\n`;
  await page.getByLabel("Arquivo CSV").setInputFiles({ name: "questoes.csv", mimeType: "text/csv", buffer: Buffer.from("﻿" + csv) });
  await page.getByRole("button", { name: "Importar" }).click();
  await expect(page.getByText(/questões importadas/)).toBeVisible();
  await expect(page.getByText(/Linha 3:/)).toBeVisible();
  await page.goto(`/admin/questoes?busca=IMP-OK-${n}`);
  await expect(page.getByRole("cell", { name: "Em revisão" })).toBeVisible();
});

test("admin promove aluno a editor, que passa a acessar o painel de questões", async ({ browser }) => {
  const email = `editor${Date.now()}@teste.dev`;
  const aluno = await browser.newPage();
  await signup(aluno, email);
  await aluno.goto("/admin/questoes");
  await expect(aluno).toHaveURL(/\/app$/);

  const admin = await browser.newPage();
  await loginAdmin(admin);
  await admin.goto(`/admin/usuarios?busca=${encodeURIComponent(email)}`);
  await admin.getByLabel("Papel de Aluno LGPD").selectOption("EDITOR");
  await admin.getByRole("button", { name: "Mudar papel" }).click();
  await expect(admin.getByText("Feito. Ação registrada na auditoria.")).toBeVisible();

  await aluno.goto("/admin/questoes");
  await expect(aluno.getByRole("heading", { name: /Questões/ })).toBeVisible();
});
