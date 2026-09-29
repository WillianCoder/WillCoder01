/**
 * 📄 O QUE É: MOLDURA de todas as páginas: título da aba, tema e tamanho da letra.
 * ✏️ EDITÁVEL: Nome e descrição do site: src/config/site.ts.
 * ⚠️ CUIDADO: Evite editar sem ajuda.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: { default: SITE.nome, template: `%s · ${SITE.nome}` },
  description: SITE.descricao,
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0e6b5c" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Preferências de tema e fonte ficam em cookies para já virem certas do servidor (sem "piscar").
  const jar = await cookies();
  const theme = jar.get("tema")?.value;
  const font = jar.get("fonte")?.value;
  return (
    <html lang="pt-BR" data-theme={theme === "light" || theme === "dark" ? theme : undefined} data-font={font}>
      <body>{children}</body>
    </html>
  );
}
