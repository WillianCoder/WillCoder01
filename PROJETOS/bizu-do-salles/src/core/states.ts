/** Conteúdo nacional (stateCode nulo) aparece para todos; conteúdo estadual só para alunos daquela UF. */
export function visibleForState(contentState: string | null | undefined, userState: string | null | undefined) {
  return !contentState || contentState === userState;
}

/** Filtro Prisma equivalente, para usar nas consultas de questões/materiais. */
export function stateWhere(userState: string | null | undefined) {
  return { OR: [{ stateCode: null }, ...(userState ? [{ stateCode: userState }] : [])] };
}

export const UFS: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
  ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};
