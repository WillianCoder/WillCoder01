/**
 * 📄 O QUE É: RANKING (endereço /app/ranking) — por período, ciclo, estado ou escola.
 * ✏️ EDITÁVEL: textos da tela. Regras do cálculo: src/lib/ranking.ts.
 * ⚠️ CUIDADO: privacidade — mostra só apelido e escola, e só de quem autorizou.
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ranking, type Periodo } from "@/lib/ranking";

export const metadata = { title: "Ranking" };

const PERIODOS: Record<Periodo, string> = { semana: "Últimos 7 dias", mes: "Últimos 30 dias", geral: "Desde o início" };

export default async function Ranking({ searchParams }: { searchParams: Promise<{ periodo?: string; ciclo?: string; escopo?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const flag = await db.featureFlag.findUnique({ where: { key: "ranking" } });
  if (flag && !flag.enabled) return <div className="card"><h1>Ranking</h1><p>O ranking está desativado no momento.</p></div>;

  const periodo: Periodo = sp.periodo && sp.periodo in PERIODOS ? (sp.periodo as Periodo) : "semana";
  const ciclo = sp.ciclo === "BASIC" || sp.ciclo === "SPECIFIC" ? sp.ciclo : undefined;
  const escopo = sp.escopo === "escola" && user.schoolId ? "escola" : sp.escopo === "geral" ? "geral" : "estado";
  const rows = await ranking({
    periodo, ciclo,
    stateCode: escopo === "estado" ? user.stateCode : undefined,
    schoolId: escopo === "escola" ? user.schoolId : undefined,
  });
  const me = rows.findIndex((r) => r.userId === user.id);

  return (
    <div className="stack">
      <h1>🏆 Ranking</h1>
      <p className="muted">Pontos = questões acertadas na <strong>primeira tentativa</strong> no período. Refazer a mesma questão não soma pontos.</p>
      {!user.rankingOptIn || !user.nickname ? (
        <p className="alert">Você ainda não aparece no ranking. <Link href="/app/configuracoes">Escolha um apelido e ative a participação</Link> — só o apelido e a escola ficam visíveis.</p>
      ) : me >= 0 ? (
        <p className="alert ok">Você está em <strong>{me + 1}º lugar</strong> com {rows[me].points} pontos. 💪</p>
      ) : (
        <p className="alert">Responda questões neste período para entrar no ranking.</p>
      )}

      <form className="row" method="get" aria-label="Filtros do ranking">
        <select name="periodo" defaultValue={periodo} aria-label="Período" style={{ maxWidth: 200 }}>
          {Object.entries(PERIODOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="ciclo" defaultValue={ciclo ?? ""} aria-label="Ciclo" style={{ maxWidth: 200 }}>
          <option value="">Todos os ciclos</option><option value="BASIC">Ciclo Básico</option><option value="SPECIFIC">Ciclo Específico</option>
        </select>
        <select name="escopo" defaultValue={escopo} aria-label="Abrangência" style={{ maxWidth: 200 }}>
          <option value="estado">Meu estado</option>
          {user.schoolId && <option value="escola">Minha escola</option>}
          <option value="geral">Brasil</option>
        </select>
        <button className="btn small" type="submit">Ver</button>
      </form>

      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>#</th><th>Apelido</th><th>Escola</th><th>Pontos</th><th>Aproveitamento</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="muted">Ninguém pontuou neste período ainda.</td></tr>}
            {rows.map((r, i) => (
              <tr key={r.userId} style={r.userId === user.id ? { background: "var(--ok-bg)", fontWeight: 700 } : undefined}>
                <td>{i < 3 ? ["🥇", "🥈", "🥉"][i] : `${i + 1}º`}</td>
                <td>{r.nickname}</td>
                <td className="muted">{r.school ?? "—"}</td>
                <td>{r.points}</td>
                <td>{r.answered ? Math.round((r.points / r.answered) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
