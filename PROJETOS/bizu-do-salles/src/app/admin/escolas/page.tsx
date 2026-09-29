import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveSchool, toggleSchool } from "../actions";

export const metadata = { title: "Escolas" };

export default async function AdminEscolas() {
  await requireAdmin();
  const schools = await db.school.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { users: true } } } });
  return (
    <div className="stack">
      <h1>Escolas / unidades de formação</h1>
      <p className="muted">O aluno só escolhe escolas desta lista (evita nomes duplicados ou ofensivos).</p>
      <form action={saveSchool} className="card row">
        <input name="name" placeholder="Nome da escola/unidade" required style={{ maxWidth: 340 }} aria-label="Nome" />
        <input name="city" placeholder="Cidade" style={{ maxWidth: 200 }} aria-label="Cidade" />
        <input name="stateCode" defaultValue="SP" maxLength={2} style={{ maxWidth: 80 }} aria-label="UF" />
        <button className="btn small">Adicionar</button>
      </form>
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table><thead><tr><th>Escola</th><th>Alunos</th><th></th></tr></thead>
          <tbody>{schools.map((s) => (
            <tr key={s.id}><td>{s.name} <span className="muted">{s.city ?? ""} {s.stateCode ?? ""}</span></td><td>{s._count.users}</td>
              <td><form action={toggleSchool}><input type="hidden" name="id" value={s.id} /><button className="btn ghost small">{s.active ? "Desativar" : "Reativar"}</button></form></td></tr>
          ))}</tbody></table>
      </div>
    </div>
  );
}
