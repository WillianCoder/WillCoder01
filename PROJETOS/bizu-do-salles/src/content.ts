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
  explanation: z.string().min(20),
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
  /** AUTORAL = criada do zero pelo Bizu · BASEADA_EM_PROVA = nova, inspirada no tema de uma prova · OFICIAL = reprodução autorizada. */
  origem: z.enum(["AUTORAL", "BASEADA_EM_PROVA", "OFICIAL"]).default("AUTORAL"),
  /** ALTA = conferida no texto oficial vigente · MEDIA = confiável, mas pede revisão · REVISAO = dúvida (não vai para o aluno). */
  confianca: z.enum(["ALTA", "MEDIA", "REVISAO"]).default("MEDIA"),
  /** Data da última conferência da legislação (AAAA-MM-DD). */
  verificadoEm: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  /** Identificadores do banco de fontes (content/fontes/fontes.json). */
  fontes: z.array(z.string()).default([]),
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

export const materialFile = z.object({
  title: z.string().min(3),
  kind: z.enum(["summary", "audio", "pdf"]),
  cycle: z.enum(["BASIC", "SPECIFIC"]).optional(),
  subject: z.string().optional(),
  state: z.string().regex(/^[A-Z]{2}$/).optional(),
  free: z.boolean().default(false),
  sourceLicense: z.string().min(10),
  url: z.string().url().startsWith("https://").optional(),
  body: z.string().default(""),
});
export type MaterialFile = z.infer<typeof materialFile>;

export const fonte = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titulo: z.string(),
  orgao: z.string(),
  url: z.string().url().optional(),
  categoria: z.enum(["OFICIAL", "LICENCA_ABERTA", "DOMINIO_PUBLICO", "PUBLICO_COM_DIREITOS", "COMERCIAL"]),
  uso: z.string(),
  dataDocumento: z.string().optional(),
  acessadoEm: z.string(),
});
export type Fonte = z.infer<typeof fonte>;

/** Banco de fontes: content/fontes/fontes.json. */
export function loadFontes(file = join(__dirname, "..", "content", "fontes", "fontes.json")): Fonte[] {
  return z.array(fonte).parse(JSON.parse(readFileSync(file, "utf8")));
}

/** Lê e valida content/materiais/*.json. */
export function loadMaterialFiles(dir = join(__dirname, "..", "content", "materiais")): MaterialFile[] {
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => materialFile.parse(JSON.parse(readFileSync(join(dir, f), "utf8"))));
}
