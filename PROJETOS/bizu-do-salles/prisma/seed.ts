/**
 * 📄 O QUE É: CARGA INICIAL do banco: planos, estados, recursos e questões dos arquivos JSON.
 * ✏️ EDITÁVEL: Planos INICIAIS (só valem na primeira carga; depois, use o painel).
 * ⚠️ CUIDADO: Nunca sobrescreve dados já existentes — pode rodar várias vezes com segurança.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
// Popula dados iniciais editáveis no painel: planos, ciclos, flags, configurações e questões revisadas.
import { PrismaClient } from "@prisma/client";
import { loadMaterialFiles, loadQuestionFiles } from "../src/content";
import { UFS } from "../src/core/states";
import { REGRAS } from "../src/config/regras";
import { ordemNaGrade } from "../src/config/grade";
import { PLANOS } from "../src/config/planos";

const db = new PrismaClient();
const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Texto de rastreabilidade gravado em cada questão (visível no painel): licença + origem + confiança + data + fontes. */
const rastreio = (f: { sourceLicense: string; origem: string; confianca: string; verificadoEm?: string; fontes: string[] }) =>
  [f.sourceLicense, `Origem: ${f.origem}`, `Confiança: ${f.confianca}`, f.verificadoEm && `Verificado em ${f.verificadoEm}`, f.fontes.length ? `Fontes: ${f.fontes.join(", ")}` : ""]
    .filter(Boolean).join(" · ");

async function main() {
  // ✏️ Planos e preços: src/config/planos.ts (depois da primeira carga, use o painel ou `npm run planos:atualizar`)
  const plans = PLANOS;
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
  const files = loadQuestionFiles();
  console.log("Carregando questões (pode levar alguns minutos na primeira vez)…");
  for (const [f, file] of files.entries()) {
    console.log(`  [${f + 1}/${files.length}] ${file.subject} — ${file.topic}`);
    const cycle = cycles[file.cycle];
    const subject = await db.subject.upsert({
      where: { cycleId_slug: { cycleId: cycle.id, slug: slug(file.subject) } },
      update: {},
      create: { cycleId: cycle.id, name: file.subject, slug: slug(file.subject), order: ordemNaGrade(file.cycle, file.subject) },
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
          explanation: q.explanation, reference: q.reference, sourceLicense: rastreio(file), difficulty: q.difficulty,
          // 🔴 confiança REVISAO nunca vai direto para o aluno: entra "em revisão" no painel.
          author: file.author, status: file.confianca === "REVISAO" ? "IN_REVIEW" : "PUBLISHED", isFree: i < REGRAS.conteudo.gratisPorArquivo, // amostra grátis (✏️ src/config/regras.ts)
          options: { create: Object.entries(q.options).map(([letter, text]) => ({ letter, text, whyWrong: q.whyWrong?.[letter as "A"] })) },
        },
      });
      n++;
    }
  }
  // Materiais da biblioteca: só cria os que ainda não existem (pelo título); edições do painel prevalecem.
  let m = 0;
  console.log("Carregando materiais…");
  for (const mat of loadMaterialFiles()) {
    if (await db.material.findFirst({ where: { title: mat.title } })) continue;
    const cycle = mat.cycle ? cycles[mat.cycle] : null;
    const subject = cycle && mat.subject ? await db.subject.findUnique({ where: { cycleId_slug: { cycleId: cycle.id, slug: slug(mat.subject) } } }) : null;
    await db.material.create({
      data: {
        title: mat.title, kind: mat.kind, cycle: mat.cycle ?? null, subjectId: subject?.id ?? null, stateCode: mat.state ?? null,
        storageKey: mat.url ?? "", body: mat.body, free: mat.free, published: true, sourceLicense: mat.sourceLicense,
      },
    });
    m++;
  }
  console.log(`Seed concluído: ${plans.length} planos, ${n} questões novas, ${m} materiais novos.`);
}

main().finally(() => db.$disconnect());
