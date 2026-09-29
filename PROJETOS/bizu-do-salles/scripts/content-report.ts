// Relatório do banco de questões: total por ciclo/disciplina/dificuldade e distribuição de gabaritos.
import { loadQuestionFiles } from "../src/content";

const files = loadQuestionFiles();
const count = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
const bySubject = new Map<string, number>(), byLevel = new Map<string, number>(), byLetter = new Map<string, number>(), byScope = new Map<string, number>();
for (const f of files)
  for (const q of f.questions) {
    count(bySubject, `${f.cycle === "BASIC" ? "Básico" : "Específico"} · ${f.subject}`);
    count(byLevel, q.difficulty);
    count(byLetter, q.correct);
    count(byScope, f.state ?? "Nacional");
  }
const total = [...byLevel.values()].reduce((a, b) => a + b, 0);
const show = (title: string, m: Map<string, number>) =>
  console.log(`\n${title}\n` + [...m].sort().map(([k, v]) => `  ${k.padEnd(48)} ${String(v).padStart(4)}`).join("\n"));
console.log(`Total: ${total} questões (meta: 500)`);
show("Por ciclo e disciplina", bySubject);
show("Por abrangência", byScope);
show("Por dificuldade", byLevel);
show("Gabaritos (evitar concentração em uma letra)", byLetter);
