/**
 * ════════════════════════════════════════════════════════════════════
 * 🎓 GRADE CURRICULAR OFICIAL DO CFSd PMESP (Polícia Ostensiva)
 * ════════════════════════════════════════════════════════════════════
 * O QUE É: as matérias do curso, na ordem e com a carga horária do
 *          Manual do Aluno da ESSd (6ª ed., dez/2019, "Grade Curricular", pág. 7).
 *          1º CENS = "Ciclo Básico" (BASIC) · 2º CENS = "Ciclo Específico" (SPECIFIC).
 *          O site usa esta lista para nomear e ordenar as disciplinas.
 *
 * ✏️ EDITÁVEL: quando sair uma grade nova, atualize nomes, horas e a data
 *              em GRADE_FONTE. Depois rode `npm run content:realinhar`.
 * ⚠️ CUIDADO:  o nome da matéria aqui precisa ser IGUAL ao campo "subject"
 *              dos arquivos em content/ (o teste `npm test` confere).
 *              pratica: true = matéria só prática (sem banco de questões).
 * ════════════════════════════════════════════════════════════════════
 */
export const GRADE_FONTE = "Manual do Aluno ESSd/PMESP, 6ª ed. (dez/2019), Grade Curricular — verificado em 03/10/2026";

export type Materia = { nome: string; horas: number; area: string; pratica?: boolean };

export const GRADE: Record<"BASIC" | "SPECIFIC", Materia[]> = {
  // 1º Ciclo de Ensino (CENS) — 750 h-a
  BASIC: [
    { nome: "Direito Administrativo Disciplinar Militar", horas: 24, area: "Jurídicas" },
    { nome: "Direito Penal I", horas: 62, area: "Jurídicas" },
    { nome: "Direitos Humanos e Ações Afirmativas", horas: 48, area: "Jurídicas" },
    { nome: "Direito de Trânsito", horas: 44, area: "Jurídicas" },
    { nome: "Direito Processual Penal", horas: 30, area: "Jurídicas" },
    { nome: "Direito Constitucional", horas: 12, area: "Jurídicas" },
    { nome: "Procedimentos Operacionais Padrão I", horas: 88, area: "Técnicas Policiais" },
    { nome: "Tiro Defensivo na Preservação da Vida — Método Giraldi I", horas: 96, area: "Técnicas Policiais" },
    { nome: "Defesa Pessoal I", horas: 44, area: "Técnicas Policiais", pratica: true },
    { nome: "Direção Policial Preventiva de Viaturas I", horas: 24, area: "Policiais" },
    { nome: "Legislação Policial-Militar I", horas: 32, area: "Institucional" },
    { nome: "História da PMESP", horas: 16, area: "Institucional" },
    { nome: "Escrituração Profissional I", horas: 24, area: "Institucional" },
    { nome: "Comandos e Exercícios de Ordem Unida", horas: 24, area: "Institucional" },
    { nome: "Tecnologia da Informação e Comunicações", horas: 32, area: "Institucional" },
    { nome: "Comunicação e Expressão", horas: 32, area: "Humanas" },
    { nome: "Resgate I", horas: 32, area: "Técnicas de Bombeiros" },
    { nome: "Educação Física I", horas: 86, area: "Biológicas", pratica: true },
  ],
  // 2º Ciclo de Ensino (CENS) — 706 h-a
  SPECIFIC: [
    { nome: "Direito Penal II", horas: 68, area: "Jurídicas" },
    { nome: "Direito Penal Militar", horas: 32, area: "Jurídicas" },
    { nome: "Direito Administrativo", horas: 12, area: "Jurídicas" },
    { nome: "Direito Civil", horas: 12, area: "Jurídicas" },
    { nome: "Procedimentos Operacionais Padrão II", horas: 88, area: "Técnicas Policiais" },
    { nome: "Tiro Defensivo na Preservação da Vida — Método Giraldi II", horas: 96, area: "Técnicas Policiais" },
    { nome: "Menor Potencial Ofensivo", horas: 16, area: "Técnicas Policiais" },
    { nome: "Polícia de Choque", horas: 16, area: "Técnicas Policiais" },
    { nome: "Defesa Pessoal II", horas: 44, area: "Técnicas Policiais", pratica: true },
    { nome: "Doutrina de Polícia Ostensiva", horas: 32, area: "Policiais" },
    { nome: "Doutrina de Polícia Comunitária", horas: 16, area: "Policiais" },
    { nome: "Doutrina de Gerenciamento de Crises", horas: 16, area: "Policiais" },
    { nome: "Prevenção, Mediação e Resolução de Conflitos I", horas: 24, area: "Policiais" },
    { nome: "Direção Policial Preventiva de Viaturas II", horas: 24, area: "Policiais" },
    { nome: "Escrituração Profissional II", horas: 32, area: "Institucional" },
    { nome: "Inteligência Policial", horas: 16, area: "Institucional" },
    { nome: "Comunicação Social", horas: 18, area: "Institucional" },
    { nome: "Criminalística", horas: 16, area: "Humanas" },
    { nome: "Psicologia", horas: 16, area: "Humanas" },
    { nome: "Medicina Legal", horas: 16, area: "Biológicas" },
    { nome: "Incêndios", horas: 16, area: "Técnicas de Bombeiros" },
    { nome: "Educação Física II", horas: 80, area: "Biológicas", pratica: true },
  ],
};

/** Posição da matéria na grade (para ordenar as disciplinas no site). -1 = fora da grade. */
export function ordemNaGrade(ciclo: "BASIC" | "SPECIFIC", nome: string) {
  return GRADE[ciclo].findIndex((m) => m.nome === nome);
}
