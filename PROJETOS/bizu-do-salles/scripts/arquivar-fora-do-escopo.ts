// Arquiva no banco as questões listadas em content/fora-do-escopo/*.json (não apaga nada).
// Uso: npm run content:arquivar   — pode rodar várias vezes; só mexe no que ainda está publicado.
// Desfazer: no painel (Admin → Questões), voltar o status para "Publicada".
import { PrismaClient } from "@prisma/client";
import { join } from "node:path";
import { loadQuestionFiles } from "../src/content";

const db = new PrismaClient();
const MOTIVO = "Fora do escopo da grade curricular do CFSd (docs/AUDITORIA_CFSD.md)";

async function main() {
  const codes = loadQuestionFiles(join(__dirname, "..", "content", "fora-do-escopo")).flatMap((f) => f.questions.map((q) => q.code));
  let n = 0;
  for (const code of codes) {
    const q = await db.question.findUnique({ where: { code }, select: { id: true, status: true } });
    if (!q || q.status === "ARCHIVED") continue;
    await db.$transaction([
      db.question.update({ where: { id: q.id }, data: { status: "ARCHIVED" } }),
      db.auditLog.create({ data: { actorId: "sistema", action: "question.archive", entity: "Question", entityId: q.id, before: { status: q.status }, after: { status: "ARCHIVED", motivo: MOTIVO } } }),
    ]);
    n++;
  }
  console.log(`${n} questão(ões) arquivada(s) de ${codes.length} listadas como fora do escopo.`);
  await db.$disconnect();
}

main();
