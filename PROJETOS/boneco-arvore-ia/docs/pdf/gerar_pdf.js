// Gera docs/guia-boneco-arvore-ia.pdf a partir de pdf/guia.html
// Uso: node pdf/gerar_pdf.js   (requer playwright)
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.join(__dirname, "guia.html"));
  await page.pdf({ path: path.join(__dirname, "..", "guia-boneco-arvore-ia.pdf"),
                   format: "A4", printBackground: true });
  await browser.close();
})();
