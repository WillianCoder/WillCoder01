/**
 * ════════════════════════════════════════════════════════════════════
 * ⚙️ REGRAS DO SISTEMA — números que controlam o comportamento
 * ════════════════════════════════════════════════════════════════════
 * O QUE É: prazos, limites de segurança e critérios do Raio-X, reunidos
 *          aqui para você ajustar sem procurar pelo código.
 *
 * ✏️ EDITÁVEL: troque apenas os NÚMEROS.
 * ⚠️ CUIDADO:  valores muito altos nos limites de tentativa enfraquecem a
 *              proteção contra robôs. Depois de editar: `npm test`.
 * ════════════════════════════════════════════════════════════════════
 */

export const REGRAS = {
  senha: {
    // ✏️ EDITÁVEL: por quantos minutos o link de "esqueci minha senha" vale
    linkMinutos: 60,
  },

  sessao: {
    // ✏️ EDITÁVEL: por quantos dias o aluno fica logado sem precisar entrar de novo
    diasValidade: 30,
  },

  // ✏️ EDITÁVEL: limites de tentativas (proteção contra robôs e abuso)
  // formato: { max: quantas vezes, minutos: em quanto tempo }
  limites: {
    loginPorConta: { max: 8, minutos: 15 },
    loginPorIP: { max: 20, minutos: 15 },
    cadastroPorIP: { max: 5, minutos: 60 },
    respostasPorAluno: { max: 120, minutos: 1 },
    relatosPorAluno: { max: 10, minutos: 60 },
    recuperacaoPorIP: { max: 5, minutos: 60 },
    recuperacaoPorEmail: { max: 3, minutos: 60 },
  },

  raioX: {
    // ✏️ EDITÁVEL: mínimo de respostas numa disciplina para o Raio-X opinar
    minimoRespostas: 5,
    // ✏️ EDITÁVEL: abaixo deste % = "ponto a melhorar"
    fracoAbaixoDe: 60,
    // ✏️ EDITÁVEL: a partir deste % = "ponto forte"
    forteAPartirDe: 80,
  },

  simulado: {
    // ✏️ EDITÁVEL: quantidade mínima e máxima de questões por simulado
    minQuestoes: 5,
    maxQuestoes: 60,
    // ✏️ EDITÁVEL: questões do "simulado rápido"
    rapidoQuestoes: 10,
    // ✏️ EDITÁVEL: tempo máximo que o aluno pode escolher (minutos)
    maxMinutos: 240,
    // ✏️ EDITÁVEL: tolerância (segundos) após o fim do tempo para aceitar o envio automático
    toleranciaSegundos: 60,
  },

  ranking: {
    // ✏️ EDITÁVEL: quantas posições o ranking mostra
    tamanho: 50,
  },

  cadernos: {
    // ✏️ EDITÁVEL: máximo de cadernos por aluno e de questões por caderno
    maxPorAluno: 30,
    maxQuestoes: 500,
  },

  conteudo: {
    // ✏️ EDITÁVEL: quantas questões de cada arquivo novo viram amostra grátis ao carregar (seed)
    gratisPorArquivo: 3,
  },
};

/** Converte um limite { max, minutos } para os parâmetros do rateLimit. */
export const janela = (l: { max: number; minutos: number }) => [l.max, l.minutos * 60_000] as const;
