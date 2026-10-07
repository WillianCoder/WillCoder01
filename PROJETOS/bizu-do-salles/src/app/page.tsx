/**
 * 📄 O QUE É: PÁGINA INICIAL (endereço /): apresentação, recursos, como funciona, grade, planos e perguntas.
 * ✏️ EDITÁVEL: Os TEXTOS ficam em src/config/site.ts. Os PLANOS e PREÇOS vêm do banco — mude no painel (Admin → Planos e preços).
 * ⚠️ CUIDADO: Aqui é a montagem da página; prefira editar os textos no arquivo de configuração.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { brl, CYCLE_NAME } from "@/lib/format";
import { SITE } from "@/config/site";
import { PublicHeader } from "@/components/PublicHeader";
import { cobertura } from "@/lib/cobertura";

export const dynamic = "force-dynamic";

/** Preço por dia em centavos (arredondado para cima, para nunca prometer menos do que é). */
const porDia = (p: { priceCents: number; durationDays: number }) => Math.ceil(p.priceCents / Math.max(1, p.durationDays));

export default async function Home({ searchParams }: { searchParams: Promise<{ conta_excluida?: string }> }) {
  const { conta_excluida } = await searchParams;
  const [plans, total, resumos, grade] = await Promise.all([
    db.plan.findMany({ where: { active: true }, orderBy: { priceCents: "asc" } }),
    db.question.count({ where: { status: "PUBLISHED" } }),
    db.material.count({ where: { published: true } }),
    cobertura(),
  ]);
  const maisBarato = plans.length ? plans.reduce((a, b) => (porDia(b) < porDia(a) ? b : a)) : null;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE.faqVenda.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <>
      <PublicHeader />
      <main className="container">
        {conta_excluida && <p className="alert ok" style={{ marginTop: "1rem" }}>Sua conta foi excluída. Obrigado por estudar com a gente.</p>}
        <section className="hero">
          <span className="badge">{SITE.selo}</span>
          <h1>{SITE.titulo}</h1>
          <p className="muted" style={{ maxWidth: 640 }}>{SITE.subtitulo.replace("{total}", String(total))}</p>
          {maisBarato && <p><strong>Planos a partir de {brl(porDia(maisBarato))} por dia.</strong> <span className="muted">Pix ou cartão · 7 dias de arrependimento.</span></p>}
          <div className="row" style={{ marginTop: "1.5rem" }}>
            <Link href="/cadastro" className="btn">{SITE.botoes.comecar}</Link>
            <a href="#planos" className="btn ghost">{SITE.botoes.planos}</a>
            <Link href="/cadastro?gratis=1" className="btn ghost">{SITE.botoes.gratis}</Link>
          </div>
        </section>

        <section className="grid stats numeros" aria-label="O Bizu em números">
          <div className="card"><div className="stat">{total}</div><div className="muted">questões comentadas</div></div>
          <div className="card"><div className="stat">{resumos}</div><div className="muted">resumos originais</div></div>
          <div className="card"><div className="stat">{grade.comQuestoes}/{grade.materiasTeoricas}</div><div className="muted">matérias teóricas da grade com questões</div></div>
          <div className="card"><div className="stat">0–10</div><div className="muted">nota nos simulados, como no curso</div></div>
        </section>

        <section style={{ padding: "2.5rem 0 0" }} aria-labelledby="recursos">
          <h2 id="recursos">O que você encontra</h2>
          <div className="grid">
            {SITE.recursos.map((r) => (
              <div className="card" key={r.titulo}>
                <div style={{ fontSize: "1.6rem" }} aria-hidden>{r.icone}</div>
                <h3>{r.titulo}</h3>
                <p className="muted">{r.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "2.5rem 0 0" }} aria-labelledby="como">
          <h2 id="como">Como funciona</h2>
          <ol className="grid passos">
            {SITE.passos.map((p) => (
              <li className="card" key={p.titulo}><h3>{p.titulo}</h3><p className="muted">{p.texto}</p></li>
            ))}
          </ol>
        </section>

        <section style={{ padding: "2.5rem 0 0" }} aria-labelledby="grade">
          <div className="card stack destaque">
            <h2 id="grade" style={{ margin: 0 }}>📚 Organizado pela grade oficial do curso</h2>
            <p className="muted">
              {grade.ciclos.map((c) => `${CYCLE_NAME[c.ciclo]}: ${c.materias.length} matérias (${c.horas} h-a)`).join(" · ")}.
              Veja matéria por matéria quantas questões e resumos já estão prontos.
            </p>
            <div><Link href="/grade" className="btn ghost">Ver a grade completa</Link></div>
          </div>
        </section>

        <section id="planos" style={{ padding: "3rem 0" }}>
          <h2>Planos</h2>
          <div className="grid">
            {plans.map((p) => (
              <div className={`card stack${p.id === maisBarato?.id && plans.length > 1 ? " destaque" : ""}`} key={p.id}>
                {p.id === maisBarato?.id && plans.length > 1 && <span className="badge">⭐ Menor preço por dia</span>}
                <h3>{p.name}</h3>
                <div className="stat">{brl(p.priceCents)}</div>
                <div className="muted">≈ {brl(porDia(p))} por dia · pagamento único</div>
                <p className="muted">{p.description}</p>
                <p>{p.cycles.map((c) => CYCLE_NAME[c]).join(" + ")} · {p.durationDays} dias de acesso</p>
                <Link href="/cadastro" className="btn">Assinar</Link>
              </div>
            ))}
          </div>
          <p className="muted">Antes de pagar, crie a conta grátis e teste as questões liberadas de cada matéria.</p>
        </section>

        <section style={{ paddingBottom: "3rem" }} aria-labelledby="faq">
          <h2 id="faq">Perguntas frequentes</h2>
          <div className="stack">
            {SITE.faqVenda.map(([q, a]) => <details className="card" key={q}><summary><strong>{q}</strong></summary><p>{a}</p></details>)}
          </div>
          <div className="row" style={{ marginTop: "1.5rem" }}>
            <Link href="/cadastro" className="btn">{SITE.botoes.comecar}</Link>
            <Link href="/ajuda" className="btn ghost">Mais dúvidas</Link>
          </div>
        </section>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      </main>
      <footer className="container muted" style={{ padding: "2rem 16px", borderTop: "1px solid var(--border)" }}>
        <p>© {SITE.nome} · <Link href="/grade">Grade do curso</Link> · <Link href="/termos">Termos de uso</Link> · <Link href="/privacidade">Privacidade</Link> · <Link href="/ajuda">Ajuda</Link></p>
        <p>Projeto independente de estudo. Não é afiliado nem endossado pela Polícia Militar do Estado de São Paulo.</p>
      </footer>
    </>
  );
}
