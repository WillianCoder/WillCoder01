/**
 * 📄 O QUE É: MENU DO PAINEL DO ADMINISTRADOR.
 * ✏️ EDITÁVEL: Lista nav: [endereço, nome, só-admin?]. true = só ADMIN vê; false = EDITOR também vê.
 * ⚠️ CUIDADO: O bloqueio real de acesso está em cada página (requireAdmin) — não remova.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import Link from "next/link";
import { MoreMenu } from "@/components/MoreMenu";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../auth-actions";

export const metadata = { title: { default: "Administração", template: "%s · Admin · Bizu do Salles" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin(["ADMIN", "EDITOR"]);
  const nav: [string, string, boolean][] = [
    ["/admin", "📈 Visão geral", true], ["/admin/questoes", "❓ Questões", false], ["/admin/importar", "📥 Importar planilha", true], ["/admin/materiais", "📖 Materiais", false], ["/admin/problemas", "🆘 Problemas", false],
    ["/admin/usuarios", "👥 Usuários e assinaturas", true], ["/admin/planos", "💳 Planos e preços", true], ["/admin/cupons", "🎟️ Cupons", true],
    ["/admin/escolas", "🏫 Escolas", true], ["/admin/auditoria", "🗂️ Auditoria", true],
  ];
  const permitidos = nav.filter(([, , adminOnly]) => !adminOnly || user.role === "ADMIN");
  // ✏️ EDITÁVEL: atalhos fixos da barra do celular (máx. 4); o resto fica no botão "☰ Mais"
  const curto = permitidos.filter(([href]) => ["/admin", "/admin/questoes", "/admin/usuarios", "/admin/problemas"].includes(href)).slice(0, 4);
  return (
    <div className="shell">
      <aside className="side">
        <Link href="/admin" className="logo">Bizu <b>Admin</b></Link>
        <p className="muted" style={{ fontSize: ".85rem" }}>{user.name} · {user.role === "ADMIN" ? "Administrador" : "Editor"}</p>
        <nav aria-label="Administração">
          {permitidos.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/app">↩ Área do aluno</Link>
        </nav>
        <form action={logout} style={{ marginTop: "1rem" }}><button className="btn ghost small">Sair</button></form>
      </aside>
      <main className="main">{children}</main>
      <nav className="bottom-nav" aria-label="Menu">
        {curto.map(([href, label]) => <Link key={href} href={href}><span aria-hidden>{label.split(" ")[0]}</span>{label.split(" ")[1]}</Link>)}
        <MoreMenu items={[...permitidos.filter(([href]) => !curto.some(([h]) => h === href)).map(([href, label]) => ({ href, icon: label.split(" ")[0], label: label.split(" ").slice(1).join(" ") })), { href: "/app", icon: "↩", label: "Área do aluno" }]}>
          <form action={logout}><button className="btn ghost small">Sair</button></form>
        </MoreMenu>
      </nav>
    </div>
  );
}
