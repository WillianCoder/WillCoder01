/**
 * 📄 O QUE É: IMPORTAR QUESTÕES POR PLANILHA (endereço /admin/importar).
 * ✏️ EDITÁVEL: textos da tela. Modelo da planilha: public/modelo-questoes.csv.
 * ⚠️ CUIDADO: questões importadas entram "Em revisão"; publique depois de conferir.
 */
import Link from "next/link";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { importQuestions } from "./actions";

export const metadata = { title: "Importar questões" };

export default async function Importar({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  let result: { created: number; skipped: number; errors: string[] } | null = null;
  if (sp.ok) try { result = JSON.parse((await cookies()).get("import_result")?.value ?? "null"); } catch { result = null; }
  return (
    <div className="stack">
      <h1>Importar questões por planilha</h1>
      {sp.erro && <p className="alert bad" role="alert">{sp.erro}</p>}
      {result && (
        <div className={`alert ${result.errors.length ? "" : "ok"} stack`}>
          <p><strong>{result.created}</strong> questões importadas (status <em>Em revisão</em>) · {result.skipped} ignoradas (código já existia) · {result.errors.length} com erro.</p>
          {result.errors.length > 0 && <ul>{result.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          {result.created > 0 && <p><Link href="/admin/questoes?status=IN_REVIEW">Revisar e publicar as importadas →</Link></p>}
        </div>
      )}
      <div className="card stack">
        <h2>Como fazer</h2>
        <ol>
          <li>Baixe o <a href="/modelo-questoes.csv" download>modelo de planilha</a> e abra no Excel ou Google Planilhas.</li>
          <li>Preencha uma questão por linha. Colunas: <code>codigo</code> (único, ex.: RDPM-TRA-033), <code>ciclo</code> (BASICO ou ESPECIFICO), <code>disciplina</code>, <code>assunto</code>, <code>estado</code> (SP ou vazio = todos), <code>dificuldade</code> (FACIL, MEDIA, DIFICIL), <code>enunciado</code>, <code>A</code> a <code>E</code>, <code>gabarito</code>, <code>explicacao</code>, <code>referencia</code>, <code>fonte</code>.</li>
          <li>Salve como <strong>CSV UTF-8</strong> (Excel: Arquivo → Salvar como → “CSV UTF-8”).</li>
          <li>Envie abaixo. As questões entram como <strong>Em revisão</strong>; confira e publique em Questões.</li>
        </ol>
        <p className="muted">Até 1.000 questões e 2 MB por arquivo. Códigos que já existem são ignorados (nada é sobrescrito). Só envie conteúdo próprio ou de texto legal oficial.</p>
      </div>
      <form action={importQuestions} className="card row">
        <input type="file" name="arquivo" accept=".csv,text/csv" required aria-label="Arquivo CSV" style={{ maxWidth: 360 }} />
        <button className="btn" type="submit">Importar</button>
      </form>
    </div>
  );
}
