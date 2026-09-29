# Changelog — Boneco Árvore IA

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) · Versões: [SemVer](https://semver.org/lang/pt-BR/)

## [Não lançado]

## [0.2.0] - 2026-09-29
### Adicionado
- Pasta `instalar/` separando onde instalar cada código: `windows/` (teste grátis com 2 cliques) e `raspberry/` (boneco de verdade).
- Windows: `INSTALAR.bat`, `TESTAR_VOZ.bat`, `INICIAR.bat`, `CONVERSAR_TECLADO.bat` e atalhos de edição.
- Raspberry: `verificar.sh` (diagnóstico ✔/✘) e `menu.sh` (menu com números).
- `src/testar_voz.py` (substitui `testar_voz.sh`) e PDF `docs/instalacao-e-comandos.pdf`.
### Alterado
- Áudio tocado pelo próprio Python e SoX encontrado automaticamente: o mesmo código roda no Windows e no Raspberry.
- Instalador do Raspberry movido para `instalar/raspberry/`, com opção de modelo menor (`MODELO_IA`).

## [0.1.0] - 2026-09-29
### Adicionado
- Estrutura inicial do projeto.
- Programa `src/boneco.py`: ouve sempre, acorda pelo nome e responde com voz grossa (Vosk + Ollama + Piper + SoX).
- Troca de nome pela voz protegida por frase secreta; filtro contra "desprogramação".
- Instalador `src/instalar.sh`, teste de voz e serviço para iniciar sozinho.
- Guia passo a passo em `docs/` e PDF com mapa mental, lista de compras e sites gratuitos.
- Testes das regras do personagem.
