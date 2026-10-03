// Reorganiza o BANCO para seguir a grade oficial (src/config/grade.ts) e os arquivos de content/.
// Uso: npm run content:realinhar   — seguro para rodar várias vezes; não apaga nada.
//  • move cada questão e cada resumo para a matéria/ciclo indicados no arquivo de content/;
//  • ordena as matérias como na grade;
//  • desativa (active = false) matérias antigas que ficaram sem nenhuma questão e sem resumo.
// Cada mudança de questão fica registrada na Auditoria do painel.
import { PrismaClient } from "@prisma/client";
import { loadMaterialFiles, loadQuestionFiles } from "../src/content";
import { ordemNaGrade } from "../src/config/grade";

const db = new PrismaClient();
// Nomes antigos do Bizu → matéria oficial (para questões criadas pelo painel, que não estão em content/).
const ANTIGAS: [ciclo: "BASIC" | "SPECIFIC", antiga: string, ciclo: "BASIC" | "SPECIFIC", nova: string][] = [
  ["SPECIFIC", "Regulamento Disciplinar da PM (RDPM)", "BASIC", "Direito Administrativo Disciplinar Militar"],
  ["BASIC", "Língua Portuguesa", "BASIC", "Comunicação e Expressão"],
  ["BASIC", "Noções de Informática", "BASIC", "Tecnologia da Informação e Comunicações"],
  ["BASIC", "Noções de Administração Pública", "SPECIFIC", "Direito Administrativo"],
  ["BASIC", "Direitos Humanos", "BASIC", "Direitos Humanos e Ações Afirmativas"],
  ["SPECIFIC", "Atendimento Pré-Hospitalar", "BASIC", "Resgate I"],
  ["SPECIFIC", "Direito Constitucional", "BASIC", "Direito Constitucional"],
  ["SPECIFIC", "Direito Penal", "BASIC", "Direito Penal I"],
  ["SPECIFIC", "Processo Penal", "BASIC", "Direito Processual Penal"],
  ["SPECIFIC", "Legislação de Trânsito", "BASIC", "Direito de Trânsito"],
  ["SPECIFIC", "Legislação Penal Especial", "SPECIFIC", "Direito Penal II"],
  ["SPECIFIC", "Uso da Força e Direitos Humanos", "SPECIFIC", "Menor Potencial Ofensivo"],
  ["SPECIFIC", "Polícia Comunitária", "SPECIFIC", "Doutrina de Polícia Comunitária"],
];

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  const cycles = {
    BASIC: await db.cycle.upsert({ where: { code: "BASIC" }, update: {}, create: { code: "BASIC", name: "Ciclo Básico" } }),
    SPECIFIC: await db.cycle.upsert({ where: { code: "SPECIFIC" }, update: {}, create: { code: "SPECIFIC", name: "Ciclo Específico" } }),
  };
  const subjectFor = (cycle: "BASIC" | "SPECIFIC", name: string) =>
    db.subject.upsert({
      where: { cycleId_slug: { cycleId: cycles[cycle].id, slug: slug(name) } },
      update: { name, active: true, order: ordemNaGrade(cycle, name) },
      create: { cycleId: cycles[cycle].id, name, slug: slug(name), order: ordemNaGrade(cycle, name) },
    });

  let movidas = 0;
  for (const file of loadQuestionFiles()) {
    const subject = await subjectFor(file.cycle, file.subject);
    const topic = await db.topic.upsert({
      where: { subjectId_slug: { subjectId: subject.id, slug: slug(file.topic) } },
      update: {},
      create: { subjectId: subject.id, name: file.topic, slug: slug(file.topic) },
    });
    for (const q of file.questions) {
      const atual = await db.question.findUnique({ where: { code: q.code }, select: { id: true, subjectId: true, topicId: true } });
      if (!atual || (atual.subjectId === subject.id && atual.topicId === topic.id)) continue;
      await db.$transaction([
        db.question.update({ where: { id: atual.id }, data: { subjectId: subject.id, topicId: topic.id } }),
        db.auditLog.create({ data: { actorId: "sistema", action: "question.realign", entity: "Question", entityId: atual.id,
          before: { subjectId: atual.subjectId, topicId: atual.topicId }, after: { subjectId: subject.id, topicId: topic.id, materia: file.subject, ciclo: file.cycle } } }),
      ]);
      movidas++;
    }
  }

  // Questões que sobraram nas matérias antigas (criadas pelo painel ou importadas por planilha).
  for (const [cAnt, antiga, cNova, nova] of ANTIGAS) {
    const velha = await db.subject.findUnique({ where: { cycleId_slug: { cycleId: cycles[cAnt].id, slug: slug(antiga) } } });
    if (!velha) continue;
    const restantes = await db.question.findMany({ where: { subjectId: velha.id }, select: { id: true, topicId: true, topic: { select: { name: true } } } });
    if (!restantes.length) continue;
    const destino = await subjectFor(cNova, nova);
    for (const q of restantes) {
      const nomeTopico = q.topic?.name;
      const topico = nomeTopico
        ? await db.topic.upsert({ where: { subjectId_slug: { subjectId: destino.id, slug: slug(nomeTopico) } }, update: {}, create: { subjectId: destino.id, name: nomeTopico, slug: slug(nomeTopico) } })
        : null;
      await db.$transaction([
        db.question.update({ where: { id: q.id }, data: { subjectId: destino.id, topicId: topico?.id ?? null } }),
        db.auditLog.create({ data: { actorId: "sistema", action: "question.realign", entity: "Question", entityId: q.id,
          before: { subjectId: velha.id, topicId: q.topicId }, after: { subjectId: destino.id, topicId: topico?.id ?? null, materia: nova, ciclo: cNova } } }),
      ]);
      movidas++;
    }
  }

  let resumos = 0;
  for (const mat of loadMaterialFiles()) {
    if (!mat.cycle || !mat.subject) continue;
    const subject = await subjectFor(mat.cycle, mat.subject);
    const r = await db.material.updateMany({ where: { title: mat.title, NOT: { subjectId: subject.id } }, data: { subjectId: subject.id, cycle: mat.cycle } });
    resumos += r.count;
  }

  const vazias = await db.subject.updateMany({ where: { active: true, questions: { none: {} }, materials: { none: {} } }, data: { active: false } });
  console.log(`Realinhado: ${movidas} questão(ões) e ${resumos} resumo(s) movidos; ${vazias.count} matéria(s) antiga(s) vazia(s) desativada(s).`);
  await db.$disconnect();
}

main();
