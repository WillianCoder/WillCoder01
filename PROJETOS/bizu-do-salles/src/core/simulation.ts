/**
 * 📄 O QUE É: REGRAS DOS SIMULADOS — sorteio das questões, correção e resumo do resultado.
 * ✏️ EDITÁVEL: limites de quantidade/tempo ficam em src/config/regras.ts (simulado).
 * ⚠️ CUIDADO: coberto por testes (npm test).
 */
import { randomInt } from "node:crypto";

/** Sorteia n itens sem repetição (Fisher–Yates com gerador criptográfico). */
export function pickRandom<T>(items: readonly T[], n: number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(0, n));
}

export interface GradedItem {
  subject: string;
  correctLetter: string;
  chosenLetter: string | null; // null = deixou em branco
}

/** Corrige o simulado: nota geral e desempenho por disciplina (em branco conta como erro). */
export function gradeSimulation(items: GradedItem[]) {
  const bySubject = new Map<string, { total: number; correct: number }>();
  let correct = 0;
  let blank = 0;
  for (const it of items) {
    const ok = it.chosenLetter !== null && it.chosenLetter === it.correctLetter;
    if (ok) correct++;
    if (it.chosenLetter === null) blank++;
    const s = bySubject.get(it.subject) ?? { total: 0, correct: 0 };
    s.total++;
    if (ok) s.correct++;
    bySubject.set(it.subject, s);
  }
  const pct = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
  return {
    total: items.length,
    correct,
    wrong: items.length - correct - blank,
    blank,
    rate: pct(correct, items.length),
    subjects: [...bySubject].map(([subject, s]) => ({ subject, ...s, rate: pct(s.correct, s.total) })).sort((a, b) => a.rate - b.rate),
  };
}

/** Segundos restantes de um simulado com tempo; null = sem limite. */
export function secondsLeft(startedAt: Date, timeLimitS: number | null, now = new Date()) {
  if (!timeLimitS) return null;
  return Math.max(0, timeLimitS - Math.floor((now.getTime() - startedAt.getTime()) / 1000));
}
