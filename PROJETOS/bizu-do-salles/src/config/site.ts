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

  // ✏️ EDITÁVEL: cartões de recursos da página inicial (ícone, título, texto)
  recursos: [
    { icone: "❓", titulo: "Questões comentadas", texto: "Gabarito, explicação e o artigo da lei em cada questão." },
    { icone: "🧠", titulo: "Simulado inteligente", texto: "Diga se tem 10, 30 ou 60 minutos: o simulado vem com seus erros e suas matérias mais fracas." },
    { icone: "🧭", titulo: "Por que errei?", texto: "Depois de cada erro: o que revisar, seu aproveitamento na matéria e um treino de 5 questões." },
    { icone: "📏", titulo: "Nota como no curso", texto: "Nota de 0 a 10 nos simulados, lida pelas regras de avaliação da escola (7,0 e 5,0)." },
    { icone: "📊", titulo: "Raio-X do aluno", texto: "Pontos fortes, pontos a melhorar e o que revisar primeiro." },
    { icone: "🎖️", titulo: "Patentes e conquistas", texto: "Ganhe XP a cada questão, suba de Recruta a Coronel e mantenha a sequência de estudo." },
    { icone: "📖", titulo: "Resumos por matéria", texto: "Resumos originais organizados pela grade do curso, para revisar antes da prova." },
    { icone: "📱", titulo: "Celular e computador", texto: "Funciona no navegador e pode ser instalado na tela inicial do celular." },
  ],

  // ✏️ EDITÁVEL: "Como funciona" (3 passos da página inicial)
  passos: [
    { titulo: "Crie sua conta grátis", texto: "Sem cartão. Você já testa as questões grátis de cada matéria." },
    { titulo: "Escolha o ciclo", texto: "Básico, Específico ou o curso completo, no Pix ou cartão pelo Mercado Pago." },
    { titulo: "Estude pelo seu ritmo", texto: "Questões, simulados com nota e o Raio-X mostrando o que revisar." },
  ],

  // ✏️ EDITÁVEL: perguntas frequentes da PÁGINA INICIAL — [pergunta, resposta]
  faqVenda: [
    ["Serve para qual curso?", "Para o Curso de Formação de Soldados (CFSd) da PM de São Paulo. As matérias seguem a grade oficial do curso (1º e 2º ciclo)."],
    ["As questões são de provas oficiais?", "Não. São questões originais do Bizu do Salles, escritas a partir da lei e da doutrina, com o artigo de referência em cada uma."],
    ["Como pago? Libera na hora?", "Pix ou cartão pelo Mercado Pago. O acesso libera assim que o pagamento é confirmado (no Pix, em geral em segundos)."],
    ["E se eu não gostar?", "Você tem 7 dias de direito de arrependimento a partir da compra (CDC, art. 49)."],
    ["Posso usar no celular?", "Sim. Abra o site no navegador e use “Adicionar à tela inicial” para ter um ícone como de aplicativo."],
  ] as [string, string][],

  // ✏️ EDITÁVEL: perguntas frequentes da página Ajuda (/ajuda) — [pergunta, resposta]
  faq: [
    ["Por que fui desconectado?", "Sua conta só fica ativa em um aparelho por vez. Quando alguém entra em outro aparelho, o anterior é desconectado. Se não foi você, troque a senha."],
    ["Paguei. Quando libera?", "Assim que o pagamento é confirmado. Se demorar, fale com o suporte informando o e-mail da conta."],
    ["As questões são de provas oficiais?", "Não. São questões originais do Bizu do Salles, escritas a partir da lei, com o artigo de referência em cada uma."],
    ["Achei um erro em uma questão.", "Use o botão “Encontrou um problema?” embaixo da questão. A equipe revisa todos os relatos."],
    ["Como instalo no celular?", "Abra o site no navegador do celular e use “Adicionar à tela inicial”."],
  ] as [string, string][],
};
