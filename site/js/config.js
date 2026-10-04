/* =====================================================================
   ARTE MILITAR 011 — CONFIGURAÇÃO DA LOJA
   ---------------------------------------------------------------------
   Este é o arquivo que você mais vai editar. Tudo que é "dado da loja"
   (contatos, endereço, horários, textos, banners, categorias) fica aqui.

   Regras rápidas:
   - Textos ficam entre aspas: "assim".
   - Cada item termina com vírgula, exceto o último de uma lista.
   - Depois de salvar, recarregue a página (Ctrl+F5) para ver a mudança.
   Guia completo: ../../docs/GUIA-DE-EDICAO.md
   ===================================================================== */

window.LOJA = {
  nome: "Arte Militar 011",
  slogan: "Artigos militares, táticos e de aventura",
  descricao:
    "Coturnos, fardas, equipamentos táticos, mochilas e itens de camping. " +
    "Loja física em São Paulo e envio para todo o Brasil. Pedidos pelo WhatsApp.",

  /* ----------------------------- CONTATOS -----------------------------
     whatsapp: só números, com 55 (Brasil) + DDD + número. Ex.: 5511987654321
     ⚠️ TROQUE PELO SEU NÚMERO — é para ele que todos os pedidos vão. */
  contato: {
    whatsapp: "5511900000000",
    whatsappExibicao: "(11) 90000-0000",
    telefone: "1130000000",
    telefoneExibicao: "(11) 3000-0000",
    email: "contato@artemilitar011.com.br",
    instagram: "https://instagram.com/artemilitar011", // deixe "" para esconder
    facebook: "", // deixe "" para esconder
    tiktok: "" // deixe "" para esconder
  },

  /* ---------------------------- LOJA FÍSICA ---------------------------
     O mapa usa o texto de "enderecoMapa" (o mesmo que você digitaria no
     Google Maps). Coloque o endereço completo da loja. */
  lojaFisica: {
    endereco: "Rua Exemplo, 123 — Centro",
    cidade: "São Paulo — SP",
    cep: "01000-000",
    enderecoMapa: "Praça da Sé, São Paulo - SP",
    referencia: "Próximo ao metrô Sé",
    horarios: [
      { dias: "Segunda a sexta", horas: "09h às 18h" },
      { dias: "Sábado", horas: "09h às 14h" },
      { dias: "Domingo e feriados", horas: "Fechado" }
    ]
  },

  /* ------------------------------ PEDIDOS ----------------------------- */
  pedidos: {
    // Como o pedido é finalizado. Hoje: "whatsapp". Futuro: pagamento no site (docs/PAGAMENTOS-FUTURO.md)
    finalizacao: "whatsapp",
    // Prefixo do número do pedido enviado no WhatsApp (ex.: AM011-4821)
    prefixo: "AM011",
    // Formas de entrega que o cliente pode escolher no pedido
    entregas: [
      { id: "retirada", nome: "Retirar na loja física", detalhe: "Sem custo — avisamos quando estiver separado." },
      { id: "envio", nome: "Envio pelos Correios / transportadora", detalhe: "Frete calculado e informado pelo WhatsApp." },
      { id: "motoboy", nome: "Motoboy (Grande São Paulo)", detalhe: "Valor combinado pelo WhatsApp." }
    ],
    // Formas de pagamento que você aceita (apenas informativo — o pagamento é combinado no WhatsApp)
    pagamentos: ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro (na retirada)"],
    // Desconto mostrado como "à vista no Pix". Use 0 para esconder.
    descontoPix: 5,
    // Mensagem que aparece no topo do site (deixe "" para esconder)
    avisoTopo: "Enviamos para todo o Brasil • Retire grátis na loja física • Pedidos pelo WhatsApp"
  },

  /* ------------------------ BANNERS DA PÁGINA INICIAL -----------------
     imagem: caminho de uma foto (ex.: "img/banners/coturnos.webp").
     Deixe "" para usar a ilustração automática.
     link: para onde o botão leva. Ex.: "#/categoria/calcados" ou "#/ofertas" */
  banners: [
    {
      titulo: "Pronto para qualquer missão",
      texto: "Coturnos, fardas e equipamentos táticos com qualidade de quem entende do assunto.",
      botao: "Ver equipamentos",
      link: "#/categoria/equipamentos",
      imagem: "",
      ilustracao: { tipo: "colete", cor: "Multicam" }
    },
    {
      titulo: "Coturnos e botas táticas",
      texto: "Conforto, aderência e resistência para o serviço, o treino e a trilha.",
      botao: "Ver calçados",
      link: "#/categoria/calcados",
      imagem: "",
      ilustracao: { tipo: "coturno", cor: "Preto" }
    },
    {
      titulo: "Camping e sobrevivência",
      texto: "Facas, lanternas, cantis, redes e kits para quem vive a aventura.",
      botao: "Explorar",
      link: "#/categoria/camping",
      imagem: "",
      ilustracao: { tipo: "mochila", cor: "Verde Oliva" }
    }
  ],

  /* ----------------------------- CATEGORIAS ---------------------------
     id: usado no link e nos produtos (sem acento, sem espaço).
     Para criar uma categoria: copie um bloco inteiro { ... }, troque id,
     nome e subcategorias. Depois use esse id nos produtos. */
  categorias: [
    {
      id: "vestuario",
      nome: "Vestuário",
      icone: "camisa",
      descricao: "Gandolas, combat shirts, calças táticas, camisetas e agasalhos.",
      subcategorias: [
        { id: "gandolas", nome: "Gandolas e Combat Shirts" },
        { id: "calcas", nome: "Calças Táticas" },
        { id: "camisetas", nome: "Camisetas" },
        { id: "jaquetas", nome: "Jaquetas e Corta-vento" },
        { id: "bones", nome: "Bonés, Boinas e Chapéus" },
        { id: "balaclavas", nome: "Balaclavas e Bandanas" }
      ]
    },
    {
      id: "calcados",
      nome: "Calçados",
      icone: "coturno",
      descricao: "Coturnos, botas táticas e meias para longas jornadas.",
      subcategorias: [
        { id: "coturnos", nome: "Coturnos" },
        { id: "botas", nome: "Botas Táticas" },
        { id: "meias", nome: "Meias" }
      ]
    },
    {
      id: "equipamentos",
      nome: "Equipamentos Táticos",
      icone: "colete",
      descricao: "Coletes, cintos, coldres, modulares, luvas e proteção.",
      subcategorias: [
        { id: "coletes", nome: "Coletes e Plate Carriers" },
        { id: "cintos", nome: "Cintos e Suspensórios" },
        { id: "coldres", nome: "Coldres" },
        { id: "modulares", nome: "Porta-carregadores e Modulares" },
        { id: "luvas", nome: "Luvas" },
        { id: "protecao", nome: "Joelheiras e Proteção" }
      ]
    },
    {
      id: "mochilas",
      nome: "Mochilas e Bolsas",
      icone: "mochila",
      descricao: "Mochilas de assalto, bornais, pochetes e bolsas de transporte.",
      subcategorias: [
        { id: "mochilas", nome: "Mochilas" },
        { id: "bornais", nome: "Bornais e Pochetes" },
        { id: "bolsas", nome: "Bolsas e Sacos" }
      ]
    },
    {
      id: "camping",
      nome: "Camping e Sobrevivência",
      icone: "lanterna",
      descricao: "Facas, lanternas, cantis, redes, navegação e kits de sobrevivência.",
      subcategorias: [
        { id: "facas", nome: "Facas e Canivetes" },
        { id: "lanternas", nome: "Lanternas" },
        { id: "hidratacao", nome: "Cantis e Hidratação" },
        { id: "abrigo", nome: "Redes e Abrigos" },
        { id: "navegacao", nome: "Bússolas e Binóculos" },
        { id: "sobrevivencia", nome: "Kits de Sobrevivência" }
      ]
    },
    {
      id: "acessorios",
      nome: "Acessórios e Insígnias",
      icone: "patch",
      descricao: "Patches, dog tags, óculos de proteção, canecas e presentes.",
      subcategorias: [
        { id: "patches", nome: "Patches e Bordados" },
        { id: "dogtags", nome: "Dog Tags" },
        { id: "oculos", nome: "Óculos e Proteção" },
        { id: "presentes", nome: "Canecas e Presentes" }
      ]
    }
  ],

  /* ------------------------------- CORES -------------------------------
     Cores usadas nas ilustrações dos produtos e nas bolinhas de cor.
     Se criar uma cor nova num produto, adicione aqui (nome: "#código"). */
  cores: {
    "Preto": "#1d1f1b",
    "Verde Oliva": "#556b2f",
    "Coyote": "#9c7c52",
    "Caqui": "#b9a074",
    "Cinza": "#5e6366",
    "Azul Marinho": "#1f2c45",
    "Areia": "#cdb68a",
    "Multicam": "camo-multicam",
    "Camuflado Verde": "camo-verde",
    "Camuflado Urbano": "camo-urbano",
    "Prata": "#a9adb0",
    "Vermelho": "#8e2a23"
  },

  /* ----------------------- PÁGINAS INSTITUCIONAIS --------------------- */
  sobre:
    "A Arte Militar 011 nasceu em São Paulo para atender militares, policiais, " +
    "vigilantes, praticantes de airsoft, colecionadores e aventureiros. Trabalhamos " +
    "com artigos selecionados, atendimento direto e preço justo — na loja física ou " +
    "com envio para todo o Brasil.",
  politicaTrocas: [
    "Trocas em até 7 dias após o recebimento, com o produto sem uso e na embalagem original.",
    "Produto com defeito de fabricação: troca garantida dentro do prazo de garantia do fabricante.",
    "Para pedir troca, chame no WhatsApp com o número do pedido e fotos do produto.",
    "Compras feitas à distância podem ser devolvidas em até 7 dias (art. 49 do Código de Defesa do Consumidor)."
  ],
  privacidade:
    "Os dados preenchidos no pedido (nome, telefone e endereço) são enviados apenas para o " +
    "nosso WhatsApp, para separar e entregar a sua compra. O site não armazena seus dados em " +
    "servidores: o carrinho e o histórico ficam somente no seu navegador.",

  // Endereço público do site (usado no compartilhamento e no Google). Troque quando tiver domínio próprio.
  urlSite: "https://williancoder.github.io/arte-militar-011/"
};
