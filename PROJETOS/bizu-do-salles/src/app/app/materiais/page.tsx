/**
 * 📄 O QUE É: BIBLIOTECA DE MATERIAIS (endereço /app/materiais): resumos, áudios e PDFs.
 * ✏️ EDITÁVEL: textos da tela. Materiais são cadastrados no painel (Admin → 📖 Materiais).
 * ⚠️ CUIDADO: acesso decidido no servidor (src/lib/materials.ts).
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { KIND_NAME, visibleMaterialWhere } from "@/lib/materials";
import { CYCLE_NAME } from "@/lib/format";

export const metadata = { title: "Materiais" };

export default async function Materiais({ searchParams }: { searchParams: Promise<{ tipo?: string; disciplina?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const { cycles } = await userAccess(user.id, user.role);
  const audioFlag = await db.featureFlag.findUnique({ where: { key: "audio" } });
  const tipo = sp.tipo && sp.tipo in KIND_NAME ? sp.tipo : undefined;
  const base = visibleMaterialWhere(user, cycles);
  const [items, subjects, locked] = await Promise.all([
    db.material.findMany({
      where: { AND: [base, tipo ? { kind: tipo } : {}, sp.disciplina ? { subjectId: sp.disciplina } : {}, audioFlag && !audioFlag.enabled ? { kind: { not: "audio" } } : {}] },
      include: { subject: true },
      orderBy: [{ cycle: "asc" }, { title: "asc" }],
      take: 200,
    }),
    db.subject.findMany({ where: { materials: { some: base } }, include: { cycle: true }, orderBy: { name: "asc" } }),
    db.material.count({ where: { published: true, free: false, cycle: { notIn: cycles as ("BASIC" | "SPECIFIC")[] } } }),
  ]);
  return (
    <div className="stack">
      <h1>📖 Materiais</h1>
      <form className="row" method="get" aria-label="Filtros">
        <select name="tipo" defaultValue={tipo ?? ""} aria-label="Tipo" style={{ maxWidth: 200 }}>
          <option value="">Todos os tipos</option>
          {Object.entries(KIND_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="disciplina" defaultValue={sp.disciplina ?? ""} aria-label="Disciplina" style={{ maxWidth: 320 }}>
          <option value="">Todas as disciplinas</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{CYCLE_NAME[s.cycle.code]} · {s.name}</option>)}
        </select>
        <button className="btn small">Filtrar</button>
      </form>
      {items.length === 0 && <p className="card muted">Nenhum material disponível com esses filtros.</p>}
      <div className="grid">
        {items.map((m) => (
          <Link key={m.id} href={`/app/materiais/${m.id}`} className="card stack" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="badge">{KIND_NAME[m.kind] ?? m.kind}</span>
            <h3>{m.title}</h3>
            <p className="muted">{m.cycle ? CYCLE_NAME[m.cycle] : "Geral"}{m.subject ? ` · ${m.subject.name}` : ""}{m.free ? " · Grátis" : ""}</p>
          </Link>
        ))}
      </div>
      {locked > 0 && cycles.length < 2 && <p className="alert">🔒 {locked} materiais fazem parte de planos. <Link href="/app/planos">Ver planos</Link></p>}
    </div>
  );
}
