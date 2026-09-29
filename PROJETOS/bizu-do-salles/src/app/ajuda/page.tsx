/**
 * 📄 O QUE É: AJUDA E SUPORTE (endereço /ajuda).
 * ✏️ EDITÁVEL: Perguntas frequentes: src/config/site.ts (faq). WhatsApp/e-mail: painel → Visão geral.
 * ⚠️ CUIDADO: —
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import { TextPage } from "@/components/TextPage";
import { db } from "@/lib/db";
import { SITE } from "@/config/site";

export const metadata = { title: "Ajuda" };
export const dynamic = "force-dynamic";

export default async function Ajuda() {
  const s = Object.fromEntries((await db.setting.findMany({ where: { key: { in: ["support_whatsapp", "support_email"] } } })).map((x) => [x.key, String(x.value ?? "")]));
  return (
    <TextPage title="Ajuda e suporte">
      {SITE.faq.map(([q, a]) => <details className="card" key={q}><summary><strong>{q}</strong></summary><p>{a}</p></details>)}
      <div className="card"><h2>Fale com a gente</h2>
        <p>{s.support_whatsapp ? `WhatsApp: ${s.support_whatsapp}` : ""}{s.support_email ? ` · E-mail: ${s.support_email}` : ""}{!s.support_whatsapp && !s.support_email && "Contato em breve."}</p></div>
    </TextPage>
  );
}
