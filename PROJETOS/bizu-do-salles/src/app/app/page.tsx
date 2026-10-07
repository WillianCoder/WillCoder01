/**
 * 📄 O QUE É: PAINEL DO ALUNO (endereço /app): plano, validade, acertos, sequência, patente/XP, conquistas, recomendações.
 * ✏️ EDITÁVEL: Textos dos cartões (ex.: 'Respondidas', 'Continuar estudando').
 * ⚠️ CUIDADO: Os cálculos ficam em src/core/performance.ts, src/core/gamificacao.ts e src/lib/stats.ts.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { userAccess } from "@/lib/access";
import { streak, totais, userAttempts } from "@/lib/stats";
import { groupStats, xray } from "@/core/performance";
import { calcularXP, conquistas, patente } from "@/core/gamificacao";
import { date } from "@/lib/format";

export const metadata = { title: "Início" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ bemvindo?: string }> }) {
  const user = await requireUser();
  const [{ current, days }, attempts, st, t, { bemvindo }] = await Promise.all([userAccess(user.id, user.role), userAttempts(user.id), streak(user.id), totais(user.id), searchParams]);
  const x = xray(attempts);
  const xp = calcularXP(t);
  const nivel = patente(xp);
  const medalhas = conquistas({ ...t, sequenciaRecorde: st.recorde, materias: groupStats(attempts, "subject") });
  const ganhas = medalhas.filter((m) => m.ganhou).length;
  const goal = await db.goal.findUnique({ where: { userId: user.id } });
  const meta = goal?.questionsDay ?? 0;
  const metaPct = meta ? Math.min(100, Math.round((st.today / meta) * 100)) : 0;
  return (
    <div className="stack">
      <h1>Olá, {user.nickname ?? user.name.split(" ")[0]}!</h1>
      {bemvindo && <p className="alert ok">Conta criada. Comece pelas questões grátis ou escolha um plano.</p>}

      <div className="card row" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="muted">Seu plano</div>
          <strong>{current ? current.plan.name : "Sem plano ativo (acesso às questões grátis)"}</strong>
          {current && <div className="muted">Validade: {date(current.endsAt)} · {days} dias restantes</div>}
        </div>
        <Link href="/app/planos" className="btn ghost small">{current ? "Ver plano" : "Conhecer planos"}</Link>
      </div>

      <div className="grid stats">
        <div className="card"><div className="muted">Respondidas</div><div className="stat">{x.overall.answered}</div></div>
        <div className="card"><div className="muted">Acertos</div><div className="stat">{x.overall.correct}</div></div>
        <div className="card"><div className="muted">Erros</div><div className="stat">{x.overall.answered - x.overall.correct}</div></div>
        <div className="card"><div className="muted">Aproveitamento</div><div className="stat">{x.overall.rate}%</div></div>
        <div className="card"><div className="muted">Sequência</div><div className="stat">🔥 {st.streak} {st.streak === 1 ? "dia" : "dias"}</div><div className="muted">Hoje: {st.today} questões</div></div>
      </div>

      <section className="card stack" aria-labelledby="nivel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="muted">Sua patente no Bizu · nível {nivel.nivel}</div>
            <h2 id="nivel" style={{ margin: 0 }}>🎖️ {nivel.nome}</h2>
          </div>
          <div className="stat" style={{ fontSize: "1.4rem" }}>{xp.toLocaleString("pt-BR")} XP</div>
        </div>
        <div className="bar" role="img" aria-label={`Progresso até a próxima patente: ${nivel.pct}%`}><span style={{ width: `${nivel.pct}%` }} /></div>
        <div className="muted">{nivel.proxima ? <>Faltam <strong>{nivel.faltam.toLocaleString("pt-BR")} XP</strong> para {nivel.proxima}. Cada acerto vale 10 XP, cada resposta 2 XP e cada simulado concluído 30 XP.</> : "Patente máxima! 🫡"}</div>
        <details>
          <summary><strong>🏅 Conquistas: {ganhas}/{medalhas.length}</strong></summary>
          <ul className="conquistas">
            {medalhas.map((m) => (
              <li key={m.id} className={m.ganhou ? "" : "off"} title={m.como}>
                <span aria-hidden>{m.icone}</span><span><strong>{m.nome}</strong><small className="muted">{m.ganhou ? "Conquistada" : m.como}</small></span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      {meta > 0 ? (
        <div className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>🎯 Meta de hoje</strong>
            <span className="muted">{st.today}/{meta} questões {st.today >= meta && "· meta batida! 🎉"}</span>
          </div>
          <div className="bar" role="img" aria-label={`Meta diária: ${metaPct}%`}><span style={{ width: `${metaPct}%` }} /></div>
        </div>
      ) : (
        <p className="muted"><Link href="/app/configuracoes">Defina uma meta diária de questões</Link> para acompanhar seu ritmo.</p>
      )}

      <div className="row">
        <Link href="/app/questoes" className="btn">Continuar estudando</Link>
        <Link href="/app/simulados" className="btn ghost">Fazer um simulado</Link>
        <Link href="/app/questoes?filtro=erradas" className="btn ghost">Revisar meus erros</Link>
      </div>

      {x.tips.length > 0 && (
        <div className="card stack">
          <h2>Recomendações</h2>
          <ul>{x.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
