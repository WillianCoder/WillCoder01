// Confere se config.js e produtos.js estão corretos. Rode: node --test tests/
// Se você editar um produto e algo estiver errado, este teste diz exatamente o quê.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { carregarSite, PASTA_SITE } = require("./carregar");

const site = carregarSite();
const LOJA = site.LOJA;
const PRODUTOS = site.PRODUTOS;
const SELOS = ["destaque", "lancamento", "oferta", "mais-vendido"];

test("config.js tem os contatos preenchidos", () => {
  assert.match(LOJA.contato.whatsapp, /^55\d{10,11}$/, "whatsapp deve ter só números: 55 + DDD + número");
  assert.match(LOJA.contato.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "e-mail inválido");
  assert.ok(LOJA.lojaFisica.enderecoMapa, "preencha lojaFisica.enderecoMapa");
  assert.ok(LOJA.pedidos.entregas.length, "cadastre ao menos uma forma de entrega");
  assert.ok(LOJA.pedidos.pagamentos.length, "cadastre ao menos uma forma de pagamento");
});

test("categorias têm id único e sem acento/espaço", () => {
  const ids = LOJA.categorias.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "id de categoria repetido");
  for (const c of LOJA.categorias) {
    assert.match(c.id, /^[a-z0-9-]+$/, `id de categoria inválido: "${c.id}"`);
    const subs = (c.subcategorias || []).map((s) => s.id);
    assert.equal(new Set(subs).size, subs.length, `subcategoria repetida em "${c.id}"`);
  }
});

test("banners apontam para ilustrações ou imagens válidas", () => {
  for (const b of LOJA.banners) {
    assert.ok(b.titulo && b.link, "banner sem título ou link");
    if (!b.imagem) assert.ok(site.ILUSTRACOES.tipos.includes(b.ilustracao.tipo), `banner com ilustração inexistente: ${b.ilustracao.tipo}`);
    else assert.ok(fs.existsSync(path.join(PASTA_SITE, b.imagem)), `imagem de banner não encontrada: ${b.imagem}`);
  }
});

test("produtos têm id único", () => {
  const ids = PRODUTOS.map((p) => p.id);
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.equal(repetidos.join(", "), "", "ids repetidos");
});

for (const p of PRODUTOS) {
  test(`produto "${p.id}"`, () => {
    assert.match(p.id, /^[a-z0-9-]+$/, "id deve ter só letras minúsculas sem acento, números e hífen");
    assert.ok(p.nome && p.nome.trim(), "sem nome");
    const cat = LOJA.categorias.find((c) => c.id === p.categoria);
    assert.ok(cat, `categoria "${p.categoria}" não existe no config.js`);
    assert.ok((cat.subcategorias || []).some((s) => s.id === p.subcategoria), `subcategoria "${p.subcategoria}" não existe em "${p.categoria}"`);
    assert.equal(typeof p.preco, "number", "preço deve ser número com ponto (ex.: 89.9), sem aspas");
    assert.ok(p.preco > 0, "preço deve ser maior que zero");
    if (p.precoAntigo) assert.ok(p.precoAntigo > p.preco, "precoAntigo deve ser maior que o preço (ou 0)");
    assert.ok(site.ILUSTRACOES.tipos.includes(p.ilustracao.tipo), `ilustracao.tipo "${p.ilustracao.tipo}" não existe`);
    for (const cor of [p.ilustracao.cor, ...((p.variacoes || {}).Cor || [])]) {
      assert.ok(LOJA.cores[cor], `cor "${cor}" não está cadastrada em LOJA.cores (config.js)`);
    }
    for (const [nome, opcoes] of Object.entries(p.variacoes || {})) {
      assert.ok(Array.isArray(opcoes) && opcoes.length, `variação "${nome}" sem opções`);
    }
    for (const selo of p.selos || []) assert.ok(SELOS.includes(selo), `selo desconhecido "${selo}" (use ${SELOS.join(", ")})`);
    for (const img of p.imagens || []) {
      if (!/^https?:/.test(img)) assert.ok(fs.existsSync(path.join(PASTA_SITE, img)), `foto não encontrada: site/${img}`);
    }
  });
}
