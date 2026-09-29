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
export function originalLetter(userId: string, questionId: string, shownIndex: number, order?: string[]): string {
  return (order ?? displayOrder(userId, questionId))[shownIndex];
}

/** Alternativas só com números/valores (ex.: "15 dias", "R$ 2.300,00") ficam em ordem original, para facilitar a leitura. */
export function isNumericOptions(texts: string[]) {
  return texts.length > 0 && texts.every((t) => /^(R\$\s*)?\d/.test(t.trim()) && t.length <= 40);
}

/** Ordem de exibição considerando o conteúdo: numéricas não são embaralhadas. */
export function orderFor(userId: string, q: { id: string; options: { letter: string; text: string }[] }) {
  return isNumericOptions(q.options.map((o) => o.text)) ? ["A", "B", "C", "D", "E"] : displayOrder(userId, q.id);
}
