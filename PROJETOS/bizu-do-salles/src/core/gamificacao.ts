/**
 * 📄 O QUE É: XP, PATENTES (níveis) E CONQUISTAS do aluno — tudo calculado a partir das
 *             respostas e simulados que já existem no banco (nada novo é gravado).
 * ✏️ EDITÁVEL: pontos de XP (XP), nomes/limites das patentes (PATENTES) e a lista CONQUISTAS.
 * ⚠️ CUIDADO: coberto por testes (npm test). As patentes são só uma brincadeira motivacional
 *             do site; não representam a hierarquia real nem promoção na PMESP.
 */

/** ✏️ EDITÁVEL: quanto vale cada ação. */
export const XP = { porResposta: 2, porAcerto: 10, porSimulado: 30 };

/** ✏️ EDITÁVEL: patentes em ordem crescente e o XP mínimo de cada uma. */
export const PATENTES = [
  { nome: "Recruta", xp: 0 },
  { nome: "Aluno-Soldado", xp: 200 },
  { nome: "Soldado", xp: 600 },
  { nome: "Cabo", xp: 1_500 },
  { nome: "3º Sargento", xp: 3_000 },
  { nome: "2º Sargento", xp: 5_000 },
  { nome: "1º Sargento", xp: 8_000 },
  { nome: "Subtenente", xp: 12_000 },
  { nome: "Aspirante", xp: 17_000 },
  { nome: "2º Tenente", xp: 23_000 },
  { nome: "1º Tenente", xp: 30_000 },
  { nome: "Capitão", xp: 40_000 },
  { nome: "Major", xp: 52_000 },
  { nome: "Tenente-Coronel", xp: 66_000 },
  { nome: "Coronel", xp: 85_000 },
] as const;

/** Tudo o que as conquistas olham. */
export interface Progresso {
  respondidas: number;
  acertos: number;
  simulados: number; // simulados concluídos
  simuladosInteligentes: number; // simulados inteligentes concluídos
  melhorNotaSimulado: number; // 0–10, só simulados com 10+ questões
  sequenciaRecorde: number; // maior número de dias seguidos estudando
  materias: { answered: number; rate: number }[]; // desempenho por matéria
}

export function calcularXP(p: Pick<Progresso, "respondidas" | "acertos" | "simulados">) {
  return p.respondidas * XP.porResposta + p.acertos * XP.porAcerto + p.simulados * XP.porSimulado;
}

/** Patente atual, a próxima e quanto falta (pct = progresso até a próxima, 0–100). */
export function patente(xp: number) {
  let i = 0;
  while (i + 1 < PATENTES.length && xp >= PATENTES[i + 1].xp) i++;
  const atual = PATENTES[i];
  const proxima = PATENTES[i + 1] ?? null;
  const pct = proxima ? Math.floor(((xp - atual.xp) / (proxima.xp - atual.xp)) * 100) : 100;
  return { nivel: i + 1, nome: atual.nome, proxima: proxima?.nome ?? null, faltam: proxima ? proxima.xp - xp : 0, pct };
}

/** ✏️ EDITÁVEL: conquistas (ícone, nome, como ganhar e a regra). */
export const CONQUISTAS: { id: string; icone: string; nome: string; como: string; ok: (p: Progresso) => boolean }[] = [
  { id: "primeira", icone: "🎯", nome: "Primeiro tiro", como: "Responder a primeira questão", ok: (p) => p.respondidas >= 1 },
  { id: "q50", icone: "📚", nome: "Pegando o ritmo", como: "Responder 50 questões", ok: (p) => p.respondidas >= 50 },
  { id: "q200", icone: "💪", nome: "Treino pesado", como: "Responder 200 questões", ok: (p) => p.respondidas >= 200 },
  { id: "q1000", icone: "🏆", nome: "Mil questões", como: "Responder 1.000 questões", ok: (p) => p.respondidas >= 1000 },
  { id: "seq3", icone: "🔥", nome: "Constância", como: "Estudar 3 dias seguidos", ok: (p) => p.sequenciaRecorde >= 3 },
  { id: "seq7", icone: "📅", nome: "Semana completa", como: "Estudar 7 dias seguidos", ok: (p) => p.sequenciaRecorde >= 7 },
  { id: "seq30", icone: "🗓️", nome: "Disciplina de ferro", como: "Estudar 30 dias seguidos", ok: (p) => p.sequenciaRecorde >= 30 },
  { id: "sim1", icone: "📝", nome: "Primeira verificação", como: "Concluir um simulado", ok: (p) => p.simulados >= 1 },
  { id: "intel", icone: "🧠", nome: "Estratégico", como: "Concluir um simulado inteligente", ok: (p) => p.simuladosInteligentes >= 1 },
  { id: "nota7", icone: "🎖️", nome: "Aprovado direto", como: "Tirar 7,0+ num simulado de 10+ questões", ok: (p) => p.melhorNotaSimulado >= 7 },
  { id: "nota9", icone: "🥇", nome: "Destaque da turma", como: "Tirar 9,0+ num simulado de 10+ questões", ok: (p) => p.melhorNotaSimulado >= 9 },
  { id: "dominio", icone: "⭐", nome: "Domínio", como: "80%+ numa matéria (mín. 20 respostas)", ok: (p) => p.materias.some((m) => m.answered >= 20 && m.rate >= 80) },
];

export function conquistas(p: Progresso) {
  return CONQUISTAS.map(({ ok, ...c }) => ({ ...c, ganhou: ok(p) }));
}

/** Maior sequência de dias seguidos a partir de datas "AAAA-MM-DD" (qualquer ordem, com repetição). */
export function maiorSequencia(dias: Iterable<string>) {
  const ordenados = [...new Set(dias)].map((d) => Date.parse(`${d}T00:00:00Z`)).filter((t) => !Number.isNaN(t)).sort((a, b) => a - b);
  let melhor = 0;
  let atual = 0;
  for (let i = 0; i < ordenados.length; i++) {
    atual = i > 0 && ordenados[i] - ordenados[i - 1] === 86_400_000 ? atual + 1 : 1;
    melhor = Math.max(melhor, atual);
  }
  return melhor;
}
