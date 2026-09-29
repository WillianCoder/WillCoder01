/**
 * 📄 O QUE É: CUPONS DE DESCONTO (endereço /admin/cupons): criar, ver uso, ativar/desativar.
 * ✏️ EDITÁVEL: textos da tela. Valor mínimo cobrado: src/config/regras.ts (pagamento.minimoCentavos).
 * ⚠️ CUIDADO: o desconto é calculado no servidor; o cupom só conta como usado quando o pagamento é aprovado.
 */
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { brl, date } from "@/lib/format";
import { saveCoupon, toggleCoupon } from "../actions";

export const metadata = { title: "Cupons" };

export default async function Cupons({ searchParams }: { searchParams: Promise<{ erro?: string; salvo?: string }> }) {
  await requireAdmin();
  const [coupons, plans, sp] = await Promise.all([db.coupon.findMany({ orderBy: { createdAt: "desc" } }), db.plan.findMany({ orderBy: { priceCents: "asc" } }), searchParams]);
  return (
    <div className="stack">
      <h1>🎟️ Cupons de desconto</h1>
      {sp.erro && <p className="alert bad" role="alert">{sp.erro}</p>}
      {sp.salvo && <p className="alert ok">Cupom criado e registrado na auditoria.</p>}
      <form action={saveCoupon} className="card stack">
        <h2>Novo cupom</h2>
        <div className="grid">
          <div><label htmlFor="code">Código</label><input id="code" name="code" placeholder="BIZU10" required style={{ textTransform: "uppercase" }} /></div>
          <div><label htmlFor="percentOff">Desconto em %</label><input id="percentOff" name="percentOff" inputMode="numeric" placeholder="10" /></div>
          <div><label htmlFor="amountOff">ou desconto em R$</label><input id="amountOff" name="amountOff" inputMode="decimal" placeholder="5,00" /></div>
          <div><label htmlFor="maxUses">Limite de usos (vazio = sem limite)</label><input id="maxUses" name="maxUses" inputMode="numeric" /></div>
          <div><label htmlFor="validUntil">Válido até (opcional)</label><input id="validUntil" name="validUntil" type="date" /></div>
        </div>
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend className="muted">Vale para (nenhum marcado = todos os planos)</legend>
          {plans.map((p) => (
            <label key={p.id} className="row" style={{ fontWeight: 400 }}>
              <input type="checkbox" name="planSlugs" value={p.slug} style={{ width: "auto", minHeight: "auto" }} /> {p.name}
            </label>
          ))}
        </fieldset>
        <button className="btn">Criar cupom</button>
      </form>
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Código</th><th>Desconto</th><th>Uso</th><th>Validade</th><th>Planos</th><th></th></tr></thead>
          <tbody>
            {coupons.length === 0 && <tr><td colSpan={6} className="muted">Nenhum cupom ainda.</td></tr>}
            {coupons.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong>{!c.active && <> <span className="badge">Inativo</span></>}</td>
                <td>{c.percentOff ? `${c.percentOff}%` : ""}{c.percentOff && c.amountOffCents ? " + " : ""}{c.amountOffCents ? brl(c.amountOffCents) : ""}</td>
                <td>{c.used}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}</td>
                <td>{c.validUntil ? date(c.validUntil) : "—"}</td>
                <td className="muted">{c.planSlugs.length ? c.planSlugs.join(", ") : "Todos"}</td>
                <td><form action={toggleCoupon}><input type="hidden" name="id" value={c.id} /><button className="btn ghost small">{c.active ? "Desativar" : "Ativar"}</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
