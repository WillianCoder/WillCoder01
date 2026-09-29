/**
 * 📄 O QUE É: NOMES EXIBIDOS e formatação (moeda, data, nomes dos ciclos e dificuldades).
 * ✏️ EDITÁVEL: CYCLE_NAME (ex.: 'Ciclo Básico') e LEVEL_NAME (Fácil/Média/Difícil).
 * ⚠️ CUIDADO: Não mude as chaves à esquerda (BASIC, EASY...), só os textos à direita.
 * 📘 Guia completo: docs/RELATORIO.pdf (capítulo 'Guia de edição')
 */
export const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const date = (d: Date | null | undefined) => (d ? d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—");
// ✏️ EDITÁVEL: nomes exibidos dos ciclos e das dificuldades (mude só o texto à direita)
export const CYCLE_NAME: Record<string, string> = { BASIC: "Ciclo Básico", SPECIFIC: "Ciclo Específico" };
export const LEVEL_NAME: Record<string, string> = { EASY: "Fácil", MEDIUM: "Média", HARD: "Difícil" };
