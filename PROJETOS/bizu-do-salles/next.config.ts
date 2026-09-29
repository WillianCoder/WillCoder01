/**
 * 📄 O QUE É: CONFIGURAÇÃO DO SERVIDOR e cabeçalhos de segurança.
 * ✏️ EDITÁVEL: Nada no dia a dia.
 * ⚠️ CUIDADO: Área de SEGURANÇA. Não remova os cabeçalhos.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a todas as páginas.
const security = [
  { key: "X-Frame-Options", value: "DENY" }, // impede o site de ser embutido (clickjacking)
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
];

const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@node-rs/argon2"],
  async headers() {
    return [{ source: "/:path*", headers: security }];
  },
};
export default config;
