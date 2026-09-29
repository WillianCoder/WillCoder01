# 📦 Versões do Boneco IA

**Use sempre a versão mais nova (v0.3.0).** As antigas ficam guardadas no histórico do Git, para consulta.

## Resumo rápido
| | v0.1.0 | v0.2.0 | **v0.3.0 (atual)** |
|---|:-:|:-:|:-:|
| Ouve sempre e acorda pelo nome | ✅ | ✅ | ✅ |
| Voz grossa com efeito (SoX) | ✅ | ✅ | ✅ |
| IA offline, fiel ao personagem | ✅ | ✅ | ✅ |
| Troca de nome por voz com senha | ✅ | ✅ | ✅ |
| Guia passo a passo + PDF com mapa mental | ✅ | ✅ | ✅ |
| Funciona no **Windows** (teste grátis) | ❌ | ✅ | ✅ |
| Instalação com 2 cliques / 1 comando | ⚠️ só no Pi | ✅ | ✅ |
| Menu fácil no Raspberry | ❌ | 9 opções | **11 opções** |
| **Começa a falar enquanto pensa** (streaming) | ❌ | ❌ | ✅ |
| IA fica carregada (sem demora na 1ª pergunta) | ❌ | ❌ | ✅ |
| Voz carregada 1 vez + frases repetidas prontas | ❌ | ❌ | ✅ |
| **4 personagens prontos** + troca fácil | ❌ | ❌ | ✅ |
| **Respostas fixas** (respostas exatas) | ❌ | ❌ | ✅ |
| Apelidos (entende "troco" como "Tronco") | ❌ | ❌ | ✅ |
| Frases do personagem editáveis | ❌ | ❌ | ✅ |
| **Modo teclado com voz** (sem microfone) | ❌ | ❌ | ✅ |
| Diagnóstico [OK]/[X] no Windows e no Pi | ❌ | só Pi | ✅ ambos |
| **Olhos de LED** acendendo ao falar | ❌ | ❌ | ✅ (opcional) |
| Mantém acentos (ç, ã) na pergunta e no nome | ❌ | ❌ | ✅ |
| Aviso de temperatura / falta de energia | ❌ | ❌ | ✅ |
| Atualizar pelo GitHub com 1 opção | ❌ | ❌ | ✅ |
| Testes automáticos | 6 | 6 | **12** |

## ⏱️ Velocidade estimada no Raspberry Pi 5 (8 GB)
São estimativas, porque o hardware ainda não foi testado. O tempo real depende do tamanho da resposta.

| Momento | v0.1 / v0.2 | v0.3.0 |
|---|:-:|:-:|
| 1ª pergunta depois de ligar | 10–20 s (carrega a IA) | 4–8 s (IA já carregada) |
| Até **começar** a falar | 5–10 s (espera a resposta inteira) | **2–4 s** (fala a 1ª frase logo) |
| "Hmm?" e frases fixas | ~1 s (gera toda vez) | **instantâneo** (guardado) |

## Detalhes de cada versão
- [v0.3.0](../releases/v0.3.0.md): mais rápido, personagens prontos, respostas fixas, LED, modo teclado
- [v0.2.0](../releases/v0.2.0.md): instalação separada Windows/Raspberry, menu e verificação
- [v0.1.0](../releases/v0.1.0.md): primeira versão (código, guia e PDF)

## Como pegar uma versão antiga (só se precisar)
```bash
git log --oneline -- PROJETOS/boneco-arvore-ia     # lista as versões
git checkout d07c62c -- PROJETOS/boneco-arvore-ia  # exemplo: volta para a v0.2.0
git checkout HEAD -- PROJETOS/boneco-arvore-ia     # volta para a mais nova
```
