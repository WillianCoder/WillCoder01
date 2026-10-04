#!/usr/bin/env node
/* =====================================================================
   AJUDANTE DE FOTOS — liga as fotos da pasta site/img/produtos/ aos produtos
   ---------------------------------------------------------------------
   1) Salve as fotos em site/img/produtos/ com o CÓDIGO do produto no nome:
        CAL-001.jpg        → 1ª foto (capa) do produto CAL-001
        CAL-001-2.jpg      → 2ª foto
        CAL-001-3.webp     → 3ª foto ...
      (o nome também pode começar pelo id do produto, ex.: coturno-tatico-cano-alto-2.jpg)
   2) Rode, na pasta do projeto:
        node ferramentas/fotos.js --vincular   → preenche "imagens" em produtos.js
        node ferramentas/fotos.js              → só mostra o que tem e o que falta
   Sempre atualiza a lista de conferência docs/FOTOS.md.
   ===================================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const SERIALIZAR = require("../site/js/serializar.js");

const RAIZ = path.join(__dirname, "..");
const SITE = path.join(RAIZ, "site");
const PASTA_FOTOS = path.join(SITE, "img", "produtos");
const ARQ_PRODUTOS = path.join(SITE, "js", "produtos.js");
const EXTENSOES = /\.(jpe?g|png|webp|avif)$/i;

function carregarProdutos() {
  const ctx = {};
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(SITE, "js", "config.js"), "utf8"), ctx);
  vm.runInContext(fs.readFileSync(ARQ_PRODUTOS, "utf8"), ctx);
  return { produtos: ctx.PRODUTOS, loja: ctx.LOJA };
}

/* "CAL-001-2.jpg" → ordem 2; "CAL-001.jpg" → ordem 1 */
function ordemDaFoto(nome, prefixo) {
  const resto = nome.slice(prefixo.length).replace(EXTENSOES, "");
  if (resto === "") return 1;
  const m = resto.match(/^[-_ ](\d+)$/);
  return m ? Number(m[1]) : null;
}

function fotosDoProduto(p, arquivos) {
  const prefixos = [p.codigo, p.id].filter(Boolean).map((x) => x.toLowerCase());
  return arquivos
    .map((arq) => {
      const nome = arq.toLowerCase();
      for (const pre of prefixos) {
        if (nome.startsWith(pre)) {
          const ordem = ordemDaFoto(nome, pre);
          if (ordem !== null) return { arq, ordem };
        }
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.ordem - b.ordem || a.arq.localeCompare(b.arq))
    .map((f) => "img/produtos/" + f.arq);
}

function main() {
  const vincular = process.argv.includes("--vincular");
  const { produtos, loja } = carregarProdutos();
  const arquivos = fs.existsSync(PASTA_FOTOS) ? fs.readdirSync(PASTA_FOTOS).filter((a) => EXTENSOES.test(a)) : [];
  const usados = new Set();
  let alterados = 0;

  for (const p of produtos) {
    const novas = fotosDoProduto(p, arquivos);
    novas.forEach((n) => usados.add(n.replace("img/produtos/", "")));
    if (!vincular || !novas.length) continue;
    // mantém fotos já cadastradas à mão (outras pastas ou links) e acrescenta as novas
    const extras = (p.imagens || []).filter((i) => !novas.includes(i) && (/^https?:/.test(i) || fs.existsSync(path.join(SITE, i))) && !i.startsWith("img/produtos/"));
    const final = [...novas, ...extras];
    if (JSON.stringify(final) !== JSON.stringify(p.imagens || [])) {
      p.imagens = final;
      alterados++;
      console.log(`OK    ${p.codigo}  ${p.nome}: ${final.length} foto(s)`);
    }
  }
  if (vincular && alterados) fs.writeFileSync(ARQ_PRODUTOS, SERIALIZAR.gerarProdutosJs(produtos));

  const sobras = arquivos.filter((a) => !usados.has(a));
  sobras.forEach((a) => console.log(`AVISO ${a}: o nome não começa com o código de nenhum produto (ex.: CAL-001.jpg)`));

  // lista de conferência
  const cat = Object.fromEntries(loja.categorias.map((c) => [c.id, c.nome]));
  const com = produtos.filter((p) => (p.imagens || []).length).length;
  let md = "# Fotos dos produtos — lista de conferência\n\n";
  md += "Gerada por `node ferramentas/fotos.js` — não edite à mão.\n\n";
  md += `**${com} de ${produtos.length}** produtos com foto real. Nomeie cada foto com o código (ex.: \`CAL-001.jpg\`, \`CAL-001-2.jpg\`), coloque em \`site/img/produtos/\` e rode \`node ferramentas/fotos.js --vincular\`.\n\n`;
  md += "| Código | Produto | Categoria | Fotos | Nome do arquivo |\n|---|---|---|:-:|---|\n";
  for (const p of produtos) {
    const n = (p.imagens || []).length;
    md += `| ${p.codigo} | ${p.nome} | ${cat[p.categoria] || p.categoria} | ${n ? "✅ " + n : "—"} | \`${p.codigo}.jpg\` |\n`;
  }
  fs.writeFileSync(path.join(RAIZ, "docs", "FOTOS.md"), md);

  console.log(`\n${com} de ${produtos.length} produtos com foto. ${vincular ? alterados + " produto(s) atualizado(s)." : "Use --vincular para gravar."} Lista: docs/FOTOS.md`);
}

main();
