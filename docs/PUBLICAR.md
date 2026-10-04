# Publicar e divulgar

## Onde o site está no ar
Este repositório publica a pasta `site/` no **GitHub Pages** automaticamente (workflow `.github/workflows/pages.yml`) sempre que algo entra na branch `main` — e só publica se os testes passarem:

**https://williancoder.github.io/arte-militar-011/**

Não precisa fazer nada: editou e salvou na `main` → em ~1 minuto o site atualiza. Acompanhe na aba **Actions**.

> O navegador pode guardar a versão antiga por alguns minutos. Use **Ctrl + F5** (ou aba anônima) para ver na hora.

**Primeira vez:** em **Settings → Pages**, confira se *Source* está como **GitHub Actions** (o workflow tenta ativar sozinho).

## Domínio próprio
Um endereço como `artemilitar011.com.br` passa muito mais confiança:

1. **Registre o domínio** em [registro.br](https://registro.br) (~R$ 40/ano para `.com.br`).
2. No GitHub: **Settings → Pages → Custom domain** → `www.artemilitar011.com.br` → **Save**.
3. No **registro.br → DNS** do domínio, crie:
   | Tipo | Nome | Valor |
   |---|---|---|
   | CNAME | `www` | `williancoder.github.io` |
   | A | *(vazio)* | `185.199.108.153` |
   | A | *(vazio)* | `185.199.109.153` |
   | A | *(vazio)* | `185.199.110.153` |
   | A | *(vazio)* | `185.199.111.153` |
4. Espere o DNS propagar (de minutos a 24 h) e marque **Enforce HTTPS** em Settings → Pages.
5. Atualize no projeto: `urlSite` no `config.js` e o `og:image` no `index.html` com o novo endereço.

Alternativas gratuitas equivalentes: **Cloudflare Pages** e **Netlify** (apontando para a pasta `site/`).

## Google e prévia do link
- **Título e descrição no Google:** no topo do `site/index.html` (`<title>` e `<meta name="description">`). Cada página do site também troca o título da aba sozinha.
- **Prévia ao compartilhar no WhatsApp/Instagram:** usa `og:title`, `og:description` e a imagem `site/img/compartilhar.jpg` (1200×630). Para trocar a imagem, substitua o arquivo mantendo o nome. O `og:image` precisa do **endereço completo** (https://...).
- **Dados estruturados:** o site informa ao Google que é uma **Loja** (endereço, telefone, e-mail) e, na página de cada produto, o **Produto** com preço e disponibilidade.
- **Google Search Console** ([search.google.com/search-console](https://search.google.com/search-console)): adicione o site e envie o endereço para indexação.
- **Perfil da Empresa no Google** (antigo Google Meu Negócio) — o mais importante para loja física: aparece no Google Maps, com fotos, horários, avaliações e botão de WhatsApp. Coloque o link do site lá. Crie em [google.com/business](https://www.google.com/business/).
- Limitação conhecida: como as páginas usam `#/` (ex.: `#/produto/coturno`), o Google trata o site quase como uma página só. Para ranquear **cada produto** no Google, o próximo passo seria gerar uma página HTML por produto (dá para automatizar com um script) — fica como melhoria futura.

## WhatsApp Business — configure para receber os pedidos
- **Perfil comercial:** nome "Arte Militar 011", endereço, horário, e-mail e link do site.
- **Mensagem de saudação** e **mensagem de ausência** (fora do horário).
- **Respostas rápidas** — sugestões:
  - `/recebido` → "Recebemos seu pedido! Já vamos conferir o estoque e calcular o frete. 🪖"
  - `/pix` → "Segue a chave Pix: ... Assim que pagar, envie o comprovante por aqui."
  - `/retirada` → "Seu pedido está separado! Pode retirar em ... no horário ..."
- **Etiquetas:** "Novo pedido", "Aguardando pagamento", "Pago", "Enviado", "Entregue".
- **Catálogo do WhatsApp** (opcional): pode espelhar os principais produtos do site.

## Como testar no computador
```bash
cd site
python -m http.server 8000
```
Abra http://localhost:8000. (Abrir o `index.html` com dois cliques também funciona.)

## Checklist de lançamento
- [ ] Dados reais no `config.js` (WhatsApp, telefone, e-mail, endereço, horários)
- [ ] Produtos e preços reais no `produtos.js`
- [ ] Fotos dos principais produtos
- [ ] Testar um pedido completo no celular e conferir a mensagem que chega no WhatsApp Business
- [ ] Testar o mapa e os botões Google Maps/Waze
- [ ] Link do site no Instagram, no Perfil da Empresa no Google e no WhatsApp Business
