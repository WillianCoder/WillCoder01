# Pagamentos

## Hoje (v0.2): liberação manual auditada
1. Aluno escolhe o plano em **Meu plano** → cria pedido **PENDENTE**.
2. Aluno paga (ex.: Pix) e envia comprovante no WhatsApp de suporte.
3. Admin confere **no extrato do banco** → Painel → Usuários → *Confirmar pagamento e liberar* (anota o comprovante).
4. Plano fica **ATIVO** por `durationDays`; ação gravada na auditoria.

Nunca libere pelo print do comprovante sem conferir no extrato (prints são fáceis de falsificar).

## Próximo (v0.8): Mercado Pago automático
- Checkout Pix/cartão criado **no servidor** com o preço do banco (o navegador nunca envia preço).
- Webhook `/api/webhooks/mercadopago`: valida a assinatura (`x-signature` com `MERCADOPAGO_WEBHOOK_SECRET`), consulta o pagamento na API do Mercado Pago, grava `Payment` (idempotente por `gatewayId`) e ativa a assinatura só se `APPROVED` (`activationWindow`).
- Reembolso/estorno → assinatura `CANCELED`.
- Chaves só no `.env` da hospedagem.

## Apps Android/iOS (v2.0)
Venda de conteúdo digital **dentro** dos apps em geral exige o sistema de compras da Apple/Google. Estratégia inicial sugerida: o app só faz login de quem já assinou pelo site, sem vender dentro do app — confirmar as regras vigentes das lojas antes de publicar.
