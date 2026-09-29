import { createHash } from "node:crypto";

const LETTERS = ["A", "B", "C", "D", "E"] as const;

/**
 * Ordem de exibição das alternativas, estável por aluno + questão (a mesma pessoa sempre vê a mesma ordem;
 * alunos diferentes veem ordens diferentes). O servidor guarda a letra ORIGINAL escolhida.
 * Retorna: display[i] = letra original mostrada na posição i.
 */
export function displayOrder(userId: string, questionId: string, letters: readonly string[] = LETTERS): string[] {
  const seed = createHash("sha256").update(`${userId}:${questionId}`).digest();
  const order = [...letters];
  for (let i = order.length - 1; i > 0; i--) {
    const j = seed[i] % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Converte a posição clicada na tela para a letra original armazenada. */
export function originalLetter(userId: string, questionId: string, shownIndex: number): string {
  return displayOrder(userId, questionId)[shownIndex];
}
