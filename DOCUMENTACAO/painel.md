# Painel web

## Abrir localmente
Dê dois cliques em `index.html` — funciona sem servidor (o catálogo é um arquivo `.js`, não depende de `fetch`).

## Publicar no GitHub Pages
1. No GitHub: **Settings → Pages → Source: GitHub Actions**.
2. Cada push na `main` executa `.github/workflows/pages.yml` e publica em `https://williancoder.github.io/WillCoder01/`.

## Atualizar dados
- Perfil (nome, descrição, links, interesses): edite [`perfil.json`](../perfil.json). Campos vazios aparecem como "a definir" — nada é inventado.
- Itens: `meta.json` de cada pasta → `python scripts/catalogo.py`.

## Recursos
Busca instantânea (`/` foca a busca), filtros por tipo, status, tecnologia, categoria e ano, dashboard automático, portfólio, modo claro/escuro, botão para pausar animações (e respeito a `prefers-reduced-motion`), navegação por teclado.

## Arquivos
- `site/css/main.css` — tokens de cor e layout
- `site/js/app.js` — renderização, busca e filtros
- Animação do hero: CSS puro (`.maze` em `main.css`), sem JavaScript
- `site/data/catalog.js` — **gerado**, não editar
