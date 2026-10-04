# Produtos — cadastrar, editar e colocar fotos

Todos os produtos ficam em [`site/js/produtos.js`](../site/js/produtos.js), um bloco `{ ... }` por produto. Os 51 produtos que vieram são **exemplos realistas** (nomes, preços de mercado e descrições) para você ajustar ao seu estoque.

## Modelo completo (copie e cole)
```js
{
  id: "coturno-tatico-cano-alto",          // único, minúsculas, sem acento, hífens no lugar de espaço
  codigo: "CAL-001",                       // código curto: aparece no pedido do WhatsApp e no nome das fotos
  nome: "Coturno Tático Cano Alto",
  categoria: "calcados",                   // id de uma categoria do config.js
  subcategoria: "coturnos",                // id de uma subcategoria dessa categoria
  preco: 289.9,                            // ponto no lugar da vírgula, sem aspas
  precoAntigo: 349.9,                      // preço "de" (riscado). 0 = sem promoção
  imagens: ["img/produtos/coturno-tatico-1.jpg", "img/produtos/coturno-tatico-2.jpg"],
  ilustracao: { tipo: "coturno", cor: "Preto" }, // desenho usado se não houver foto
  resumo: "Couro e nylon, solado antiderrapante e palmilha anatômica.",
  descricao: "Texto completo que aparece na página do produto.",
  destaques: ["Solado antiderrapante", "Palmilha anatômica removível"],
  especificacoes: { "Material": "Couro + nylon 1000D", "Garantia": "90 dias" },
  variacoes: { "Tamanho": ["39", "40", "41", "42"], "Cor": ["Preto", "Coyote"] },
  disponivel: true,                        // false = aparece como "Esgotado"
  selos: ["destaque", "oferta"],           // veja a tabela abaixo
  marca: ""                                // opcional
},
```
Depois de colar, confira a **vírgula** depois do `}`.

## Tarefas do dia a dia
| Quero… | Faça |
|---|---|
| Mudar preço | troque `preco` |
| Colocar em promoção | `precoAntigo` = preço antigo (maior que `preco`). O selo "-17%" é calculado sozinho e o produto entra em **Ofertas** |
| Tirar da promoção | `precoAntigo: 0` |
| Marcar como esgotado | `disponivel: false` (continua aparecendo, mas o botão vira "Avise-me quando chegar") |
| Esconder do site | apague o bloco inteiro do produto (ou recorte e guarde num bloco de notas) |
| Mostrar na vitrine da home | coloque `"destaque"` em `selos` |
| Tirar um tamanho que acabou | apague o tamanho da lista em `variacoes` |
| Mudar a ordem nas páginas | a ordem padrão ("Relevância") prioriza disponíveis + destaques + mais vendidos; o cliente pode ordenar por preço |

## Selos
| Selo | Efeito |
|---|---|
| `"destaque"` | aparece em **Destaques da semana** na página inicial |
| `"lancamento"` | selo verde **Novo** + página **Lançamentos** |
| `"mais-vendido"` | selo **Mais vendido** + página **Mais vendidos** |
| `"oferta"` | entra em **Ofertas** (mesmo sem `precoAntigo`) |

