import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CYCLE_NAME } from "@/lib/format";
import { saveQuestion } from "../../actions";

export const metadata = { title: "Editar questão" };
const L = ["A", "B", "C", "D", "E"];
const DEFAULT_LICENSE = "Questão original Bizu do Salles, elaborada a partir de texto legal/oficial (Lei 9.610/98, art. 8º, IV).";

export default async function EditQuestion({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string; salvo?: string }> }) {
  const user = await requireAdmin(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const sp = await searchParams;
  const q = id === "nova" ? null : await db.question.findUnique({ where: { id }, include: { options: true, topic: true, flags: { where: { resolvedAt: null } } } });
  if (id !== "nova" && !q) notFound();
  const [subjects, states] = await Promise.all([
    db.subject.findMany({ include: { cycle: true }, orderBy: [{ cycle: { code: "asc" } }, { name: "asc" }] }),
    db.state.findMany({ orderBy: { code: "asc" } }),
  ]);
  const opt = Object.fromEntries(q?.options.map((o) => [o.letter, o]) ?? []);
  return (
    <form action={saveQuestion} className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1>{q ? `Editar ${q.code}` : "Nova questão"}</h1><Link href="/admin/questoes">← Voltar</Link>
      </div>
      {sp.erro && <p className="alert bad" role="alert">{sp.erro}</p>}
      {sp.salvo && <p className="alert ok">Questão salva e registrada na auditoria.</p>}
      {q && q.flags.length > 0 && <p className="alert">🆘 {q.flags.length} problema(s) relatado(s) por alunos. <Link href="/admin/problemas">Ver</Link></p>}
      <input type="hidden" name="id" value={q?.id ?? ""} />

      <div className="card stack">
        <h2>Classificação</h2>
        <div className="grid">
          <div><label htmlFor="code">Código</label><input id="code" name="code" defaultValue={q?.code} placeholder="RDPM-TRA-001" required /></div>
          <div><label htmlFor="subjectId">Disciplina</label>
            <select id="subjectId" name="subjectId" defaultValue={q?.subjectId} required>
              {subjects.map((s) => <option key={s.id} value={s.id}>{CYCLE_NAME[s.cycle.code]} · {s.name}</option>)}
            </select></div>
          <div><label htmlFor="topic">Assunto</label><input id="topic" name="topic" defaultValue={q?.topic?.name} placeholder="Ex.: Transgressões disciplinares" /></div>
          <div><label htmlFor="stateCode">Abrangência</label>
            <select id="stateCode" name="stateCode" defaultValue={q?.stateCode ?? ""}>
              <option value="">Nacional (todos os estados)</option>{states.map((s) => <option key={s.code} value={s.code}>Só {s.name}</option>)}
            </select></div>
          <div><label htmlFor="difficulty">Dificuldade</label>
            <select id="difficulty" name="difficulty" defaultValue={q?.difficulty ?? "MEDIUM"}><option value="EASY">Fácil</option><option value="MEDIUM">Média</option><option value="HARD">Difícil</option></select></div>
          <div><label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={q?.status ?? "IN_REVIEW"}>
              <option value="IN_REVIEW">Em revisão</option><option value="REVIEWED">Revisada</option><option value="APPROVED">Aprovada</option>
              {user.role === "ADMIN" && <option value="PUBLISHED">Publicada (alunos veem)</option>}
              <option value="REJECTED">Rejeitada</option><option value="ARCHIVED">Arquivada</option>
            </select></div>
        </div>
        <label className="row" style={{ fontWeight: 400 }}><input type="checkbox" name="isFree" defaultChecked={q?.isFree} style={{ width: "auto", minHeight: "auto" }} /> Questão grátis (amostra para quem não tem plano)</label>
      </div>

      <div className="card stack">
        <h2>Enunciado e alternativas</h2>
        <div className="field"><label htmlFor="statement">Enunciado</label><textarea id="statement" name="statement" defaultValue={q?.statement} required /></div>
        {L.map((l) => (
          <div key={l} className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div><label htmlFor={l}>Alternativa {l}</label><input id={l} name={l} defaultValue={opt[l]?.text} required /></div>
            <div><label htmlFor={`w${l}`}>Por que {l} está errada (opcional)</label><input id={`w${l}`} name={`w${l}`} defaultValue={opt[l]?.whyWrong ?? ""} /></div>
          </div>
        ))}
        <div className="field"><label htmlFor="correct">Gabarito</label>
          <select id="correct" name="correct" defaultValue={q?.correctLetter ?? ""} required style={{ maxWidth: 160 }}><option value="" disabled>Escolha</option>{L.map((l) => <option key={l}>{l}</option>)}</select></div>
        <p className="muted" style={{ fontSize: ".85rem" }}>As alternativas aparecem embaralhadas para cada aluno; o gabarito é conferido no servidor.</p>
      </div>

      <div className="card stack">
        <h2>Explicação e fonte</h2>
        <div className="field"><label htmlFor="explanation">Explicação (por que a correta está certa)</label><textarea id="explanation" name="explanation" defaultValue={q?.explanation} required /></div>
        <div className="field"><label htmlFor="reference">Referência exata</label><input id="reference" name="reference" defaultValue={q?.reference} placeholder="LC 893/2001, art. 12, § 1º" required /></div>
        <div className="field"><label htmlFor="sourceLicense">Origem / licença do conteúdo</label><input id="sourceLicense" name="sourceLicense" defaultValue={q?.sourceLicense ?? DEFAULT_LICENSE} required /></div>
      </div>
      <div className="row"><button className="btn" type="submit">Salvar questão</button></div>
    </form>
  );
}
