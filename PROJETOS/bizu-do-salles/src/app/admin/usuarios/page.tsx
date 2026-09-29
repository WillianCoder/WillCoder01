import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { date } from "@/lib/format";
import { activateSubscription, cancelSubscription, endSessions, toggleBlock } from "../actions";

export const metadata = { title: "Usuários" };

export default async function AdminUsuarios({ searchParams }: { searchParams: Promise<{ busca?: string; salvo?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
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
      <section className="card stack">
        <h2>Pedidos aguardando pagamento ({pending.length})</h2>
        <p className="muted">Com o gateway ligado, a liberação é automática. Use a liberação manual só depois de conferir o pagamento no extrato.</p>
        {pending.map((s) => (
          <form action={activateSubscription} className="row" key={s.id} style={{ borderTop: "1px solid var(--border)", paddingTop: ".75rem" }}>
            <input type="hidden" name="id" value={s.id} />
            <span><strong>{s.user.name}</strong> ({s.user.email}) · {s.plan.name} · pedido em {date(s.createdAt)}</span>
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
