/**
 * 📄 O QUE É: GRADE DO CURSO (endereço /grade, pública): as matérias do CFSd por ciclo, com a
 *             carga horária oficial e quantas questões e resumos o Bizu já tem em cada uma.
 * ✏️ EDITÁVEL: matérias e horas: src/config/grade.ts. Os números de questões/resumos são automáticos.
 * ⚠️ CUIDADO: página aberta (aparece no Google). Não coloque nada interno aqui.
 */
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { cobertura } from "@/lib/cobertura";
import { CYCLE_NAME } from "@/lib/format";
import { GRADE_FONTE } from "@/config/grade";

export const metadata = {
  title: "Grade do curso (CFSd)",
  description: "Matérias do 1º e do 2º ciclo do Curso de Formação de Soldados, com carga horária e o conteúdo disponível no Bizu do Salles.",
};
export const dynamic = "force-dynamic";

export default async function Grade() {
  const c = await cobertura();
  return (
    <>
      <PublicHeader />
      <main className="container stack" style={{ padding: "2rem 16px 4rem" }}>
        <h1>Grade do curso</h1>
        <p className="muted" style={{ maxWidth: 720 }}>
          As matérias do Curso de Formação de Soldados, na ordem e com a carga horária da grade oficial
          (fonte: {GRADE_FONTE.split(" — ")[0]}). Ao lado, quanto conteúdo o Bizu já tem em cada uma.
          Hoje {c.comQuestoes} de {c.materiasTeoricas} matérias teóricas têm questões, e o banco cresce toda semana.
        </p>

        {c.ciclos.map((ciclo) => (
          <section className="card stack" key={ciclo.ciclo} aria-labelledby={`ciclo-${ciclo.ciclo}`}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2 id={`ciclo-${ciclo.ciclo}`} style={{ margin: 0 }}>{CYCLE_NAME[ciclo.ciclo]}</h2>
              <span className="badge">{ciclo.materias.length} matérias · {ciclo.horas} h-a</span>
            </div>
            <div className="table-wrap"><table>
              <thead><tr><th>Matéria</th><th>Área</th><th>Horas</th><th>Questões</th><th>Resumos</th></tr></thead>
              <tbody>{ciclo.materias.map((m) => (
                <tr key={m.nome}>
                  <td>{m.nome}</td>
                  <td className="muted">{m.area}</td>
                  <td>{m.horas}</td>
                  <td>{m.pratica ? <span className="muted">Prática</span> : m.questoes > 0 ? <strong>{m.questoes}</strong> : <span className="badge">Em produção</span>}</td>
                  <td>{m.pratica ? "—" : m.resumos}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </section>
        ))}

        <p className="muted">Matérias práticas (Educação Física e Defesa Pessoal) são avaliadas na escola e não têm banco de questões. A grade pode mudar entre turmas: confira sempre o material oficial da sua escola.</p>
        <div className="row">
          <Link href="/cadastro" className="btn">Criar conta grátis</Link>
          <Link href="/#planos" className="btn ghost">Ver planos</Link>
        </div>
      </main>
    </>
  );
}
