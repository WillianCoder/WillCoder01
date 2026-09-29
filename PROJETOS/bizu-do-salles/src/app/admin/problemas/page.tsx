import Link from "next/link";
import { db } from "@/lib/db";
import { date } from "@/lib/format";
import { resolveFlag } from "../actions";

export const metadata = { title: "Problemas relatados" };

export default async function AdminProblemas() {
  const flags = await db.questionFlag.findMany({ where: { resolvedAt: null }, include: { question: true, user: true }, orderBy: { createdAt: "asc" }, take: 100 });
  return (
    <div className="stack">
      <h1>Problemas relatados ({flags.length})</h1>
      {flags.length === 0 && <p className="card">Nenhum problema aberto. 👍</p>}
      {flags.map((f) => (
        <div className="card stack" key={f.id}>
          <div className="row"><span className="badge">{f.kind}</span><Link href={`/admin/questoes/${f.questionId}`}>{f.question.code}</Link><span className="muted">{f.user.name} · {date(f.createdAt)}</span></div>
          {f.message && <p>{f.message}</p>}
          <form action={resolveFlag}><input type="hidden" name="id" value={f.id} /><button className="btn small">Marcar como resolvido</button></form>
        </div>
      ))}
    </div>
  );
}
