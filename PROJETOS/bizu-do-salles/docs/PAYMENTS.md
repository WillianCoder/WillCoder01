# Pagamentos — Mercado Pago

## Como funciona (resumo)
1. O aluno escolhe o plano em **Meu plano** (pode digitar um **cupom**) e clica em **Pagar com Pix ou cartão**.
2. O servidor calcula o preço **a partir do banco** (plano − cupom) e cria o pagamento no Mercado Pago.
3. O aluno paga na página do Mercado Pago (Pix, cartão ou boleto) e volta para o site.
4. O Mercado Pago avisa o site (**webhook**). O site:
   - confere a **assinatura** do aviso (chave secreta);
   - **consulta o pagamento** direto na API do Mercado Pago (não confia no aviso);
   - confere se o **valor pago = valor do pedido**;
   - libera o plano pelo tempo configurado, registra na **auditoria** e conta o uso do cupom.
5. Estorno/cancelamento de um pagamento aprovado → a assinatura é cancelada automaticamente.

Sem as chaves configuradas, o site continua no **modo manual**: o pedido fica pendente e você libera em Painel → Usuários → *Confirmar pagamento* (depois de ver o dinheiro no extrato).

## Ligar o Mercado Pago (passo a passo)
1. Crie/entre na sua conta em **mercadopago.com.br** (de preferência conta de vendedor PJ/MEI).
2. Acesse **Suas integrações** (mercadopago.com.br/developers/panel) → **Criar aplicação** → tipo *Pagamentos online* / *Checkout Pro*.
3. Em **Credenciais de produção**, copie o **Access Token** (começa com `APP_USR-`).
4. Em **Webhooks** → **Configurar notificações**:
   - URL de produção: `https://SEU-SITE/api/webhooks/mercadopago`
   - Evento: **Pagamentos**
   - Salve e copie a **Assinatura secreta** gerada.
5. Na **Vercel** (Settings → Environment Variables), adicione:
   - `MERCADOPAGO_ACCESS_TOKEN` = o Access Token
   - `MERCADOPAGO_WEBHOOK_SECRET` = a assinatura secreta
   - `APP_URL` = endereço do site (ex.: `https://bizudosalles.com.br`)
6. Faça um novo deploy. O botão passa a ser "Pagar com Pix ou cartão".
7. **Teste com valor baixo**: crie um cupom de 99% (o mínimo cobrado é R$ 1,00), compre com sua conta de aluno e veja o plano ser liberado. Depois desative o cupom.

> Para testar com cartões de teste (sem dinheiro real), use as **credenciais de teste** do Mercado Pago e adicione `MERCADOPAGO_SANDBOX=1`.

## Nunca
- Colocar o Access Token ou a assinatura secreta no código ou no GitHub.
- Liberar acesso por print de comprovante sem conferir no extrato (no modo manual).

## Cupons
Painel → **🎟️ Cupons**: desconto em % ou em R$, limite de usos, validade e planos. O cupom só conta como usado quando o pagamento é **aprovado**. O valor mínimo cobrado fica em `src/config/regras.ts` (`pagamento.minimoCentavos`).

## Apps Android/iOS (futuro)
Venda de conteúdo digital **dentro** dos apps em geral exige o sistema de compras da Apple/Google. Estratégia sugerida: o app só faz login de quem já assinou pelo site — confirmar as regras vigentes das lojas antes de publicar.
