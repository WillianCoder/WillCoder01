// Aplica no banco os planos e preços de src/config/planos.ts (nome, descrição, preço, dias e ciclos).
// Uso: npm run planos:atualizar — cria o plano se não existir; registra cada mudança na Auditoria.
// Assinaturas já pagas NÃO mudam: valem o preço e a validade da compra.
import { PrismaClient } from "@prisma/client";
import { PLANOS } from "../src/config/planos";

const db = new PrismaClient();
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function main() {
  for (const p of PLANOS) {
    const data = { name: p.name, description: p.description, priceCents: p.priceCents, durationDays: p.durationDays, cycles: [...p.cycles] };
    const antes = await db.plan.findUnique({ where: { slug: p.slug } });
    const depois = await db.plan.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data, benefits: [] } });
    await db.auditLog.create({ data: { actorId: "sistema", action: "plan.update", entity: "Plan", entityId: depois.id,
      before: antes ? { priceCents: antes.priceCents, durationDays: antes.durationDays, name: antes.name } : undefined, after: data } });
    console.log(`${p.name}: ${antes ? brl(antes.priceCents) + " → " : ""}${brl(p.priceCents)} por ${p.durationDays} dias`);
  }
  await db.$disconnect();
}

main();
