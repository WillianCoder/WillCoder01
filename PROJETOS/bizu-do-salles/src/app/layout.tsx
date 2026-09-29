import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bizu do Salles", template: "%s · Bizu do Salles" },
  description: "Estude por questões para o Ciclo Básico e o Ciclo Específico da formação policial militar.",
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
