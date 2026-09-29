import Link from "next/link";
import { db } from "@/lib/db";
import { brl, CYCLE_NAME } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
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
        <section className="hero">
          <span className="badge">Formação policial militar · foco em São Paulo</span>
          <h1>Estude por questões e saiba exatamente onde está errando.</h1>
          <p className="muted" style={{ maxWidth: 640 }}>
            Questões comentadas com a lei de base, simulados e um raio-x do seu desempenho, organizados
            em Ciclo Básico e Ciclo Específico. Hoje são {total} questões originais, e o banco cresce toda semana.
          </p>
          <div className="row" style={{ marginTop: "1.5rem" }}>
            <Link href="/cadastro" className="btn">Começar a estudar</Link>
            <a href="#planos" className="btn ghost">Conhecer planos</a>
            <Link href="/cadastro?gratis=1" className="btn ghost">Experimentar grátis</Link>
          </div>
        </section>

        <section className="grid" aria-label="Recursos">
          {[
            ["❓", "Questões comentadas", "Gabarito, explicação e o artigo da lei em cada questão."],
            ["📊", "Raio-X do aluno", "Pontos fortes, pontos a melhorar e o que revisar primeiro."],
            ["⭐", "Favoritas e revisão", "Marque questões e volte nelas quando quiser."],
            ["📱", "Celular e computador", "Funciona no navegador e pode ser instalado na tela inicial."],
          ].map(([icon, title, text]) => (
            <div className="card" key={title}>
              <div style={{ fontSize: "1.6rem" }} aria-hidden>{icon}</div>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
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
        <p>© Bizu do Salles · <Link href="/termos">Termos de uso</Link> · <Link href="/privacidade">Privacidade</Link> · <Link href="/ajuda">Ajuda</Link></p>
      </footer>
    </>
  );
}
