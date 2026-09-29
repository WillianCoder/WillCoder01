import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Auditoria" };

export default async function AdminAuditoria() {
  await requireAdmin();
  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const actors = Object.fromEntries((await db.user.findMany({ where: { id: { in: [...new Set(logs.map((l) => l.actorId))] } }, select: { id: true, name: true } })).map((u) => [u.id, u.name]));
  return (
    <div className="stack">
      <h1>Auditoria</h1>
      <p className="muted">Toda ação administrativa fica registrada aqui (últimas 200).</p>
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Registro</th></tr></thead>
          <tbody>{logs.map((l) => (
            <tr key={l.id}><td>{l.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td><td>{actors[l.actorId] ?? l.actorId}</td><td>{l.action}</td><td>{l.entity} {l.entityId.slice(0, 10)}</td></tr>
          ))}</tbody></table>
      </div>
    </div>
  );
}
