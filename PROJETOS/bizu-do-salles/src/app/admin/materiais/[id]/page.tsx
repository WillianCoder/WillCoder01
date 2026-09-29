/**
 * 📄 O QUE É: CRIAR/EDITAR MATERIAL (endereço /admin/materiais/<id> ou /admin/materiais/novo).
 * ✏️ EDITÁVEL: textos da tela. Formato do resumo: "## Subtítulo", "- item", **negrito**, linha vazia = parágrafo.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CYCLE_NAME } from "@/lib/format";
import { saveMaterial } from "../../actions";

export const metadata = { title: "Editar material" };
const DEFAULT_LICENSE = "Material original Bizu do Salles, elaborado a partir de texto legal/oficial (Lei 9.610/98, art. 8º, IV).";

export default async function EditMaterial({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string; salvo?: string }> }) {
  const user = await requireAdmin(["ADMIN", "EDITOR"]);
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const m = id === "novo" ? null : await db.material.findUnique({ where: { id } });
  if (id !== "novo" && !m) notFound();
  const [subjects, states] = await Promise.all([
    db.subject.findMany({ include: { cycle: true }, orderBy: [{ cycle: { code: "asc" } }, { name: "asc" }] }),
    db.state.findMany({ orderBy: { code: "asc" } }),
  ]);
  return (
    <form action={saveMaterial} className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}><h1>{m ? "Editar material" : "Novo material"}</h1><Link href="/admin/materiais">← Voltar</Link></div>
      {sp.erro && <p className="alert bad" role="alert">{sp.erro}</p>}
      {sp.salvo && <p className="alert ok">Material salvo e registrado na auditoria. {m?.published && <Link href={`/app/materiais/${m.id}`}>Ver como aluno →</Link>}</p>}
      <input type="hidden" name="id" value={m?.id ?? ""} />
      <div className="card stack">
        <div className="field"><label htmlFor="title">Título</label><input id="title" name="title" defaultValue={m?.title} required /></div>
        <div className="grid">
          <div><label htmlFor="kind">Tipo</label>
            <select id="kind" name="kind" defaultValue={m?.kind ?? "summary"}><option value="summary">📝 Resumo (texto)</option><option value="audio">🎧 Áudio (link)</option><option value="pdf">📄 PDF (link)</option></select></div>
          <div><label htmlFor="cycle">Ciclo</label>
            <select id="cycle" name="cycle" defaultValue={m?.cycle ?? ""}><option value="">Geral</option><option value="BASIC">Ciclo Básico</option><option value="SPECIFIC">Ciclo Específico</option></select></div>
          <div><label htmlFor="subjectId">Disciplina</label>
            <select id="subjectId" name="subjectId" defaultValue={m?.subjectId ?? ""}><option value="">—</option>{subjects.map((s) => <option key={s.id} value={s.id}>{CYCLE_NAME[s.cycle.code]} · {s.name}</option>)}</select></div>
          <div><label htmlFor="stateCode">Abrangência</label>
            <select id="stateCode" name="stateCode" defaultValue={m?.stateCode ?? ""}><option value="">Nacional</option>{states.map((s) => <option key={s.code} value={s.code}>Só {s.name}</option>)}</select></div>
        </div>
        <div className="field"><label htmlFor="storageKey">Link do áudio/PDF (https://…) — deixe vazio para resumo</label><input id="storageKey" name="storageKey" defaultValue={m?.storageKey ?? ""} inputMode="url" /></div>
        <div className="field"><label htmlFor="body">Texto do resumo (ou descrição do áudio/PDF)</label>
          <textarea id="body" name="body" defaultValue={m?.body ?? ""} style={{ minHeight: 320, fontFamily: "inherit" }} placeholder={"## Subtítulo\nTexto do parágrafo com **destaque**.\n\n- item de lista\n- outro item"} /></div>
        <div className="field"><label htmlFor="sourceLicense">Origem / licença</label><input id="sourceLicense" name="sourceLicense" defaultValue={m?.sourceLicense ?? DEFAULT_LICENSE} required /></div>
        <label className="row" style={{ fontWeight: 400 }}><input type="checkbox" name="free" defaultChecked={m?.free} style={{ width: "auto", minHeight: "auto" }} /> Grátis (amostra para quem não tem plano)</label>
        {user.role === "ADMIN" && <label className="row" style={{ fontWeight: 400 }}><input type="checkbox" name="published" defaultChecked={m?.published} style={{ width: "auto", minHeight: "auto" }} /> Publicado (alunos veem)</label>}
      </div>
      <div className="row"><button className="btn" type="submit">Salvar material</button></div>
    </form>
  );
}
