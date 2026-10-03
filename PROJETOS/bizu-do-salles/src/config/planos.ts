/**
 * ════════════════════════════════════════════════════════════════════
 * 💰 PLANOS E PREÇOS PADRÃO
 * ════════════════════════════════════════════════════════════════════
 * O QUE É: os 3 planos do Bizu. Usados na primeira carga (npm run db:seed)
 *          e pelo comando `npm run planos:atualizar`, que aplica estes
 *          valores no banco que já existe (fica registrado na Auditoria).
 *
 * Referência de mercado (out/2026): QAP Bizurado R$ 72,90/6 meses e
 * R$ 125,00/12 meses; Bizu do Souza R$ 99,90 (Básico + Específico).
 * Cada ciclo do CFSd dura 26 semanas (~180 dias); o curso todo, ~1 ano.
 *
 * ✏️ EDITÁVEL: preço em CENTAVOS (2990 = R$ 29,90) e dias de acesso.
 *              Também dá para mudar só pelo painel (Admin → Planos e preços).
 * ⚠️ CUIDADO:  não troque o "slug" (identificador usado nos pagamentos).
 * ════════════════════════════════════════════════════════════════════
 */
export const PLANOS = [
  { slug: "basico", name: "Ciclo Básico", description: "Todo o 1º ciclo do CFSd por 6 meses.", priceCents: 2990, durationDays: 180, cycles: ["BASIC"] },
  { slug: "especifico", name: "Ciclo Específico", description: "Todo o 2º ciclo do CFSd por 6 meses.", priceCents: 2990, durationDays: 180, cycles: ["SPECIFIC"] },
  { slug: "basico-especifico", name: "Completo: Básico + Específico", description: "O curso inteiro, os dois ciclos, por 12 meses.", priceCents: 4990, durationDays: 365, cycles: ["BASIC", "SPECIFIC"] },
] as const;
