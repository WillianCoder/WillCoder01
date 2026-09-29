/**
 * 📄 O QUE É: MENU DO PAINEL DO ADMINISTRADOR.
 * ✏️ EDITÁVEL: Lista nav: [endereço, nome, só-admin?]. true = só ADMIN vê; false = EDITOR também vê.
 * ⚠️ CUIDADO: O bloqueio real de acesso está em cada página (requireAdmin) — não remova.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../auth-actions";

export const metadata = { title: { default: "Administração", template: "%s · Admin · Bizu do Salles" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin(["ADMIN", "EDITOR"]);
  const nav: [string, string, boolean][] = [
    ["/admin", "📈 Visão geral", true], ["/admin/questoes", "❓ Questões", false], ["/admin/importar", "📥 Importar planilha", true], ["/admin/problemas", "🆘 Problemas relatados", false],
    ["/admin/usuarios", "👥 Usuários e assinaturas", true], ["/admin/planos", "💳 Planos e preços", true],
    ["/admin/escolas", "🏫 Escolas", true], ["/admin/auditoria", "🗂️ Auditoria", true],
  ];
  return (
    <div className="shell">
      <aside className="side">
        <Link href="/admin" className="logo">Bizu <b>Admin</b></Link>
        <p className="muted" style={{ fontSize: ".85rem" }}>{user.name} · {user.role === "ADMIN" ? "Administrador" : "Editor"}</p>
        <nav aria-label="Administração">
          {nav.filter(([, , adminOnly]) => !adminOnly || user.role === "ADMIN").map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/app">↩ Área do aluno</Link>
        </nav>
        <form action={logout} style={{ marginTop: "1rem" }}><button className="btn ghost small">Sair</button></form>
      </aside>
      <main className="main">{children}</main>
      <nav className="bottom-nav" aria-label="Menu">
        <Link href="/admin"><span>📈</span>Geral</Link><Link href="/admin/questoes"><span>❓</span>Questões</Link>
        <Link href="/admin/usuarios"><span>👥</span>Usuários</Link><Link href="/admin/planos"><span>💳</span>Planos</Link>
      </nav>
    </div>
  );
}
