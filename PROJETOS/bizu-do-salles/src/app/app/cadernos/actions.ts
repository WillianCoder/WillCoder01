"use server";
/**
 * 📄 O QUE É: AÇÕES DOS CADERNOS no servidor: criar, renomear, excluir, adicionar e remover questões.
 * ✏️ EDITÁVEL: limite de cadernos por aluno em src/config/regras.ts (cadernos).
 * ⚠️ CUIDADO: toda ação confere se o caderno é do aluno logado.
 */
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { userAccess } from "@/lib/access";
import { visibleWhere } from "@/lib/questions";
import { REGRAS } from "@/config/regras";

const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
const safeBack = (v: FormDataEntryValue | null, fallback: string) => {
  const s = String(v ?? "");
  return s.startsWith("/app/") && !s.startsWith("//") ? s.replace(/[^\w\-/?=&%.]/g, "") : fallback;
};

async function ownNotebook(userId: string, id: string) {
  return db.notebook.findFirst({ where: { id, userId } });
}

export async function createNotebook(form: FormData) {
  const user = await requireUser();
  const name = clean(form.get("name"));
  if (name.length < 2) redirect("/app/cadernos?erro=nome");
  if ((await db.notebook.count({ where: { userId: user.id } })) >= REGRAS.cadernos.maxPorAluno) redirect("/app/cadernos?erro=limite");
  await db.notebook.create({ data: { userId: user.id, name } });
  redirect("/app/cadernos?salvo=1");
}

export async function renameNotebook(form: FormData) {
  const user = await requireUser();
  const nb = await ownNotebook(user.id, String(form.get("id")));
  const name = clean(form.get("name"));
  if (nb && name.length >= 2) await db.notebook.update({ where: { id: nb.id }, data: { name } });
  redirect("/app/cadernos");
}

export async function deleteNotebook(form: FormData) {
  const user = await requireUser();
  const nb = await ownNotebook(user.id, String(form.get("id")));
  if (nb) await db.notebook.delete({ where: { id: nb.id } }); // itens saem junto (cascade)
  redirect("/app/cadernos");
}

/** Adiciona a questão a um caderno existente ou a um caderno novo (campo "novo"). */
export async function addToNotebook(form: FormData) {
  const user = await requireUser();
  const back = safeBack(form.get("back"), "/app/questoes");
  const questionId = String(form.get("questionId"));
  const { cycles } = await userAccess(user.id, user.role);
  if (!(await db.question.findFirst({ where: { id: questionId, ...visibleWhere(user, cycles) }, select: { id: true } }))) redirect(back);

  let notebookId = String(form.get("notebookId") ?? "");
  const novo = clean(form.get("novo"));
  if (notebookId === "novo" || (!notebookId && novo)) {
    if (novo.length < 2) redirect(`${back}&caderno_erro=1`);
    if ((await db.notebook.count({ where: { userId: user.id } })) >= REGRAS.cadernos.maxPorAluno) redirect(`${back}&caderno_erro=1`);
    notebookId = (await db.notebook.create({ data: { userId: user.id, name: novo } })).id;
  }
  const nb = await ownNotebook(user.id, notebookId);
  if (!nb) redirect(back);
  if ((await db.notebookQuestion.count({ where: { notebookId: nb!.id } })) < REGRAS.cadernos.maxQuestoes)
    await db.notebookQuestion.upsert({ where: { notebookId_questionId: { notebookId: nb!.id, questionId } }, update: {}, create: { notebookId: nb!.id, questionId } });
  redirect(`${back}&caderno_ok=${encodeURIComponent(nb!.name)}`);
}

export async function removeFromNotebook(form: FormData) {
  const user = await requireUser();
  const nb = await ownNotebook(user.id, String(form.get("notebookId")));
  if (nb) await db.notebookQuestion.deleteMany({ where: { notebookId: nb.id, questionId: String(form.get("questionId")) } });
  redirect(safeBack(form.get("back"), "/app/cadernos"));
}
