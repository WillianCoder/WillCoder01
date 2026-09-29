/**
 * 📄 O QUE É: CÁLCULO DO RANKING.
 *   Pontos = questões acertadas na PRIMEIRA tentativa dentro do período.
 *   Repetir a mesma questão até acertar não soma pontos (proteção contra manipulação).
 *   Só entra quem autorizou (Configurações) e tem apelido. Nunca mostra e-mail ou nome completo.
 * ✏️ EDITÁVEL: tamanho do ranking em src/config/regras.ts (ranking.tamanho).
 * ⚠️ CUIDADO: consulta SQL parametrizada (segura contra SQL injection) — não monte SQL com texto do usuário.
 */
import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { REGRAS } from "../config/regras";

export type Periodo = "semana" | "mes" | "geral";
export type RankingRow = { userId: string; nickname: string; school: string | null; points: number; answered: number };

export function periodoInicio(p: Periodo, now = new Date()) {
  if (p === "semana") return new Date(now.getTime() - 7 * 86_400_000);
  if (p === "mes") return new Date(now.getTime() - 30 * 86_400_000);
  return new Date(0);
}

export async function ranking(opts: { periodo: Periodo; ciclo?: "BASIC" | "SPECIFIC"; stateCode?: string | null; schoolId?: string | null }) {
  const since = periodoInicio(opts.periodo);
  const ciclo = opts.ciclo ? Prisma.sql`AND c."code"::text = ${opts.ciclo}` : Prisma.empty;
  const estado = opts.stateCode ? Prisma.sql`AND u."stateCode" = ${opts.stateCode}` : Prisma.empty;
  const escola = opts.schoolId ? Prisma.sql`AND u."schoolId" = ${opts.schoolId}` : Prisma.empty;
  const rows = await db.$queryRaw<{ userId: string; nickname: string; school: string | null; points: bigint; answered: bigint }[]>`
    WITH first AS (
      SELECT DISTINCT ON (a."userId", a."questionId") a."userId", a."questionId", a."correct", a."createdAt"
      FROM "QuestionAttempt" a
      ORDER BY a."userId", a."questionId", a."createdAt" ASC
    )
    SELECT u."id" AS "userId", u."nickname", s."name" AS "school",
           COUNT(*) FILTER (WHERE f."correct") AS "points", COUNT(*) AS "answered"
    FROM first f
    JOIN "User" u ON u."id" = f."userId"
    JOIN "Question" q ON q."id" = f."questionId"
    JOIN "Subject" sb ON sb."id" = q."subjectId"
    JOIN "Cycle" c ON c."id" = sb."cycleId"
    LEFT JOIN "School" s ON s."id" = u."schoolId"
    WHERE u."rankingOptIn" = true AND u."nickname" IS NOT NULL AND u."blocked" = false
      AND u."role" = 'STUDENT' AND f."createdAt" >= ${since}
      ${ciclo} ${estado} ${escola}
    GROUP BY u."id", u."nickname", s."name"
    ORDER BY "points" DESC, "answered" ASC, u."id"
    LIMIT ${REGRAS.ranking.tamanho}`;
  return rows.map((r) => ({ ...r, points: Number(r.points), answered: Number(r.answered) })) as RankingRow[];
}
