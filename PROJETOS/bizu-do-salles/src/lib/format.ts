export const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const date = (d: Date | null | undefined) => (d ? d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—");
export const CYCLE_NAME: Record<string, string> = { BASIC: "Ciclo Básico", SPECIFIC: "Ciclo Específico" };
export const LEVEL_NAME: Record<string, string> = { EASY: "Fácil", MEDIUM: "Média", HARD: "Difícil" };
