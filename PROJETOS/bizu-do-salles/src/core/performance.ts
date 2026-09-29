export interface Attempt {
  subject: string;
  topic?: string;
  correct: boolean;
  timeMs?: number;
}

export interface Stat {
  key: string;
  answered: number;
  correct: number;
  rate: number; // 0..100
}

function stat(key: string, list: Attempt[]): Stat {
  const correct = list.filter((a) => a.correct).length;
  return { key, answered: list.length, correct, rate: list.length ? Math.round((correct / list.length) * 100) : 0 };
}

export function groupStats(attempts: Attempt[], by: "subject" | "topic"): Stat[] {
  const groups = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const k = (by === "subject" ? a.subject : a.topic) ?? "Sem assunto";
    groups.set(k, [...(groups.get(k) ?? []), a]);
  }
  return [...groups].map(([k, l]) => stat(k, l)).sort((a, b) => b.rate - a.rate);
}

/** Raio-X: regras simples e auditáveis, sem IA. Mínimo de 5 respostas para opinar. */
export function xray(attempts: Attempt[], minAnswers = 5, weakBelow = 60, strongFrom = 80) {
  const subjects = groupStats(attempts, "subject").filter((s) => s.answered >= minAnswers);
  const strong = subjects.filter((s) => s.rate >= strongFrom);
  const weak = subjects.filter((s) => s.rate < weakBelow).sort((a, b) => a.rate - b.rate);
  const tips = [
    ...subjects.map((s) => `Você está com ${s.rate}% em ${s.key}.`),
    ...weak.slice(0, 1).map((s) => `Sugestão: revisar ${s.key} antes de avançar.`),
  ];
  return { overall: stat("Geral", attempts), strong, weak, tips };
}
