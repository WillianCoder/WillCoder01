/**
 * 📄 O QUE É: CONFIGURAÇÃO DO SERVIDOR e cabeçalhos de segurança.
 * ✏️ EDITÁVEL: Nada no dia a dia.
 * ⚠️ CUIDADO: Área de SEGURANÇA. Não remova os cabeçalhos.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import type { NextConfig } from "next";

// No modo de desenvolvimento (npm run dev) o Next.js precisa de 'unsafe-eval' e de conexão
// WebSocket para recarregar a página sozinho. Em produção isso continua BLOQUEADO.
const dev = process.env.NODE_ENV !== "production";

// Cabeçalhos de segurança aplicados a todas as páginas.
const security = [
  { key: "X-Frame-Options", value: "DENY" }, // impede o site de ser embutido (clickjacking)
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: `default-src 'self'; script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self' https:; connect-src 'self'${dev ? " ws: wss:" : ""}; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://*.mercadopago.com.br https://*.mercadopago.com https://*.mercadolivre.com`,
  },
];

const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@node-rs/argon2"],
  // Envio de planilhas (até 2 MB) pelo painel.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  async headers() {
    return [{ source: "/:path*", headers: security }];
  },
};
export default config;
