/**
 * 📄 O QUE É: MEUS CADERNOS (endereço /app/cadernos): coleções de questões montadas pelo aluno.
 * ✏️ EDITÁVEL: textos da tela. Limites: src/config/regras.ts (cadernos).
 * ⚠️ CUIDADO: as ações ficam em ./actions.ts e sempre conferem o dono do caderno.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { REGRAS } from "@/config/regras";
import { createSimulation } from "../simulados/actions";
import { createNotebook, deleteNotebook, removeFromNotebook, renameNotebook } from "./actions";

export const metadata = { title: "Meus cadernos" };

const ERROS: Record<string, string> = {
  nome: "Dê um nome com pelo menos 2 letras.",
  limite: `Você atingiu o limite de ${REGRAS.cadernos.maxPorAluno} cadernos.`,
};

export default async function Cadernos({ searchParams }: { searchParams: Promise<{ erro?: string; abrir?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const notebooks = await db.notebook.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });
  const open = sp.abrir ? notebooks.find((n) => n.id === sp.abrir) : null;
  const items = open
    ? await db.notebookQuestion.findMany({ where: { notebookId: open.id }, orderBy: { addedAt: "desc" }, include: { question: { select: { id: true, code: true, statement: true, subject: { select: { name: true } } } } } })
    : [];

  return (
    <div className="stack">
      <h1>📒 Meus cadernos</h1>
      <p className="muted">Junte questões para revisar depois: “Revisão RDPM”, “Prova final”, “Português”… Na tela de questões, use <strong>Adicionar ao caderno</strong>.</p>
      {sp.erro && ERROS[sp.erro] && <p className="alert bad" role="alert">{ERROS[sp.erro]}</p>}

      <form action={createNotebook} className="card row">
        <input name="name" placeholder="Nome do novo caderno" maxLength={60} required style={{ maxWidth: 360 }} aria-label="Nome do caderno" />
        <button className="btn small" type="submit">Criar caderno</button>
      </form>

      {notebooks.length === 0 && <p className="card">Você ainda não tem cadernos.</p>}
      <div className="grid">
        {notebooks.map((n) => (
          <div className="card stack" key={n.id}>
            <h3>{n.name}</h3>
            <p className="muted">{n._count.items} {n._count.items === 1 ? "questão" : "questões"}</p>
            <div className="row">
              <Link className="btn small" href={`/app/questoes?filtro=todas&caderno=${n.id}`}>Estudar</Link>
              {n._count.items > 0 && (
                <form action={createSimulation}>
                  <input type="hidden" name="tipo" value="personalizado" />
                  <input type="hidden" name="caderno" value={n.id} />
                  <input type="hidden" name="quantidade" value={Math.min(n._count.items, REGRAS.simulado.maxQuestoes)} />
                  <button className="btn ghost small" type="submit">Simulado</button>
                </form>
              )}
              <Link className="btn ghost small" href={`/app/cadernos?abrir=${n.id}`}>Ver questões</Link>
            </div>
            <details>
              <summary className="muted">Renomear ou excluir</summary>
              <form action={renameNotebook} className="row" style={{ marginTop: ".5rem" }}>
                <input type="hidden" name="id" value={n.id} />
                <input name="name" defaultValue={n.name} maxLength={60} aria-label="Novo nome" style={{ maxWidth: 220 }} />
                <button className="btn ghost small" type="submit">Renomear</button>
              </form>
              <form action={deleteNotebook} style={{ marginTop: ".5rem" }}>
                <input type="hidden" name="id" value={n.id} />
                <button className="btn danger small" type="submit">Excluir caderno</button>
              </form>
            </details>
          </div>
        ))}
      </div>

      {open && (
        <section className="card stack">
          <h2>Questões em “{open.name}”</h2>
          {items.length === 0 && <p className="muted">Caderno vazio.</p>}
          {items.map((it) => (
            <div key={it.questionId} className="row" style={{ justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: ".6rem" }}>
              <Link href={`/app/questoes?filtro=todas&caderno=${open.id}&q=${it.questionId}`} style={{ flex: 1 }}>
                <span className="badge">{it.question.code}</span> {it.question.statement.slice(0, 100)}{it.question.statement.length > 100 ? "…" : ""}
              </Link>
              <form action={removeFromNotebook}>
                <input type="hidden" name="notebookId" value={open.id} /><input type="hidden" name="questionId" value={it.questionId} />
                <input type="hidden" name="back" value={`/app/cadernos?abrir=${open.id}`} />
                <button className="btn ghost small" type="submit">Remover</button>
              </form>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
