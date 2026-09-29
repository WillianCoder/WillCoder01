# Primeira página web — barra de navegação

Primeiro commit do repositório (2024-07-12). Exercício de HTML, CSS e JavaScript: barra de navegação com efeito "matrix" no hover, seções exibidas por clique e um formulário simples.

## 📂 Arquivos originais (preservados na raiz, sem alterações)
- [`gato.html`](../../../gato.html) — página
- [`style.css`](../../../style.css) — estilos
- [`script.js`](../../../script.js) — interação da navegação

> Os arquivos **não foram movidos** para respeitar a regra de preservação. Se quiser, eles podem ser movidos para esta pasta com `git mv` (o histórico é mantido) — basta autorizar.

## 🐛 Problemas conhecidos (registrados, não corrigidos)
- `script.js`: há um `});` sobrando no final, o que gera erro de sintaxe e impede o script de rodar.
- `gato.html`: `class="content>"` com aspas fora do lugar; `<section id="formulario">` está fora do `<body>` e fecha antes do `</form>`; os links apontam para `#about`/`#services`, seções que não existem no HTML.
- `style.css`: imagem de fundo aponta para um caminho local do Windows (`C:\Users\...`), que não funciona fora do seu computador; seletores `name` e `email` não correspondem a elementos HTML.
- `desktop.ini` é um arquivo automático do Windows (ícone da pasta) — pode ser removido com segurança, mas foi mantido.

## 💡 Conclusão
Serve como marco do ponto de partida — ótimo para o histórico de evolução.
