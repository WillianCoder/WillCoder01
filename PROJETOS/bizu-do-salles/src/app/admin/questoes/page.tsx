import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CYCLE_NAME } from "@/lib/format";

export const metadata = { title: "Questões" };
const STATUS: Record<string, string> = { GENERATED: "Gerada", IN_REVIEW: "Em revisão", REVIEWED: "Revisada", APPROVED: "Aprovada", PUBLISHED: "Publicada", REJECTED: "Rejeitada", ARCHIVED: "Arquivada" };
const PAGE = 30;

export default async function AdminQuestoes({ searchParams }: { searchParams: Promise<{ busca?: string; status?: string; pagina?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.pagina) || 1);
  const where: Prisma.QuestionWhereInput = {
    ...(sp.status && sp.status in STATUS ? { status: sp.status as "PUBLISHED" } : {}),
    ...(sp.busca ? { OR: [{ code: { contains: sp.busca, mode: "insensitive" } }, { statement: { contains: sp.busca, mode: "insensitive" } }] } : {}),
  };
  const [total, rows] = await Promise.all([
    db.question.count({ where }),
    db.question.findMany({ where, orderBy: { code: "asc" }, skip: (page - 1) * PAGE, take: PAGE, include: { subject: { include: { cycle: true } }, _count: { select: { attempts: true, flags: { where: { resolvedAt: null } } } } } }),
  ]);
  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}><h1>Questões ({total})</h1><span className="row"><Link className="btn ghost" href="/admin/importar">📥 Importar planilha</Link><Link className="btn" href="/admin/questoes/nova">+ Nova questão</Link></span></div>
      <form className="row" method="get">
        <input name="busca" defaultValue={sp.busca} placeholder="Buscar por código ou texto" style={{ maxWidth: 320 }} aria-label="Buscar" />
        <select name="status" defaultValue={sp.status ?? ""} style={{ maxWidth: 200 }} aria-label="Status">
          <option value="">Todos os status</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn small">Filtrar</button>
      </form>
      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Código</th><th>Disciplina</th><th>Enunciado</th><th>Status</th><th>Respostas</th></tr></thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id}>
                <td><Link href={`/admin/questoes/${q.id}`}>{q.code}</Link>{q.stateCode && <> <span className="badge">{q.stateCode}</span></>}</td>
                <td>{CYCLE_NAME[q.subject.cycle.code]}<br /><span className="muted">{q.subject.name}</span></td>
                <td>{q.statement.slice(0, 110)}{q.statement.length > 110 ? "…" : ""}</td>
                <td>{STATUS[q.status]}{q.isFree && <><br /><span className="badge">Grátis</span></>}{q._count.flags > 0 && <><br /><span className="badge">🆘 {q._count.flags}</span></>}</td>
                <td>{q._count.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row">
        {page > 1 && <Link className="btn ghost small" href={`?${new URLSearchParams({ ...sp, pagina: String(page - 1) })}`}>← Anterior</Link>}
        {page * PAGE < total && <Link className="btn ghost small" href={`?${new URLSearchParams({ ...sp, pagina: String(page + 1) })}`}>Próxima →</Link>}
      </div>
    </div>
  );
}
