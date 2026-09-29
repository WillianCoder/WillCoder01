import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { brl, date } from "@/lib/format";
import { cookies } from "next/headers";
import { activateSubscription, adminResetLink, cancelSubscription, endSessions, setRole, toggleBlock } from "../actions";
import { requireAdmin as currentAdmin } from "@/lib/auth";

export const metadata = { title: "Usuários" };

export default async function AdminUsuarios({ searchParams }: { searchParams: Promise<{ busca?: string; salvo?: string; link?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const me = await currentAdmin();
  let reset: { email: string; link: string } | null = null;
  if (sp.link) try { reset = JSON.parse((await cookies()).get("reset_link")?.value ?? "null"); } catch { reset = null; }
  const [pending, users] = await Promise.all([
    db.subscription.findMany({ where: { status: "PENDING" }, include: { user: true, plan: true }, orderBy: { createdAt: "asc" } }),
    db.user.findMany({
      where: sp.busca ? { OR: [{ email: { contains: sp.busca, mode: "insensitive" } }, { name: { contains: sp.busca, mode: "insensitive" } }] } : {},
      orderBy: { createdAt: "desc" }, take: 50,
      include: { subscriptions: { where: { status: "ACTIVE" }, include: { plan: true } }, sessions: { where: { revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" }, take: 1 }, _count: { select: { attempts: true } } },
    }),
  ]);
  return (
    <div className="stack">
      <h1>Usuários e assinaturas</h1>
      {sp.salvo && <p className="alert ok">Feito. Ação registrada na auditoria.</p>}
      {reset && (
        <div className="alert ok stack">
          <p><strong>Link de nova senha para {reset.email}</strong> (vale {"uma vez"} e expira em breve). Copie e envie ao aluno:</p>
          <input readOnly value={reset.link} aria-label="Link de nova senha" />
          <p className="muted" style={{ fontSize: ".85rem" }}>Este link some desta tela em 2 minutos. Nunca publique em grupos.</p>
        </div>
      )}
      <section className="card stack">
        <h2>Pedidos aguardando pagamento ({pending.length})</h2>
        <p className="muted">Com o gateway ligado, a liberação é automática. Use a liberação manual só depois de conferir o pagamento no extrato.</p>
        {pending.map((s) => (
          <form action={activateSubscription} className="row" key={s.id} style={{ borderTop: "1px solid var(--border)", paddingTop: ".75rem" }}>
            <input type="hidden" name="id" value={s.id} />
            <span><strong>{s.user.name}</strong> ({s.user.email}) · {s.plan.name} · {s.amountCents !== null ? brl(s.amountCents) : brl(s.plan.priceCents)} · pedido em {date(s.createdAt)}</span>
            <input name="note" placeholder="Comprovante / observação" style={{ maxWidth: 240 }} required aria-label="Observação" />
            <button className="btn small">Confirmar pagamento e liberar</button>
          </form>
        ))}
      </section>
      <form className="row" method="get"><input name="busca" defaultValue={sp.busca} placeholder="Nome ou e-mail" style={{ maxWidth: 320 }} aria-label="Buscar" /><button className="btn small">Buscar</button></form>
      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Aluno</th><th>Plano ativo</th><th>Última atividade</th><th>Ações</th></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id}>
              <td><strong>{u.name}</strong>{u.role !== "STUDENT" && <> <span className="badge">{u.role}</span></>}{u.blocked && <> <span className="badge">Bloqueado</span></>}<br /><span className="muted">{u.email} · {u.stateCode ?? "—"} · {u._count.attempts} respostas</span></td>
              <td>{u.subscriptions.map((s) => (
                <form action={cancelSubscription} key={s.id}><input type="hidden" name="id" value={s.id} />{s.plan.name} até {date(s.endsAt)} <button className="btn ghost small">Cancelar</button></form>
              ))}{u.subscriptions.length === 0 && "—"}</td>
              <td>{u.sessions[0] ? `${date(u.sessions[0].lastSeenAt)} · ${u.sessions[0].deviceLabel?.slice(0, 40) ?? ""}` : "Desconectado"}</td>
              <td className="row">
                <form action={setRole} className="row" style={{ gap: ".3rem" }}>
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} aria-label={`Papel de ${u.name}`} disabled={u.id === me.id} style={{ width: "auto", minHeight: 36 }}>
                    <option value="STUDENT">Aluno</option><option value="EDITOR">Editor</option><option value="ADMIN">Administrador</option>
                  </select>
                  {u.id !== me.id && <button className="btn ghost small">Mudar papel</button>}
                </form>
                <form action={adminResetLink}><input type="hidden" name="id" value={u.id} /><button className="btn ghost small">Link de senha</button></form>
                <form action={endSessions}><input type="hidden" name="id" value={u.id} /><button className="btn ghost small">Desconectar</button></form>
                <form action={toggleBlock}><input type="hidden" name="id" value={u.id} /><button className={`btn small ${u.blocked ? "" : "danger"}`}>{u.blocked ? "Desbloquear" : "Bloquear"}</button></form>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
