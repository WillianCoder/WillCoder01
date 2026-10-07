// Gera docs/O_QUE_PRECISO.pdf a partir de docs/preciso/preciso.html usando o Chromium do Playwright.
// Uso: npm run relatorio   (em ambientes com Chromium pré-instalado: PW_CHROMIUM_PATH=/caminho npm run relatorio)
import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.goto(pathToFileURL(join(root, "docs/preciso/preciso.html")).href, { waitUntil: "load" });
await page.pdf({
  path: join(root, "docs/O_QUE_PRECISO.pdf"),
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#5b6b7a">Bizu do Salles · O que preciso · página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
  margin: { top: "14mm", bottom: "16mm", left: "0", right: "0" },
});
await browser.close();
console.log("PDF gerado: docs/O_QUE_PRECISO.pdf");
