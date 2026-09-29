import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { stateWhere } from "../core/states";

export type Filter = "nao-respondidas" | "erradas" | "favoritas" | "revisar" | "todas";
export const FILTERS: Record<Filter, string> = {
  "nao-respondidas": "Não respondidas",
  erradas: "Que errei",
  favoritas: "Favoritas",
  revisar: "Revisar depois",
  todas: "Todas",
};

/** Regra de visibilidade (servidor): publicada + do estado do aluno/nacional + (grátis ou ciclo liberado). */
export function visibleWhere(user: { id: string; stateCode: string | null }, cycles: readonly string[]): Prisma.QuestionWhereInput {
  return {
    status: "PUBLISHED",
    AND: [stateWhere(user.stateCode), { OR: [{ isFree: true }, { subject: { cycle: { code: { in: [...cycles] as ("BASIC" | "SPECIFIC")[] } } } }] }],
  };
}

export function filterWhere(userId: string, filter: Filter, subjectId?: string): Prisma.QuestionWhereInput {
  const w: Prisma.QuestionWhereInput = subjectId ? { subjectId } : {};
  switch (filter) {
    case "nao-respondidas": return { ...w, attempts: { none: { userId } } };
    case "erradas": return { ...w, attempts: { some: { userId, correct: false } } };
    case "favoritas": return { ...w, favorites: { some: { userId, kind: "FAVORITE" } } };
    case "revisar": return { ...w, favorites: { some: { userId, kind: "REVIEW_LATER" } } };
    default: return w;
  }
}

/** Próxima questão (ordem por código, após a atual), sem carregar o banco inteiro. */
export async function nextQuestionId(where: Prisma.QuestionWhereInput, afterCode?: string) {
  const next = await db.question.findFirst({ where: { ...where, ...(afterCode ? { code: { gt: afterCode } } : {}) }, orderBy: { code: "asc" }, select: { id: true } });
  if (next || !afterCode) return next?.id ?? null;
  return (await db.question.findFirst({ where, orderBy: { code: "asc" }, select: { id: true } }))?.id ?? null;
}
