import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { brl, CYCLE_NAME, date } from "@/lib/format";
import { subscribe } from "../actions";

export const metadata = { title: "Meu plano" };

export default async function Planos({ searchParams }: { searchParams: Promise<{ pedido?: string; bloqueado?: string }> }) {
  const user = await requireUser();
  const [{ current, days }, plans, pending, sp] = await Promise.all([
    userAccess(user.id, user.role),
    db.plan.findMany({ where: { active: true }, orderBy: { priceCents: "asc" } }),
    db.subscription.findMany({ where: { userId: user.id, status: "PENDING" }, include: { plan: true } }),
    searchParams,
  ]);
  const support = await db.setting.findUnique({ where: { key: "support_whatsapp" } });
  return (
    <div className="stack">
      <h1>Meu plano</h1>
      {sp.bloqueado && <p className="alert">Essa questão faz parte de um plano. Escolha abaixo para liberar.</p>}
      <div className="card">
        {current ? <p>Plano <strong>{current.plan.name}</strong> · válido até <strong>{date(current.endsAt)}</strong> ({days} dias restantes)</p> : <p>Você está no acesso grátis (questões de amostra).</p>}
      </div>
      {(sp.pedido || pending.length > 0) && (
        <div className="alert stack">
          <p><strong>Pedido registrado:</strong> {pending.map((p) => p.plan.name).join(", ")}.</p>
          <p>O acesso é liberado automaticamente assim que o pagamento é confirmado. {support?.value ? <>Dúvidas: WhatsApp {String(support.value)}.</> : null}</p>
        </div>
      )}
      <div className="grid">
        {plans.map((p) => (
          <form action={subscribe} className="card stack" key={p.id}>
            <input type="hidden" name="planId" value={p.id} />
            <h3>{p.name}</h3>
            <div className="stat">{brl(p.priceCents)}</div>
            <p className="muted">{p.description}</p>
            <p>{p.cycles.map((c) => CYCLE_NAME[c]).join(" + ")} · {p.durationDays} dias</p>
            <button className="btn" type="submit">Quero este plano</button>
          </form>
        ))}
      </div>
    </div>
  );
}
