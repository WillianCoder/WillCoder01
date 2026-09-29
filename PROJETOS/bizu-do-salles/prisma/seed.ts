// Popula dados iniciais editáveis no painel: planos, ciclos, flags, configurações e questões revisadas.
import { PrismaClient } from "@prisma/client";
import { loadQuestionFiles } from "../src/content";
import { UFS } from "../src/core/states";

const db = new PrismaClient();
const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  const plans = [
    { slug: "basico", name: "Ciclo Básico", description: "Acesso completo ao Ciclo Básico.", priceCents: 3500, durationDays: 90, cycles: ["BASIC"] },
    { slug: "especifico", name: "Ciclo Específico", description: "Acesso completo ao Ciclo Específico.", priceCents: 3500, durationDays: 90, cycles: ["SPECIFIC"] },
    { slug: "basico-especifico", name: "Básico + Específico", description: "Plano trimestral com os dois ciclos.", priceCents: 6000, durationDays: 90, cycles: ["BASIC", "SPECIFIC"] },
  ] as const;
  for (const p of plans) {
    // update vazio: o seed nunca sobrescreve preços alterados pelo administrador.
    await db.plan.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, cycles: [...p.cycles], benefits: [] } });
  }

  for (const [key, enabled] of Object.entries({ ranking: true, audio: true, ai: false, free_content: true, simulations: true, gamification: true })) {
    await db.featureFlag.upsert({ where: { key }, update: {}, create: { key, enabled } });
  }
  await db.setting.upsert({ where: { key: "app_name" }, update: {}, create: { key: "app_name", value: "Bizu do Salles" } });

  for (const [code, name] of Object.entries(UFS)) {
    await db.state.upsert({ where: { code }, update: {}, create: { code, name } });
  }

  const cycles = {
    BASIC: await db.cycle.upsert({ where: { code: "BASIC" }, update: {}, create: { code: "BASIC", name: "Ciclo Básico" } }),
    SPECIFIC: await db.cycle.upsert({ where: { code: "SPECIFIC" }, update: {}, create: { code: "SPECIFIC", name: "Ciclo Específico" } }),
  };

  let n = 0;
  for (const file of loadQuestionFiles()) {
    const cycle = cycles[file.cycle];
    const subject = await db.subject.upsert({
      where: { cycleId_slug: { cycleId: cycle.id, slug: slug(file.subject) } },
      update: {},
      create: { cycleId: cycle.id, name: file.subject, slug: slug(file.subject) },
    });
    const topic = await db.topic.upsert({
      where: { subjectId_slug: { subjectId: subject.id, slug: slug(file.topic) } },
      update: {},
      create: { subjectId: subject.id, name: file.topic, slug: slug(file.topic) },
    });
    for (const [i, q] of file.questions.entries()) {
      const exists = await db.question.findUnique({ where: { code: q.code } });
      if (exists) continue; // edições feitas no painel prevalecem
      await db.question.create({
        data: {
          code: q.code, subjectId: subject.id, topicId: topic.id, stateCode: file.state ?? null, statement: q.statement, correctLetter: q.correct,
          explanation: q.explanation, reference: q.reference, sourceLicense: file.sourceLicense, difficulty: q.difficulty,
          author: file.author, status: "PUBLISHED", isFree: i < 3, // 3 primeiras de cada arquivo = amostra grátis
          options: { create: Object.entries(q.options).map(([letter, text]) => ({ letter, text, whyWrong: q.whyWrong?.[letter as "A"] })) },
        },
      });
      n++;
    }
  }
  console.log(`Seed concluído: ${plans.length} planos, ${n} questões novas.`);
}

main().finally(() => db.$disconnect());
