import Link from "next/link";

/** Topo das páginas públicas: logo e atalhos (grade do curso, entrar, criar conta). */
export function PublicHeader() {
  return (
    <header className="topbar">
      <div className="container">
        <Link href="/" className="logo">Bizu do <b>Salles</b></Link>
        <nav className="row public-nav" aria-label="Principal">
          <Link href="/grade" className="hide-xs">Grade do curso</Link>
          <Link href="/entrar" className="btn ghost small">Entrar</Link>
          <Link href="/cadastro" className="btn small">Criar conta</Link>
        </nav>
      </div>
    </header>
  );
}
