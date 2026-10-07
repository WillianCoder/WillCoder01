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

/** Questão candidata ao simulado inteligente. */
export interface SmartCandidate {
  id: string;
  answered: boolean; // o aluno já respondeu esta questão alguma vez
  wrongBefore: boolean; // já errou esta questão
  subjectRate: number | null; // aproveitamento do aluno na matéria (0–100); null = nunca respondeu a matéria
}

/** Peso de cada questão: erros antigos primeiro, depois questões novas de matérias fracas. */
export function smartWeight(c: SmartCandidate) {
  const fraqueza = c.subjectRate === null ? 1 : (100 - c.subjectRate) / 50; // 0 (domina) a 2 (não acerta nada)
  return 0.25 + (c.wrongBefore ? 3 : 0) + (c.answered ? 0 : 1.5) + fraqueza;
}

/**
 * Simulado inteligente: sorteio PONDERADO sem repetição (método Efraimidis–Spirakis).
 * Quem tem mais peso tem mais chance, mas ainda há variedade entre simulados.
 */
export function smartPick(candidates: readonly SmartCandidate[], n: number, rand: () => number = () => randomInt(1, 1_000_000) / 1_000_000): string[] {
  return candidates
    .map((c) => ({ id: c.id, key: Math.pow(rand(), 1 / smartWeight(c)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, Math.max(0, n))
    .map((c) => c.id);
}

/** Nota de 0 a 10 (uma casa decimal), como nas verificações do CFSd. */
export function notaDez(correct: number, total: number) {
  return total ? Math.round((correct / total) * 100) / 10 : 0;
}

/**
 * Leitura da nota pelas regras de avaliação da ESSd (Manual do Aluno, art. 146):
 * abaixo de 7,0 o aluno vai para a verificação final; abaixo de 5,0 após a final, 2ª época.
 */
export function situacaoCFSd(nota: number) {
  if (nota >= 7) return { nivel: "ok" as const, texto: "Acima de 7,0: neste ritmo você evitaria a verificação final." };
  if (nota >= 5) return { nivel: "atencao" as const, texto: "Entre 5,0 e 7,0: no curso, isso levaria à verificação final. Revise as matérias abaixo." };
  return { nivel: "risco" as const, texto: "Abaixo de 5,0: zona de risco (verificação final e, depois, 2ª época). Priorize as matérias abaixo." };
}
