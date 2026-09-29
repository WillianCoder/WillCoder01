/**
 * 📄 O QUE É: TELA DE SIMULADOS (endereço /app/simulados): montar um simulado e ver o histórico.
 * ✏️ EDITÁVEL: textos da tela. Limites (quantidade, tempo): src/config/regras.ts.
 * ⚠️ CUIDADO: o sorteio e a correção ficam em ./actions.ts (servidor).
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { visibleWhere } from "@/lib/questions";
import { CYCLE_NAME, date } from "@/lib/format";
import { REGRAS } from "@/config/regras";
import { createSimulation } from "./actions";

export const metadata = { title: "Simulados" };

export default async function Simulados({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const user = await requireUser();
  const [{ cycles }, { erro }] = await Promise.all([userAccess(user.id, user.role), searchParams]);
  const R = REGRAS.simulado;
  const [subjects, history] = await Promise.all([
    db.subject.findMany({ where: { active: true, questions: { some: visibleWhere(user, cycles) } }, include: { cycle: true }, orderBy: [{ cycle: { code: "asc" } }, { name: "asc" }] }),
    db.simulationAttempt.findMany({ where: { userId: user.id }, include: { simulation: true }, orderBy: { startedAt: "desc" }, take: 20 }),
  ]);
  return (
    <div className="stack">
      <h1>Simulados</h1>
      {erro && <p className="alert bad" role="alert">{erro}</p>}

      <div className="grid">
        <form action={createSimulation} className="card stack">
          <input type="hidden" name="tipo" value="rapido" />
          <h2>⚡ Simulado rápido</h2>
          <p className="muted">{R.rapidoQuestoes} questões sorteadas de tudo que você tem acesso, sem cronômetro.</p>
          <button className="btn" type="submit">Começar agora</button>
        </form>

        <form action={createSimulation} className="card stack">
          <input type="hidden" name="tipo" value="personalizado" />
          <h2>🎯 Personalizado</h2>
          <div className="field"><label htmlFor="disciplina">Disciplina</label>
            <select id="disciplina" name="disciplina" defaultValue="">
              <option value="">Todas</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{CYCLE_NAME[s.cycle.code]} · {s.name}</option>)}
            </select></div>
          <div className="field"><label htmlFor="filtro">Quais questões</label>
            <select id="filtro" name="filtro" defaultValue="todas">
              <option value="todas">Todas</option><option value="nao-respondidas">Só as que nunca respondi</option>
              <option value="erradas">Só as que errei</option><option value="favoritas">Minhas favoritas</option>
            </select></div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div><label htmlFor="quantidade">Quantidade</label><input id="quantidade" name="quantidade" type="number" min={R.minQuestoes} max={R.maxQuestoes} defaultValue={20} /></div>
            <div><label htmlFor="minutos">Tempo (min, 0 = livre)</label><input id="minutos" name="minutos" type="number" min={0} max={R.maxMinutos} defaultValue={0} /></div>
          </div>
          <button className="btn" type="submit">Montar simulado</button>
        </form>
      </div>

      <section className="card stack">
        <h2>Meus simulados</h2>
        {history.length === 0 && <p className="muted">Você ainda não fez nenhum simulado.</p>}
        {history.length > 0 && (
          <div className="table-wrap"><table>
            <thead><tr><th>Data</th><th>Simulado</th><th>Resultado</th><th></th></tr></thead>
            <tbody>{history.map((h) => (
              <tr key={h.id}>
                <td>{date(h.startedAt)}</td>
                <td>{h.simulation.title}</td>
                <td>{h.finishedAt ? <strong>{h.correct}/{h.total} ({h.total ? Math.round((h.correct / h.total) * 100) : 0}%)</strong> : <span className="badge">Em andamento</span>}</td>
                <td><Link href={`/app/simulados/${h.id}`}>{h.finishedAt ? "Ver correção" : "Continuar"}</Link></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </div>
  );
}
