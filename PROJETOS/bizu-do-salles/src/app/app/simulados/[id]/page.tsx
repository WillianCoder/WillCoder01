/**
 * 📄 O QUE É: PROVA E RESULTADO DO SIMULADO (endereço /app/simulados/<id>).
 *   - Em andamento: todas as questões numa página, com cronômetro (se houver tempo).
 *   - Finalizado: nota, desempenho por disciplina e correção comentada.
 * ✏️ EDITÁVEL: textos da tela.
 * ⚠️ CUIDADO: gabaritos só são mostrados depois de finalizado (não mover isso).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { orderFor } from "@/core/shuffle";
import { gradeSimulation, notaDez, secondsLeft, situacaoCFSd } from "@/core/simulation";
import { Timer } from "@/components/Timer";
import { createSimulation, finishSimulation } from "../actions";

export const metadata = { title: "Simulado" };
const POS = ["A", "B", "C", "D", "E"];

export default async function SimuladoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ atrasado?: string }> }) {
  const user = await requireUser();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const attempt = await db.simulationAttempt.findFirst({
    where: { id, userId: user.id },
    include: {
      answers: true,
      simulation: { include: { items: { orderBy: { position: "asc" }, include: { question: { include: { options: true, subject: true } } } } } },
    },
  });
  if (!attempt) notFound();
  const items = attempt.simulation.items.map((i) => i.question);

  if (!attempt.finishedAt) {
    // Gabarito NÃO vai para o navegador: só enunciado e alternativas embaralhadas.
    const left = secondsLeft(attempt.startedAt, attempt.simulation.timeLimitS);
    return (
      <form id="prova" action={finishSimulation} className="stack">
        <input type="hidden" name="attemptId" value={attempt.id} />
        <h1>{attempt.simulation.title}</h1>
        {left !== null && <Timer seconds={left} formId="prova" />}
        <p className="muted">Responda o que souber; questões em branco contam como erro. Ao terminar, clique em “Finalizar simulado”.</p>
        {items.map((q, n) => {
          const byLetter = Object.fromEntries(q.options.map((o) => [o.letter, o.text]));
          return (
            <fieldset className="card" key={q.id} style={{ margin: 0 }}>
              <legend className="muted" style={{ fontSize: ".85rem" }}>{q.subject.name}</legend>
              <p><span className="qnum">{n + 1}.</span>{q.statement}</p>
              {orderFor(user.id, q).map((orig, i) => (
                <label className="option" key={orig}>
                  <input type="radio" name={`q_${q.id}`} value={i} />
                  <span className="letter">{POS[i]}</span><span>{byLetter[orig]}</span>
                </label>
              ))}
            </fieldset>
          );
        })}
        <div className="row"><button className="btn" type="submit">Finalizar simulado</button></div>
      </form>
    );
  }

  const chosenBy = Object.fromEntries(attempt.answers.map((a) => [a.questionId, a.chosenLetter]));
  const r = gradeSimulation(items.map((q) => ({ subject: q.subject.name, correctLetter: q.correctLetter, chosenLetter: chosenBy[q.id] ?? null })));
  const minutes = Math.max(1, Math.round((attempt.finishedAt.getTime() - attempt.startedAt.getTime()) / 60000));
  const nota = notaDez(r.correct, r.total);
  const situacao = situacaoCFSd(nota);
  return (
    <div className="stack">
      <h1>Resultado · {attempt.simulation.title}</h1>
      {sp.atrasado && <p className="alert bad">O simulado foi enviado depois do fim do tempo; as respostas não foram consideradas.</p>}
      <p className={`alert ${situacao.nivel === "ok" ? "ok" : situacao.nivel === "risco" ? "bad" : ""}`} role="status">
        <strong>Nota {nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} / 10.</strong> {situacao.texto}
      </p>
      <div className="grid stats">
        <div className="card"><div className="muted">Acertos</div><div className="stat">{r.correct}/{r.total}</div></div>
        <div className="card"><div className="muted">Aproveitamento</div><div className="stat">{r.rate}%</div></div>
        <div className="card"><div className="muted">Erros / em branco</div><div className="stat">{r.wrong} / {r.blank}</div></div>
        <div className="card"><div className="muted">Tempo</div><div className="stat">{minutes} min</div></div>
      </div>
      <section className="card stack"><h2>Por disciplina</h2>
        {r.subjects.map((s) => (
          <div key={s.subject}>
            <div className="row" style={{ justifyContent: "space-between" }}><span>{s.subject}</span><span className="muted">{s.rate}% · {s.correct}/{s.total}</span></div>
            <div className="bar" role="img" aria-label={`${s.subject}: ${s.rate}%`}><span style={{ width: `${s.rate}%` }} /></div>
          </div>
        ))}
      </section>
      <div className="row">
        <form action={createSimulation}><input type="hidden" name="tipo" value="inteligente" /><input type="hidden" name="tempo" value="10" /><button className="btn" type="submit">🧠 Treinar meus pontos fracos (10 min)</button></form>
        <Link className="btn ghost" href="/app/simulados">Novo simulado</Link>
        <Link className="btn ghost" href="/app/questoes?filtro=erradas">Revisar meus erros</Link>
      </div>
      <h2>Correção</h2>
      {items.map((q, n) => {
        const order = orderFor(user.id, q);
        const byLetter = Object.fromEntries(q.options.map((o) => [o.letter, o]));
        const chosen = chosenBy[q.id] ?? null;
        const ok = chosen === q.correctLetter;
        return (
          <details className="card" key={q.id} open={!ok}>
            <summary><span className="qnum">{n + 1}.</span>{ok ? "✅" : chosen ? "❌" : "⬜"} {q.statement.slice(0, 90)}{q.statement.length > 90 ? "…" : ""}</summary>
            <div className="stack" style={{ marginTop: ".75rem" }}>
              <p>{q.statement}</p>
              {order.map((orig, i) => (
                <div key={orig} className={`option ${orig === q.correctLetter ? "correct" : orig === chosen ? "wrong" : ""}`}>
                  <span className="letter">{POS[i]}</span><span>{byLetter[orig]?.text}</span>
                </div>
              ))}
              <p><strong>Gabarito: {POS[order.indexOf(q.correctLetter)]}</strong>{!chosen && " · você deixou em branco"}</p>
              <p>{q.explanation}</p>
              <p className="muted">📌 {q.reference}</p>
            </div>
          </details>
        );
      })}
    </div>
  );
}
