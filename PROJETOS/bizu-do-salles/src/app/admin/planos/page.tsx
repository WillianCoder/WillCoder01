import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CYCLE_NAME } from "@/lib/format";
import { savePlan } from "../actions";

export const metadata = { title: "Planos" };

export default async function AdminPlanos({ searchParams }: { searchParams: Promise<{ salvo?: string; erro?: string }> }) {
  await requireAdmin();
  const [plans, sp] = await Promise.all([db.plan.findMany({ orderBy: { priceCents: "asc" } }), searchParams]);
  return (
    <div className="stack">
      <h1>Planos e preços</h1>
      <p className="muted">Mudanças valem para novas compras. Quem já assinou mantém a validade atual.</p>
      {sp.salvo && <p className="alert ok">Plano salvo e registrado na auditoria.</p>}
      {sp.erro && <p className="alert bad">Confira os campos (preço no formato 35,00; duração em dias).</p>}
      {plans.map((p) => (
        <form action={savePlan} className="card stack" key={p.id}>
          <input type="hidden" name="id" value={p.id} />
          <h2>{p.name} <span className="badge">{p.cycles.map((c) => CYCLE_NAME[c]).join(" + ")}</span></h2>
          <div className="grid">
            <div><label>Nome<input name="name" defaultValue={p.name} required /></label></div>
            <div><label>Preço (R$)<input name="price" defaultValue={(p.priceCents / 100).toFixed(2).replace(".", ",")} inputMode="decimal" required /></label></div>
            <div><label>Duração (dias)<input name="durationDays" type="number" min={1} defaultValue={p.durationDays} required /></label></div>
          </div>
          <label>Descrição<input name="description" defaultValue={p.description} required /></label>
          <label className="row" style={{ fontWeight: 400 }}><input type="checkbox" name="active" defaultChecked={p.active} style={{ width: "auto", minHeight: "auto" }} /> Plano à venda</label>
          <button className="btn small">Salvar</button>
        </form>
      ))}
    </div>
  );
}
