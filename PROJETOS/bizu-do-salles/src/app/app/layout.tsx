import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logout } from "../auth-actions";

const NAV = [
  ["/app", "🏠", "Início"],
  ["/app/questoes", "❓", "Questões"],
  ["/app/questoes?filtro=erradas", "🔁", "Revisar erros"],
  ["/app/questoes?filtro=favoritas", "⭐", "Favoritas"],
  ["/app/questoes?filtro=revisar", "🚩", "Revisar depois"],
  ["/app/desempenho", "📊", "Desempenho"],
  ["/app/planos", "💳", "Meu plano"],
  ["/app/configuracoes", "⚙️", "Configurações"],
] as const;
const MOBILE = [NAV[0], NAV[1], NAV[5], NAV[6], NAV[7]];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="shell">
      <aside className="side">
        <Link href="/app" className="logo">Bizu do <b>Salles</b></Link>
        <p className="muted" style={{ fontSize: ".85rem" }}>{user.nickname ?? user.name.split(" ")[0]}</p>
        <nav aria-label="Menu principal">
          {NAV.map(([href, icon, label]) => <Link key={href} href={href}><span aria-hidden>{icon}</span>{label}</Link>)}
          {user.role !== "STUDENT" && <Link href="/admin"><span aria-hidden>🛠️</span>Administração</Link>}
        </nav>
        <form action={logout} style={{ marginTop: "1rem" }}><button className="btn ghost small" type="submit">Sair</button></form>
      </aside>
      <main className="main" id="conteudo">{children}</main>
      <nav className="bottom-nav" aria-label="Menu">
        {MOBILE.map(([href, icon, label]) => <Link key={href} href={href}><span aria-hidden>{icon}</span>{label}</Link>)}
      </nav>
    </div>
  );
}