## Variações (tamanho, cor, lado, tipo...)
- Pode criar **qualquer** variação: `"Lado": ["Destro", "Canhoto"]`, `"Tipo": ["A+", "O-"]`, `"Versão": ["Colorida", "Subdued"]`.
- O cliente **precisa escolher** todas antes de adicionar ao pedido. Variação com uma opção só já vem escolhida.
- A variação chamada **`Cor`** é especial: mostra bolinhas coloridas e muda a cor da ilustração. Cada cor precisa estar cadastrada em `cores` no `config.js` ([como](GUIA-DE-EDICAO.md#6-cores-das-variações)).
- Sem variações: `variacoes: {}`.

## Códigos dos produtos
Cada produto tem um `codigo` curto, por categoria: `VES` vestuário, `CAL` calçados, `EQP` equipamentos, `MOC` mochilas, `CAM` camping, `ACS` acessórios + número (`CAL-001`, `CAL-002`...). Ele aparece **em cada item da mensagem do WhatsApp**, para você achar o produto no estoque na hora, e é usado no **nome das fotos**. Produto novo: use o próximo número livre da categoria (os testes avisam se repetir). A lista completa com todos os códigos está em [FOTOS.md](FOTOS.md).

## Fotos
**Jeito mais fácil:** mande as fotos na conversa com o Claude dizendo de qual produto é cada uma (ou com o código no nome). Ele identifica o produto, comprime, renomeia, coloca no lugar certo e confere se ficou tudo certo.

**Fazendo você mesmo (com o ajudante):**
1. Nomeie cada foto com o **código** do produto: `CAL-001.jpg` (capa), `CAL-001-2.jpg`, `CAL-001-3.jpg`...
2. Coloque em `site/img/produtos/`.
3. Na pasta do projeto, rode `node ferramentas/fotos.js --vincular` — ele preenche o campo `imagens` de cada produto sozinho e atualiza a [lista de conferência](FOTOS.md). Foto com nome que não bate com nenhum código gera um aviso.

**Fazendo à mão:**
Enquanto um produto não tem foto, o site mostra uma **ilustração** (desenho) do tipo do produto, que muda de cor conforme a variação. Para usar fotos reais:

1. **Prepare a foto**
   - Formato **quadrado** (ex.: 1000×1000 px), produto centralizado, fundo branco ou neutro.
   - Comprima antes de subir: [squoosh.app](https://squoosh.app) → formato **WebP** ou **JPG** qualidade ~75. Meta: **até 150 KB** por foto (site rápido no 4G).
   - Nome sem acento e sem espaço: `coturno-tatico-preto-1.webp`.
2. **Envie para** `site/img/produtos/` (no GitHub: abra a pasta → **Add file → Upload files**).
3. **No produto**, liste as fotos (a primeira é a capa):
   ```js
   imagens: ["img/produtos/coturno-tatico-preto-1.webp", "img/produtos/coturno-tatico-preto-2.webp"],
   ```
4. Com 2 fotos ou mais aparecem miniaturas clicáveis na página do produto.

> Se o nome do arquivo estiver errado, o site **não quebra**: mostra a ilustração no lugar. E os testes automáticos avisam qual foto não foi encontrada.

**Foto de outro site (link):** também funciona colar o endereço completo da imagem, ex.: `imagens: ["https://exemplo.com/foto.jpg"]`. Não é o recomendado: se o outro site apagar ou bloquear a imagem, ela some do seu.

**De onde tirar boas fotos (como revendedor):**
- **Fornecedor/fabricante** — peça o "kit de imagens" ou "fotos para revenda". É o caminho mais seguro e com a melhor qualidade.
- **Fotos próprias** — celular + luz natural + fundo branco (cartolina) já ficam ótimas, e mostram que você tem o produto em estoque.
- Evite copiar fotos de anúncios de **outros vendedores** (Mercado Livre, Shopee etc.): muitas vezes a foto é do próprio vendedor, não do fabricante, e pode gerar pedido de remoção ou denúncia.

## Tipos de ilustração disponíveis
Campo `ilustracao.tipo`:

| Vestuário | Calçados | Equipamentos | Mochilas | Camping | Acessórios |
|---|---|---|---|---|---|
| `gandola` | `coturno` | `colete` | `mochila` | `faca` | `patch` |
| `camiseta` | `bota` | `cinto` | `bornal` | `canivete` | `tarjeta` |
| `jaqueta` | `meia` | `coldre` | `pochete` | `lanterna` | `dogtag` |
| `calca` | | `modular` | `saco` | `headlamp` | `oculos` |
| `bone` | | `luva` | | `cantil` | `abafador` |
| `chapeu` | | `joelheira` | | `hidratacao` | `caneca` |
| `balaclava` | | | | `rede`, `poncho` | |
| | | | | `bussola`, `binoculo` | |
| | | | | `kit`, `marmita` | |

## Conferir se está tudo certo
No GitHub, a aba **Actions** roda os testes a cada alteração. No computador:
```bash
cd PROJETOS/arte-militar-011
node --test tests/*.test.js
```
Exemplos de avisos: `subcategoria "coturno" não existe em "calcados"`, `cor "preto" não está cadastrada` (maiúscula importa), `preço deve ser número com ponto (ex.: 89.9), sem aspas`.

## Muitos produtos?
Com mais de ~300 produtos, o próximo passo natural é cadastrar numa **planilha do Google** e o site ler de lá, ou usar um painel (CMS). Isso está nas próximas melhorias do [README](../README.md#-próximas-melhorias).
