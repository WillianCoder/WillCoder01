const test = require("node:test");
const assert = require("node:assert/strict");
const { carregarSite } = require("./carregar");

// objetos vindos do site são de outro "contexto" do Node: comparamos pelo conteúdo
const igual = (a, b, msg) => assert.equal(JSON.stringify(a), JSON.stringify(b), msg);

const site = carregarSite();
const PD = site.PEDIDO;
const LOJA = site.LOJA;
const PRODUTOS = site.PRODUTOS;

test("formata preço em reais", () => {
  assert.equal(PD.formatarPreco(0), "R$ 0,00");
  assert.equal(PD.formatarPreco(89.9), "R$ 89,90");
  assert.equal(PD.formatarPreco(1234.5), "R$ 1.234,50");
  assert.equal(PD.formatarPreco(1234567.891), "R$ 1.234.567,89");
});

test("normaliza acentos para a busca", () => {
  assert.equal(PD.normalizar("  Calçados Táticos "), "calcados taticos");
});

test("mesmo produto com mesmas variações soma a quantidade", () => {
  let c = [];
  c = PD.adicionarItem(c, { id: "a", variacoes: { Tamanho: "42", Cor: "Preto" }, qtd: 1 });
  c = PD.adicionarItem(c, { id: "a", variacoes: { Cor: "Preto", Tamanho: "42" }, qtd: 2 });
  c = PD.adicionarItem(c, { id: "a", variacoes: { Tamanho: "43", Cor: "Preto" }, qtd: 1 });
  assert.equal(c.length, 2);
  assert.equal(c[0].qtd, 3);
});

test("quantidade tem limite e zero remove o item", () => {
  let c = PD.adicionarItem([], { id: "a", variacoes: {}, qtd: 500 });
  assert.equal(c[0].qtd, PD.QTD_MAX);
  const chave = PD.chaveItem("a", {});
  igual(PD.alterarQuantidade(c, chave, 0), []);
  igual(PD.removerItem(c, chave), []);
});

test("carrinho ignora produto que saiu do catálogo e usa o preço atual", () => {
  const p = PRODUTOS[0];
  const linhas = PD.linhasDoCarrinho([{ id: p.id, variacoes: {}, qtd: 2 }, { id: "nao-existe", variacoes: {}, qtd: 1 }], PRODUTOS);
  assert.equal(linhas.length, 1);
  assert.equal(linhas[0].total, Math.round(p.preco * 2 * 100) / 100);
});

test("número do pedido segue o padrão PREFIXO-AAMMDD-NNNN", () => {
  assert.equal(PD.gerarNumero("AM011", new Date(2026, 9, 4), 0.0547), "AM011-261004-0547");
});

test("desconto Pix: tela e mensagem batem centavo a centavo", () => {
  const t = PD.calcularTotais(469.7, "Pix", 5);
  assert.equal(t.descontoPix, 23.49);
  assert.equal(t.total, 446.21);
  assert.equal(PD.calcularTotais(469.7, "Cartão de crédito", 5).total, 469.7);
});

const dadosValidos = () => ({
  itens: [{ id: "calca-tatica-ripstop", variacoes: { Tamanho: "42", Cor: "Caqui" }, qtd: 2 }],
  cliente: { nome: "Fulano de Tal", telefone: "(11) 98765-4321", email: "" },
  entrega: "envio",
  pagamento: "Pix",
  endereco: { cep: "01001-000", rua: "Praça da Sé", numero: "100", complemento: "", bairro: "Sé", cidade: "São Paulo", uf: "SP" },
  observacoes: "Entregar à tarde",
  numero: "AM011-261004-0001",
  data: new Date(2026, 9, 4, 14, 30)
});

test("validação aponta campos obrigatórios", () => {
  const e = PD.validarPedido({ itens: [], cliente: {}, endereco: {}, entrega: "envio" }, LOJA);
  for (const campo of ["nome", "telefone", "itens", "pagamento", "cep", "rua", "numero", "bairro", "cidade", "uf"]) {
    assert.ok(e[campo], `deveria acusar "${campo}"`);
  }
  igual(PD.validarPedido(dadosValidos(), LOJA), {});
});

test("retirada na loja não exige endereço", () => {
  const d = dadosValidos();
  d.entrega = "retirada";
  d.endereco = {};
  igual(PD.validarPedido(d, LOJA), {});
  assert.equal(PD.montarPedido(d, PRODUTOS, LOJA).endereco, null);
});

test("mensagem do WhatsApp traz itens, valores, cliente e endereço", () => {
  const pedido = PD.montarPedido(dadosValidos(), PRODUTOS, LOJA);
  const msg = PD.mensagemPedido(pedido, LOJA);
  assert.match(msg, /Pedido: \*AM011-261004-0001\*/);
  assert.match(msg, /Data: 04\/10\/2026 14:30/);
  assert.match(msg, /Calça Tática Rip-Stop/);
  assert.match(msg, /Tamanho: 42 \| Cor: Caqui/);
  assert.match(msg, /2 x R\$ 169,90 = R\$ 339,80/);
  assert.match(msg, /Total no Pix: \*R\$ 322,81\*/);
  assert.match(msg, /Praça da Sé, 100/);
  assert.match(msg, /CEP: 01001-000/);
  assert.match(msg, /OBSERVAÇÕES:\* Entregar à tarde/);
});

test("link do WhatsApp usa só os números e codifica o texto", () => {
  const url = PD.linkWhatsApp("+55 (11) 90000-0000", "Olá & tchau");
  assert.equal(url, "https://wa.me/5511900000000?text=Ol%C3%A1%20%26%20tchau");
  const fin = PD.FINALIZADORES.whatsapp(PD.montarPedido(dadosValidos(), PRODUTOS, LOJA), LOJA);
  assert.equal(fin.tipo, "redirecionar");
  assert.ok(fin.url.startsWith("https://wa.me/" + LOJA.contato.whatsapp + "?text="));
});
