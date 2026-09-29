/**
 * ════════════════════════════════════════════════════════════════════
 * 📄 TEXTOS DO SITE — Bizu do Salles
 * ════════════════════════════════════════════════════════════════════
 * O QUE É: todos os textos da página inicial, do rodapé e das perguntas
 *          frequentes (Ajuda) ficam aqui, em um só lugar.
 *
 * ✏️ EDITÁVEL: pode trocar qualquer texto ENTRE ASPAS "assim".
 * ⚠️ CUIDADO:  não apague as aspas, as vírgulas no fim das linhas nem os
 *              colchetes [ ]. Depois de editar, rode `npm test` e `npm run build`.
 *
 * Preços e planos NÃO ficam aqui: mude no painel (Admin → Planos e preços).
 * Cores ficam em src/app/globals.css.
 * ════════════════════════════════════════════════════════════════════
 */

export const SITE = {
  // ✏️ EDITÁVEL: nome e descrição que aparecem na aba do navegador e no Google
  nome: "Bizu do Salles",
  descricao: "Estude por questões para o Ciclo Básico e o Ciclo Específico da formação policial militar.",

  // ✏️ EDITÁVEL: topo da página inicial
  selo: "Formação policial militar · foco em São Paulo",
  titulo: "Estude por questões e saiba exatamente onde está errando.",
  // {total} é trocado automaticamente pelo número de questões publicadas
  subtitulo:
    "Questões comentadas com a lei de base, simulados e um raio-x do seu desempenho, organizados em Ciclo Básico e Ciclo Específico. Hoje são {total} questões originais, e o banco cresce toda semana.",
  botoes: { comecar: "Começar a estudar", planos: "Conhecer planos", gratis: "Experimentar grátis" },

  // ✏️ EDITÁVEL: os 4 cartões de recursos da página inicial (ícone, título, texto)
  recursos: [
    { icone: "❓", titulo: "Questões comentadas", texto: "Gabarito, explicação e o artigo da lei em cada questão." },
    { icone: "📊", titulo: "Raio-X do aluno", texto: "Pontos fortes, pontos a melhorar e o que revisar primeiro." },
    { icone: "⭐", titulo: "Favoritas e revisão", texto: "Marque questões e volte nelas quando quiser." },
    { icone: "📱", titulo: "Celular e computador", texto: "Funciona no navegador e pode ser instalado na tela inicial." },
  ],

  // ✏️ EDITÁVEL: perguntas frequentes da página Ajuda (/ajuda) — [pergunta, resposta]
  faq: [
    ["Por que fui desconectado?", "Sua conta só fica ativa em um aparelho por vez. Quando alguém entra em outro aparelho, o anterior é desconectado. Se não foi você, troque a senha."],
    ["Paguei. Quando libera?", "Assim que o pagamento é confirmado. Se demorar, fale com o suporte informando o e-mail da conta."],
    ["As questões são de provas oficiais?", "Não. São questões originais do Bizu do Salles, escritas a partir da lei, com o artigo de referência em cada uma."],
    ["Achei um erro em uma questão.", "Use o botão “Encontrou um problema?” embaixo da questão. A equipe revisa todos os relatos."],
    ["Como instalo no celular?", "Abra o site no navegador do celular e use “Adicionar à tela inicial”."],
  ] as [string, string][],
};
