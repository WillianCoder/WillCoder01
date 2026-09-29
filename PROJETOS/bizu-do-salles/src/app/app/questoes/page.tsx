/**
 * 📄 O QUE É: TELA DE QUESTÕES (endereço /app/questoes): filtros, questão, resposta, favoritar, relatar problema.
 * ✏️ EDITÁVEL: Textos da tela. Nomes dos filtros: src/lib/questions.ts (FILTERS).
 * ⚠️ CUIDADO: A verificação de acesso e a correção acontecem no servidor (app/actions.ts) — não mover para o navegador.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { FILTERS, filterWhere, nextQuestionId, visibleWhere, type Filter } from "@/lib/questions";
import { displayOrder } from "@/core/shuffle";
import { stateWhere } from "@/core/states";
import { CYCLE_NAME, LEVEL_NAME } from "@/lib/format";
import { answer, reportProblem, toggleMark } from "../actions";

export const metadata = { title: "Questões" };
const POS = ["A", "B", "C", "D", "E"];

type SP = { filtro?: string; disciplina?: string; q?: string; tentativa?: string; reportado?: string; erro?: string };

export default async function Questoes({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const user = await requireUser();
  const { cycles } = await userAccess(user.id, user.role);
  const filter: Filter = sp.filtro && sp.filtro in FILTERS ? (sp.filtro as Filter) : "nao-respondidas";
  const base = visibleWhere(user, cycles);
  const where = { AND: [base, filterWhere(user.id, filter, sp.disciplina)] };
  const qs = (extra: Record<string, string>) => "/app/questoes?" + new URLSearchParams({ filtro: filter, ...(sp.disciplina ? { disciplina: sp.disciplina } : {}), ...extra });

  const subjects = await db.subject.findMany({ where: { active: true, questions: { some: base } }, include: { cycle: true }, orderBy: [{ cycle: { code: "asc" } }, { order: "asc" }, { name: "asc" }] });

  // Sem questão escolhida: vai para a próxima do filtro.
  if (!sp.q) {
    const id = await nextQuestionId(where);
    if (id) redirect(qs({ q: id }));
  }
  const q = sp.q ? await db.question.findFirst({ where: { id: sp.q, ...base }, include: { options: true, subject: { include: { cycle: true } }, topic: true } }) : null;
  const attempt = sp.tentativa && q ? await db.questionAttempt.findFirst({ where: { id: sp.tentativa, userId: user.id, questionId: q.id } }) : null;
  const marks = q ? await db.favorite.findMany({ where: { userId: user.id, questionId: q.id } }) : [];
  const nextId = q ? await nextQuestionId(filter === "nao-respondidas" ? { AND: [where, { id: { not: q.id } }] } : where, q.code) : null;
  const locked = await db.question.count({ where: { ...stateWhere(user.stateCode), status: "PUBLISHED", isFree: false, subject: { cycle: { code: { notIn: cycles as ("BASIC" | "SPECIFIC")[] } } } } });

  const order = q ? displayOrder(user.id, q.id) : [];
  const byLetter = Object.fromEntries(q?.options.map((o) => [o.letter, o]) ?? []);
  const here = q ? qs({ q: q.id }) : "";

  return (
    <div className="stack">
      <h1>Questões</h1>
      <form className="row" method="get" aria-label="Filtros">
        <select name="filtro" defaultValue={filter} style={{ maxWidth: 220 }} aria-label="Filtro">
          {Object.entries(FILTERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="disciplina" defaultValue={sp.disciplina ?? ""} style={{ maxWidth: 320 }} aria-label="Disciplina">
          <option value="">Todas as disciplinas</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{CYCLE_NAME[s.cycle.code]} · {s.name}</option>)}
        </select>
        <button className="btn small" type="submit">Filtrar</button>
      </form>

      {!q && (
        <div className="card stack">
          <p>Nenhuma questão neste filtro. 🎉</p>
          {filter !== "todas" && <Link className="btn ghost small" href="/app/questoes?filtro=todas">Ver todas</Link>}
        </div>
      )}

      {q && (
        <article className="card stack">
          <div className="row">
            <span className="badge">{q.code}</span>
            <span className="badge">{CYCLE_NAME[q.subject.cycle.code]}</span>
            <span className="badge">{q.subject.name}</span>
            {q.topic && <span className="badge">{q.topic.name}</span>}
            <span className="badge">{LEVEL_NAME[q.difficulty]}</span>
            {q.isFree && <span className="badge">Grátis</span>}
          </div>
          <p style={{ fontSize: "1.1rem" }}>{q.statement}</p>

          {!attempt ? (
            <form action={answer}>
              <input type="hidden" name="questionId" value={q.id} />
              <input type="hidden" name="back" value={here} />
              <input type="hidden" name="startedAt" value={Date.now()} />
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="muted" style={{ marginBottom: ".5rem" }}>Escolha uma alternativa</legend>
                {order.map((orig, i) => (
                  <label className="option" key={orig}>
                    <input type="radio" name="choice" value={i} required />
                    <span className="letter">{POS[i]}</span><span>{byLetter[orig]?.text}</span>
                  </label>
                ))}
              </fieldset>
              {sp.erro && <p className="alert bad">Escolha uma alternativa.</p>}
              <div className="row" style={{ marginTop: "1rem" }}><button className="btn" type="submit">Responder</button></div>
            </form>
          ) : (
            <div className="stack">
              <p className={`alert ${attempt.correct ? "ok" : "bad"}`} role="status">
                <strong>{attempt.correct ? "✅ Você acertou!" : "❌ Resposta incorreta."}</strong> Gabarito: <strong>{POS[order.indexOf(q.correctLetter)]}</strong>
              </p>
              {order.map((orig, i) => (
                <div key={orig} className={`option ${orig === q.correctLetter ? "correct" : orig === attempt.chosenLetter ? "wrong" : ""}`}>
                  <span className="letter">{POS[i]}</span>
                  <span>{byLetter[orig]?.text}{orig !== q.correctLetter && byLetter[orig]?.whyWrong && <><br /><small className="muted">Por que está errada: {byLetter[orig].whyWrong}</small></>}</span>
                </div>
              ))}
              <div><h3>Por quê?</h3><p>{q.explanation}</p><p className="muted">📌 Referência: {q.reference}</p></div>
            </div>
          )}

          <div className="row">
            {nextId && <Link className="btn" href={qs({ q: nextId })}>Próxima →</Link>}
            {[["FAVORITE", "⭐", "Favoritar", "Desfavoritar"], ["REVIEW_LATER", "🚩", "Revisar depois", "Tirar da revisão"]].map(([kind, icon, on, off]) => {
              const active = marks.some((m) => m.kind === kind);
              return (
                <form action={toggleMark} key={kind}>
                  <input type="hidden" name="questionId" value={q.id} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="back" value={here + (attempt ? `&tentativa=${attempt.id}` : "")} />
                  <button className="btn ghost small" type="submit" aria-pressed={active}>{icon} {active ? off : on}</button>
                </form>
              );
            })}
          </div>

          <details>
            <summary>Encontrou um problema nesta questão?</summary>
            {sp.reportado ? <p className="alert ok">Obrigado! A equipe vai revisar.</p> : (
              <form action={reportProblem} className="stack" style={{ marginTop: ".75rem" }}>
                <input type="hidden" name="questionId" value={q.id} /><input type="hidden" name="back" value={here} />
                <select name="kind" aria-label="Tipo de problema">
                  <option value="gabarito">Erro no gabarito</option><option value="portugues">Erro de português</option>
                  <option value="duplicada">Questão duplicada</option><option value="alternativa">Alternativa incorreta</option>
                  <option value="explicacao">Explicação inadequada</option><option value="fonte">Problema na fonte</option><option value="outro">Outro</option>
                </select>
                <textarea name="message" maxLength={1000} placeholder="Descreva (opcional)" aria-label="Descrição" />
                <button className="btn ghost small" type="submit">Enviar</button>
              </form>
            )}
          </details>
        </article>
      )}

      {locked > 0 && cycles.length < 2 && (
        <p className="alert">🔒 {locked} questões estão bloqueadas no seu plano atual. <Link href="/app/planos">Ver planos</Link></p>
      )}
    </div>
  );
}
