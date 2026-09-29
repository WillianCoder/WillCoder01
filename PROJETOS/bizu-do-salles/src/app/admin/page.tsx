import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveSettings } from "./actions";

const FLAG_NAME: Record<string, string> = {
  ai: "Gerador de questões por IA", audio: "Áudios", free_content: "Material gratuito", gamification: "Gamificação (metas, conquistas)",
  ranking: "Ranking", simulations: "Simulados",
};

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  const user = await requireAdmin(["ADMIN", "EDITOR"]);
  const since = new Date(Date.now() - 7 * 86_400_000);
  const [users, newUsers, active, pending, published, review, attempts, flags, settings, featureFlags] = await Promise.all([
    db.user.count(), db.user.count({ where: { createdAt: { gte: since } } }),
    db.subscription.count({ where: { status: "ACTIVE", endsAt: { gt: new Date() } } }), db.subscription.count({ where: { status: "PENDING" } }),
    db.question.count({ where: { status: "PUBLISHED" } }), db.question.count({ where: { status: { in: ["GENERATED", "IN_REVIEW", "REVIEWED", "APPROVED"] } } }),
    db.questionAttempt.count({ where: { createdAt: { gte: since } } }), db.questionFlag.count({ where: { resolvedAt: null } }),
    db.setting.findMany(), db.featureFlag.findMany({ orderBy: { key: "asc" } }),
  ]);
  const s = Object.fromEntries(settings.map((x) => [x.key, String(x.value ?? "")]));
  const { salvo } = await searchParams;
  const cards: [string, number][] = [
    ["Usuários", users], ["Novos (7 dias)", newUsers], ["Assinaturas ativas", active], ["Pedidos pendentes", pending],
    ["Questões publicadas", published], ["Em revisão", review], ["Respostas (7 dias)", attempts], ["Problemas abertos", flags],
  ];
  return (
    <div className="stack">
      <h1>Visão geral</h1>
      {salvo && <p className="alert ok">Configurações salvas.</p>}
      <div className="grid">{cards.map(([k, v]) => <div className="card" key={k}><div className="muted">{k}</div><div className="stat">{v}</div></div>)}</div>
      {user.role === "ADMIN" && (
        <form action={saveSettings} className="card stack">
          <h2>Configurações gerais</h2>
          <div className="field"><label htmlFor="w">WhatsApp de suporte</label><input id="w" name="support_whatsapp" defaultValue={s.support_whatsapp} placeholder="(11) 90000-0000" /></div>
          <div className="field"><label htmlFor="e">E-mail de suporte</label><input id="e" name="support_email" type="email" defaultValue={s.support_email} /></div>
          <h3>Recursos ligados/desligados</h3>
          {featureFlags.map((f) => (
            <label key={f.key} className="row" style={{ fontWeight: 400 }}>
              <input type="checkbox" name={`flag_${f.key}`} defaultChecked={f.enabled} style={{ width: "auto", minHeight: "auto" }} /> {FLAG_NAME[f.key] ?? f.key}
            </label>
          ))}
          <button className="btn">Salvar</button>
        </form>
      )}
    </div>
  );
}
