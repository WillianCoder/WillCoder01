/**
 * 📄 O QUE É: robots.txt — diz aos buscadores (Google) o que podem indexar.
 * ✏️ EDITÁVEL: lista "disallow" (áreas que não devem aparecer no Google).
 * ⚠️ CUIDADO: isto NÃO protege nada; a proteção real é o login. Só evita indexar páginas privadas.
 */
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/app", "/admin", "/api"] } };
}
