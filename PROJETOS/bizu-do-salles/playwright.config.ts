import { defineConfig } from "@playwright/test";

// Testes de ponta a ponta: sobem o site (npm run build antes) e usam um navegador real.
// O Mercado Pago é substituído por um simulador local (e2e/mock-mercadopago.mjs) — valores abaixo são só de teste.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  workers: 1, // a regra de sessão única derrubaria logins simultâneos da mesma conta
  use: {
    baseURL: "http://localhost:3100",
    locale: "pt-BR",
    // Em ambientes com Chromium pré-instalado, aponte PW_CHROMIUM_PATH para ele.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: [
    { command: "node e2e/mock-mercadopago.mjs", url: "http://localhost:3999", reuseExistingServer: !process.env.CI, timeout: 20_000 },
    {
      command: "npx next start -p 3100",
      url: "http://localhost:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        MERCADOPAGO_ACCESS_TOKEN: "teste",
        MERCADOPAGO_WEBHOOK_SECRET: "segredo-teste",
        MERCADOPAGO_API_BASE: "http://localhost:3999",
        APP_URL: "http://localhost:3100",
      },
    },
  ],
});
