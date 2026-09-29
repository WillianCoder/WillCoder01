/**
 * 📄 O QUE É: PÁGINA INICIAL (endereço /): apresentação, recursos e planos.
 * ✏️ EDITÁVEL: Os TEXTOS ficam em src/config/site.ts. Os PLANOS e PREÇOS vêm do banco — mude no painel (Admin → Planos e preços).
 * ⚠️ CUIDADO: Aqui é a montagem da página; prefira editar os textos no arquivo de configuração.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { brl, CYCLE_NAME } from "@/lib/format";
import { SITE } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ conta_excluida?: string }> }) {
  const { conta_excluida } = await searchParams;
  const [plans, total] = await Promise.all([
    db.plan.findMany({ where: { active: true }, orderBy: { priceCents: "asc" } }),
    db.question.count({ where: { status: "PUBLISHED" } }),
  ]);
  return (
    <>
      <header className="topbar">
        <div className="container">
          <Link href="/" className="logo">Bizu do <b>Salles</b></Link>
          <nav className="row">
            <Link href="/entrar" className="btn ghost small">Entrar</Link>
            <Link href="/cadastro" className="btn small">Criar conta</Link>
          </nav>
        </div>
      </header>
      <main className="container">
        {conta_excluida && <p className="alert ok" style={{ marginTop: "1rem" }}>Sua conta foi excluída. Obrigado por estudar com a gente.</p>}
        <section className="hero">
          <span className="badge">{SITE.selo}</span>
          <h1>{SITE.titulo}</h1>
          <p className="muted" style={{ maxWidth: 640 }}>{SITE.subtitulo.replace("{total}", String(total))}</p>
          <div className="row" style={{ marginTop: "1.5rem" }}>
            <Link href="/cadastro" className="btn">{SITE.botoes.comecar}</Link>
            <a href="#planos" className="btn ghost">{SITE.botoes.planos}</a>
            <Link href="/cadastro?gratis=1" className="btn ghost">{SITE.botoes.gratis}</Link>
          </div>
        </section>

        <section className="grid" aria-label="Recursos">
          {SITE.recursos.map((r) => (
            <div className="card" key={r.titulo}>
              <div style={{ fontSize: "1.6rem" }} aria-hidden>{r.icone}</div>
              <h3>{r.titulo}</h3>
              <p className="muted">{r.texto}</p>
            </div>
          ))}
        </section>

        <section id="planos" style={{ padding: "3rem 0" }}>
          <h2>Planos</h2>
          <div className="grid">
            {plans.map((p) => (
              <div className="card stack" key={p.id}>
                <h3>{p.name}</h3>
                <div className="stat">{brl(p.priceCents)}</div>
                <p className="muted">{p.description}</p>
                <p>{p.cycles.map((c) => CYCLE_NAME[c]).join(" + ")} · {p.durationDays} dias de acesso</p>
                <Link href="/cadastro" className="btn">Assinar</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="container muted" style={{ padding: "2rem 16px", borderTop: "1px solid var(--border)" }}>
        <p>© {SITE.nome} · <Link href="/termos">Termos de uso</Link> · <Link href="/privacidade">Privacidade</Link> · <Link href="/ajuda">Ajuda</Link></p>
      </footer>
    </>
  );
}
