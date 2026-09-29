/**
 * 📄 O QUE É: REGRA DE ACESSO DA BIBLIOTECA (servidor): publicado + estado do aluno/nacional + (grátis ou ciclo liberado).
 * ⚠️ CUIDADO: área de SEGURANÇA — a mesma lógica das questões.
 */
import "server-only";
import type { Prisma } from "@prisma/client";
import { stateWhere } from "../core/states";

export function visibleMaterialWhere(user: { stateCode: string | null }, cycles: readonly string[]): Prisma.MaterialWhereInput {
  return {
    published: true,
    AND: [stateWhere(user.stateCode), { OR: [{ free: true }, { cycle: { in: [...cycles] as ("BASIC" | "SPECIFIC")[] } }] }],
  };
}

export const KIND_NAME: Record<string, string> = { summary: "📝 Resumo", audio: "🎧 Áudio", pdf: "📄 PDF" };
