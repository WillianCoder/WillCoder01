// Gera docs/PLANO_DE_NEGOCIO.pdf a partir de docs/negocio/negocio.html usando o Chromium do Playwright.
// Uso: npm run negocio   (em ambientes com Chromium pré-instalado: PW_CHROMIUM_PATH=/caminho npm run negocio)
import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.goto(pathToFileURL(join(root, "docs/negocio/negocio.html")).href, { waitUntil: "load" });
await page.pdf({
  path: join(root, "docs/PLANO_DE_NEGOCIO.pdf"),
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#5b6b7a">Bizu do Salles · Plano de negócio · página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
  margin: { top: "14mm", bottom: "16mm", left: "0", right: "0" },
});
await browser.close();
console.log("PDF gerado: docs/PLANO_DE_NEGOCIO.pdf");
