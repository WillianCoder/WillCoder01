/**
 * 📄 O QUE É: sitemap.xml — lista as páginas públicas para o Google encontrar o site.
 * ✏️ EDITÁVEL: a lista de páginas. O endereço vem de APP_URL (.env).
 */
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return ["", "/grade", "/cadastro", "/ajuda", "/termos", "/privacidade"].map((p) => ({ url: `${base}${p}`, changeFrequency: p === "" || p === "/grade" ? "weekly" : "monthly" }));
}
