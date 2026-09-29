/**
 * 📄 O QUE É: PAINEL DO ALUNO (endereço /app): plano, validade, acertos, sequência, recomendações.
 * ✏️ EDITÁVEL: Textos dos cartões (ex.: 'Respondidas', 'Continuar estudando').
 * ⚠️ CUIDADO: Os cálculos ficam em src/core/performance.ts e src/lib/stats.ts.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { userAccess } from "@/lib/access";
import { streak, userAttempts } from "@/lib/stats";
import { xray } from "@/core/performance";
import { date } from "@/lib/format";

export const metadata = { title: "Início" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ bemvindo?: string }> }) {
  const user = await requireUser();
  const [{ current, days }, attempts, st, { bemvindo }] = await Promise.all([userAccess(user.id, user.role), userAttempts(user.id), streak(user.id), searchParams]);
  const x = xray(attempts);
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

      <div className="grid">
        <div className="card"><div className="muted">Respondidas</div><div className="stat">{x.overall.answered}</div></div>
        <div className="card"><div className="muted">Acertos</div><div className="stat">{x.overall.correct}</div></div>
        <div className="card"><div className="muted">Erros</div><div className="stat">{x.overall.answered - x.overall.correct}</div></div>
        <div className="card"><div className="muted">Aproveitamento</div><div className="stat">{x.overall.rate}%</div></div>
        <div className="card"><div className="muted">Sequência</div><div className="stat">🔥 {st.streak} {st.streak === 1 ? "dia" : "dias"}</div><div className="muted">Hoje: {st.today} questões</div></div>
      </div>

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
