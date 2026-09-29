// Gera os PDFs da pasta docs/ a partir dos HTML desta pasta.
// Uso: node docs/pdf/gerar_pdf.js   (requer playwright)
const { chromium } = require("playwright");
const path = require("path");
const PDFS = { "guia.html": "guia-boneco-arvore-ia.pdf", "instalacao.html": "instalacao-e-comandos.pdf" };
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [html, pdf] of Object.entries(PDFS)) {
    await page.goto("file://" + path.join(__dirname, html));
    await page.pdf({ path: path.join(__dirname, "..", pdf), format: "A4", printBackground: true });
  }
  await browser.close();
})();
