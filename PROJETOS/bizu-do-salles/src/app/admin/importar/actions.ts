"use server";
/**
 * 📄 O QUE É: IMPORTAÇÃO DE QUESTÕES POR PLANILHA (CSV) no servidor.
 *   Toda questão importada entra como "Em revisão" — nunca é publicada direto.
 * ✏️ EDITÁVEL: colunas aceitas estão no modelo public/modelo-questoes.csv.
 * ⚠️ CUIDADO: valida tamanho e tipo do arquivo, cada linha e códigos repetidos; tudo é auditado.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { csvToObjects } from "@/core/csv";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_LINHAS = 1000;
const L = ["A", "B", "C", "D", "E"] as const;
const CICLO: Record<string, "BASIC" | "SPECIFIC"> = { basico: "BASIC", basic: "BASIC", especifico: "SPECIFIC", specific: "SPECIFIC" };
const NIVEL: Record<string, "EASY" | "MEDIUM" | "HARD"> = { facil: "EASY", easy: "EASY", media: "MEDIUM", medio: "MEDIUM", medium: "MEDIUM", dificil: "HARD", hard: "HARD" };
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const slug = (s: string) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const row = z.object({
  codigo: z.string().toUpperCase().regex(/^[A-Z0-9]+(-[A-Z0-9]+)*-\d{3}$/, "código inválido (ex.: RDPM-TRA-001)"),
  ciclo: z.string().transform(norm).refine((v) => v in CICLO, "ciclo deve ser BASICO ou ESPECIFICO"),
  disciplina: z.string().min(2, "disciplina vazia").max(120),
  assunto: z.string().max(120),
  estado: z.string().toUpperCase().regex(/^([A-Z]{2})?$/, "estado deve ser a sigla (ex.: SP) ou vazio"),
  dificuldade: z.string().transform(norm).refine((v) => v === "" || v in NIVEL, "dificuldade deve ser FACIL, MEDIA ou DIFICIL"),
  enunciado: z.string().min(15, "enunciado muito curto").max(4000),
  a: z.string().min(1, "alternativa A vazia").max(1000), b: z.string().min(1, "alternativa B vazia").max(1000),
  c: z.string().min(1, "alternativa C vazia").max(1000), d: z.string().min(1, "alternativa D vazia").max(1000),
  e: z.string().min(1, "alternativa E vazia").max(1000),
  gabarito: z.string().toUpperCase().refine((v) => (L as readonly string[]).includes(v), "gabarito deve ser A, B, C, D ou E"),
  explicacao: z.string().min(20, "explicação com menos de 20 caracteres").max(4000),
  referencia: z.string().min(3, "referência vazia").max(300),
  fonte: z.string().min(10, "informe a origem/licença (coluna fonte)").max(500),
});

export async function importQuestions(form: FormData) {
  const admin = await requireAdmin();
  const file = form.get("arquivo");
  const back = (msg: string): never => redirect(`/admin/importar?erro=${encodeURIComponent(msg)}`);
  if (!(file instanceof File) || file.size === 0) back("Escolha um arquivo .csv.");
  const f = file as File;
  if (f.size > MAX_BYTES) back("Arquivo maior que 2 MB. Divida em partes.");
  if (!/\.csv$/i.test(f.name) || !["", "text/csv", "application/vnd.ms-excel", "text/plain"].includes(f.type)) back("Envie um arquivo .csv (no Excel: Salvar como → CSV UTF-8).");
  const text = await f.text();
  if (text.includes("\u0000")) back("Arquivo inválido.");
  const rows = csvToObjects(text);
  if (rows.length === 0) back("Planilha vazia.");
  if (rows.length > MAX_LINHAS) back(`Máximo de ${MAX_LINHAS} questões por arquivo.`);

  const cycles = Object.fromEntries((await db.cycle.findMany()).map((c) => [c.code, c]));
  const errors: string[] = [];
  const seen = new Set<string>();
  let created = 0, skipped = 0;
  for (const { line, data } of rows) {
    const p = row.safeParse(data);
    if (!p.success) { errors.push(`Linha ${line}: ${p.error.issues[0].message}`); continue; }
    const r = p.data;
    const opts = [r.a, r.b, r.c, r.d, r.e];
    if (new Set(opts.map(norm)).size < 5) { errors.push(`Linha ${line}: alternativas repetidas`); continue; }
    if (seen.has(r.codigo) || (await db.question.findUnique({ where: { code: r.codigo }, select: { id: true } }))) { skipped++; continue; }
    seen.add(r.codigo);
    const cycle = cycles[CICLO[r.ciclo]];
    const subject = await db.subject.upsert({
      where: { cycleId_slug: { cycleId: cycle.id, slug: slug(r.disciplina) } },
      // reativa a matéria se ela tinha sido desativada (ex.: nome antigo após o realinhamento da grade)
      update: { active: true }, create: { cycleId: cycle.id, name: r.disciplina, slug: slug(r.disciplina) },
    });
    const topic = r.assunto ? await db.topic.upsert({
      where: { subjectId_slug: { subjectId: subject.id, slug: slug(r.assunto) } },
      update: {}, create: { subjectId: subject.id, name: r.assunto, slug: slug(r.assunto) },
    }) : null;
    if (r.estado && !(await db.state.findUnique({ where: { code: r.estado } }))) { errors.push(`Linha ${line}: estado ${r.estado} não existe`); continue; }
    await db.question.create({
      data: {
        code: r.codigo, subjectId: subject.id, topicId: topic?.id ?? null, stateCode: r.estado || null,
        statement: r.enunciado, correctLetter: r.gabarito, explanation: r.explicacao, reference: r.referencia,
        sourceLicense: r.fonte, difficulty: NIVEL[r.dificuldade] ?? "MEDIUM", status: "IN_REVIEW", author: admin.name,
        options: { create: opts.map((text, i) => ({ letter: L[i], text })) },
      },
    });
    created++;
  }
  await audit(admin.id, "question.import_csv", "Question", "*", null, { arquivo: f.name, criadas: created, ignoradas: skipped, erros: errors.length });
  (await cookies()).set("import_result", JSON.stringify({ created, skipped, errors: errors.slice(0, 50) }), { httpOnly: true, sameSite: "strict", path: "/admin", maxAge: 300 });
  redirect("/admin/importar?ok=1");
}
