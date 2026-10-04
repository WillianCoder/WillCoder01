# Pagamento pelo site — plano para o futuro

Hoje o site **não cobra nada**: o pedido vai pronto para o WhatsApp e o pagamento é combinado lá. O código já foi preparado para, quando você quiser, o cliente **preencher o endereço e pagar no próprio site**, e você só fazer o envio.

## O que já está pronto
- **Pedido estruturado** — `montarPedido()` em [`site/js/pedido.js`](../site/js/pedido.js) gera um objeto com número, itens, quantidades, preços, subtotal, desconto Pix, cliente, endereço completo (com CEP) e forma de entrega. É exatamente o que um meio de pagamento pede.
- **Ponto de encaixe** — a lista `FINALIZADORES` no mesmo arquivo. Hoje só existe `whatsapp`. O site usa o finalizador definido em `LOJA.pedidos.finalizacao` (padrão: `"whatsapp"`).
- **Formulário de endereço** com busca automática por CEP (ViaCEP) e validação.
- **Campo `frete`** reservado no pedido (hoje `null` = "a combinar").

## O que vai precisar (importante)
Pagamento online exige um **pequeno servidor** (backend), porque:
1. a **chave secreta** do meio de pagamento (Access Token) **nunca pode ficar no site** — qualquer pessoa conseguiria ler;
2. o **preço precisa ser conferido no servidor** — senão alguém altera o valor no navegador;
3. o meio de pagamento avisa "pagou/não pagou" por **webhook**, que precisa de um endereço sempre no ar.

Não precisa ser caro: dá para usar uma **função serverless gratuita** (Cloudflare Workers, Vercel ou Netlify Functions) com poucas dezenas de linhas.

## Caminhos possíveis
| Opção | Como funciona | Prós | Contras |
|---|---|---|---|
| **Link de pagamento manual** (Mercado Pago, PagSeguro, InfinitePay) | Você gera o link no app e manda no WhatsApp | Zero código, dá para usar **hoje** | Manual, um link por pedido |
| **Mercado Pago Checkout Pro** ⭐ | O site cria uma "preferência" no servidor e leva o cliente à tela de pagamento do Mercado Pago | Pix, cartão, boleto, parcelamento; cliente já confia; antifraude incluso | Precisa da função serverless |
| **PagBank (PagSeguro)** ou **Stripe** | Parecido com o Checkout Pro | Boas taxas; Stripe tem ótima documentação | Mesma necessidade de servidor |
| **Plataforma pronta** (Nuvemshop, Shopify, Loja Integrada) | Migra o catálogo para a plataforma | Pagamento, frete e estoque prontos | Mensalidade, menos liberdade no visual |

**Recomendação:** começar com **link de pagamento manual** (já resolve hoje, pelo WhatsApp) e, quando o volume crescer, partir para o **Mercado Pago Checkout Pro** com uma função serverless.

## Passo a passo técnico (Checkout Pro)
1. **Conta e credenciais** — criar conta Mercado Pago de vendedor → *Suas integrações* → criar aplicação → copiar o **Access Token** (fica só no servidor, como variável de ambiente; nunca no GitHub).
2. **Função serverless** `POST /criar-pagamento`:
   - recebe `{ numero, itens: [{id, variacoes, qtd}], cliente, endereco, entrega }`;
   - **recalcula os preços** a partir do catálogo (não confia no valor vindo do navegador);
   - cria a preferência na API do Mercado Pago (itens, `payer`, `external_reference = numero`, `back_urls` apontando para `#/pedido-enviado/NUMERO`, `notification_url` para o webhook);
   - devolve o `init_point` (endereço da tela de pagamento).
3. **Webhook** `POST /webhook-mercadopago`: confirma o pagamento consultando a API e avisa você (e-mail, Telegram ou mensagem no WhatsApp Business via API).
4. **No site**, adicionar o finalizador em `pedido.js`:
   ```js
   FINALIZADORES.mercadopago = function (pedido, config) {
     // chamada assíncrona ao seu servidor; o app.js passa a aguardar a resposta
     return fetch(config.pedidos.urlPagamento, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(pedido)
     })
       .then(function (r) { return r.json(); })
       .then(function (d) { return { tipo: "redirecionar", url: d.init_point }; });
   };
   ```
   e no `config.js`: `finalizacao: "mercadopago", urlPagamento: "https://sua-funcao.workers.dev/criar-pagamento"`.
   No `app.js`, a função `enviarPedido` precisa tratar o retorno como Promise (`Promise.resolve(finalizar(...)).then(...)`), mostrando "Gerando pagamento..." no botão.
5. **Manter o WhatsApp** como alternativa: deixe dois botões ("Pagar agora" e "Finalizar pelo WhatsApp").
6. **Testar** com as credenciais de teste do Mercado Pago antes de virar para produção.

## Frete automático
Para calcular o frete no site: **Melhor Envio** (API gratuita, compara Correios, Jadlog etc.) — também via função serverless (token secreto). Cada produto precisaria de peso e medidas (adicionar `peso` e `medidas` em `produtos.js`). O resultado entra no campo `frete` do pedido.

## Antes de cobrar pelo site
- [ ] **CNPJ** e conta de vendedor no meio de pagamento
- [ ] **Política de privacidade** atualizada (o site passará a guardar dados no servidor — LGPD)
- [ ] **Termos de compra**, prazo de envio e política de trocas (Código de Defesa do Consumidor: arrependimento em 7 dias)
- [ ] **Controle de estoque** confiável (para não vender o que já saiu na loja física)
- [ ] **Domínio próprio com HTTPS** (passa mais confiança na hora de pagar)
