import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { brl, CYCLE_NAME, date } from "@/lib/format";
import { subscribe } from "../actions";
import { mercadoPagoEnabled } from "@/lib/mercadopago";

export const metadata = { title: "Meu plano" };

export default async function Planos({ searchParams }: { searchParams: Promise<{ pedido?: string; bloqueado?: string; erro?: string; retorno?: string }> }) {
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
      {sp.erro && <p className="alert bad" role="alert">{sp.erro}</p>}
      {sp.retorno === "aprovado" && <p className="alert ok">Pagamento aprovado! A liberação acontece em instantes — atualize a página se ainda não apareceu.</p>}
      {sp.retorno === "pendente" && <p className="alert">Pagamento em processamento (ex.: Pix aguardando). O acesso é liberado assim que ele for confirmado.</p>}
      {sp.retorno === "falhou" && <p className="alert bad">O pagamento não foi concluído. Você pode tentar de novo.</p>}
      <div className="card">
        {current ? <p>Plano <strong>{current.plan.name}</strong> · válido até <strong>{date(current.endsAt)}</strong> ({days} dias restantes)</p> : <p>Você está no acesso grátis (questões de amostra).</p>}
      </div>
      {(sp.pedido || pending.length > 0) && (
        <div className="alert stack">
          <p><strong>Pedido registrado:</strong> {pending.map((p) => p.plan.name).join(", ")}.</p>
          <p>{mercadoPagoEnabled() ? "O acesso é liberado automaticamente assim que o pagamento é confirmado." : "Envie o comprovante ao suporte; o acesso é liberado após a conferência."} {support?.value ? <>Dúvidas: WhatsApp {String(support.value)}.</> : null}</p>
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
            <input name="cupom" placeholder="Cupom de desconto (opcional)" maxLength={40} aria-label={`Cupom para ${p.name}`} style={{ textTransform: "uppercase" }} />
            <button className="btn" type="submit">{mercadoPagoEnabled() ? "Pagar com Pix ou cartão" : "Quero este plano"}</button>
          </form>
        ))}
      </div>
    </div>
  );
}
