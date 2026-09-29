import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const LETTERS = ["A", "B", "C", "D", "E"] as const;

const question = z.object({
  code: z.string().regex(/^[A-Z]+-[A-Z]+-\d{3}$/),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  statement: z.string().min(20),
  options: z.object({ A: z.string(), B: z.string(), C: z.string(), D: z.string(), E: z.string() }),
  correct: z.enum(LETTERS),
  explanation: z.string().min(10),
  whyWrong: z.partialRecord(z.enum(LETTERS), z.string()).optional(),
  reference: z.string().min(3),
});

export const questionFile = z.object({
  cycle: z.enum(["BASIC", "SPECIFIC"]),
  subject: z.string(),
  topic: z.string(),
  /** UF para legislação estadual; omitido = conteúdo nacional. */
  state: z.string().regex(/^[A-Z]{2}$/).optional(),
  sourceLicense: z.string().min(10),
  author: z.string(),
  questions: z.array(question).min(1),
});

export type QuestionFile = z.infer<typeof questionFile>;

/** Lê e valida content/questoes/*.json. Falha em códigos repetidos ou alternativas duplicadas. */
export function loadQuestionFiles(dir = join(__dirname, "..", "content", "questoes")): QuestionFile[] {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const parsed = files.map((f) => questionFile.parse(JSON.parse(readFileSync(join(dir, f), "utf8"))));
  const seen = new Set<string>();
  for (const q of parsed.flatMap((f) => f.questions)) {
    if (seen.has(q.code)) throw new Error(`Código de questão repetido: ${q.code}`);
    seen.add(q.code);
    const texts = Object.values(q.options).map((t) => t.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) throw new Error(`Alternativas repetidas em ${q.code}`);
  }
  return parsed;
}
