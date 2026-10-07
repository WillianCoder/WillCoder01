import { requireUser } from "@/lib/auth";
import { userAttempts } from "@/lib/stats";
import { groupStats, xray, type Stat } from "@/core/performance";
import { REGRAS } from "@/config/regras";

export const metadata = { title: "Desempenho" };

function Bars({ items }: { items: Stat[] }) {
  if (!items.length) return <p className="muted">Responda algumas questões para ver seus dados.</p>;
  return (
    <div className="stack">
      {items.map((s) => (
        <div key={s.key}>
          <div className="row" style={{ justifyContent: "space-between" }}><span>{s.key}</span><span className="muted">{s.rate}% · {s.correct}/{s.answered}</span></div>
          <div className="bar" role="img" aria-label={`${s.key}: ${s.rate}%`}><span style={{ width: `${s.rate}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export default async function Desempenho() {
  const user = await requireUser();
  const attempts = await userAttempts(user.id);
  const x = xray(attempts);
  const timed = attempts.filter((a) => a.timeMs);
  const avg = timed.length ? Math.round(timed.reduce((t, a) => t + a.timeMs!, 0) / timed.length / 1000) : 0;
  return (
    <div className="stack">
      <h1>Desempenho</h1>
      <div className="grid stats">
        <div className="card"><div className="muted">Aproveitamento geral</div><div className="stat">{x.overall.rate}%</div></div>
        <div className="card"><div className="muted">Questões respondidas</div><div className="stat">{x.overall.answered}</div></div>
        <div className="card"><div className="muted">Tempo médio por questão</div><div className="stat">{avg}s</div></div>
      </div>
      <section className="card stack"><h2>🎯 Raio-X</h2>
        <p><strong>Pontos fortes:</strong> {x.strong.map((s) => s.key).join(", ") || "—"}</p>
        <p><strong>Pontos a melhorar:</strong> {x.weak.map((s) => s.key).join(", ") || "—"}</p>
        {x.tips.length > 0 && <ul>{x.tips.map((t) => <li key={t}>{t}</li>)}</ul>}
        <p className="muted" style={{ fontSize: ".85rem" }}>O raio-x considera disciplinas com pelo menos {REGRAS.raioX.minimoRespostas} respostas.</p>
      </section>
      <section className="card stack"><h2>Por disciplina</h2><Bars items={groupStats(attempts, "subject")} /></section>
      <section className="card stack"><h2>Por assunto</h2><Bars items={groupStats(attempts, "topic")} /></section>
    </div>
  );
}
