# 🧰 Instalação: onde instalar cada coisa

Existem **2 lugares** onde o código roda. Escolha a pasta do seu computador:

| Onde | Pasta | Para quê | Custo |
|---|---|---|:-:|
| 💻 **Seu PC com Windows** | [`windows/`](windows/) | **Testar primeiro**: conversar, ajustar voz e personagem | Grátis |
| 🍓 **Raspberry Pi** (dentro do boneco) | [`raspberry/`](raspberry/) | O boneco de verdade, ligando sozinho | Hardware |

> ✅ **Ordem recomendada:** primeiro o Windows (sem gastar nada), depois o Raspberry.

---

## 💻 Windows (teste grátis): só cliques

**Antes:** microfone e caixa de som ligados no PC.

1. Baixe o projeto: em <https://github.com/WillianCoder/WillCoder01> clique em **Code → Download ZIP** e extraia (botão direito → *Extrair tudo*).
2. Abra `PROJETOS\boneco-arvore-ia\instalar\windows\`.
3. Dê 2 cliques em cada arquivo, **nesta ordem**:

| # | Arquivo | O que faz |
|:-:|---|---|
| 1 | `INSTALAR.bat` | Instala tudo (15–40 min). Clique **Sim** se o Windows perguntar |
| 2 | `TESTAR_VOZ.bat` | Fala uma frase com a voz grossa |
| 3 | `CONVERSAR_TECLADO.bat` | Você **digita** e ele responde **falando** (sem microfone) |
| 4 | `INICIAR.bat` | Boneco completo: fale **"Tronco, …"** no microfone |
| — | `VERIFICAR.bat` | Mostra [OK]/[X] para cada parte, com a solução |
| — | `TROCAR_PERSONAGEM.bat` | Árvore, dragão, robô ou coruja |
| — | `EDITAR_NOME_E_VOZ.bat` | Muda nome, senha e tom da voz |
| — | `EDITAR_PERSONALIDADE.bat` | Muda a personalidade e já aplica |

> Se aparecer "O Windows protegeu o computador", clique **Mais informações → Executar assim mesmo**.

---

## 🍓 Raspberry Pi (boneco de verdade)

**Antes:** Pi com Raspberry Pi OS 64-bit, internet, microfone USB e placa de som USB conectados ([etapa 2 do guia](../docs/02-preparar-raspberry.md)).

Digite no terminal do Pi, **uma linha por vez**:
```bash
git clone https://github.com/WillianCoder/WillCoder01.git
cd WillCoder01/PROJETOS/boneco-arvore-ia/instalar/raspberry
bash instalar.sh
bash verificar.sh
bash menu.sh
```

| Arquivo | O que faz |
|---|---|
| `instalar.sh` | Instala tudo e faz o boneco ligar sozinho (20–40 min) |
| `verificar.sh` | Mostra [OK] ou [X] para cada parte, com a solução, e a temperatura |
| `menu.sh` | Menu com 11 opções: testar, ligar, desligar, editar, trocar personagem, atualizar |
| `boneco.service` | Usado pelo instalador (não precisa mexer) |

> Pi com **4 GB**? Instale com o modelo menor: `MODELO_IA=qwen2.5:1.5b bash instalar.sh`

---

## ✏️ Arquivos que VOCÊ edita (nos dois computadores)

| Arquivo | O que muda |
|---|---|
| `src/config.json` | **nome**, **senha**, **efeito_voz** (tom) |
| `src/config.json` → `respostas_fixas` | respostas exatas para perguntas específicas |
| `src/personagens/<ativo>/Modelfile` | **personalidade** e história |

O resto (`boneco.py`, `personagem_logica.py`...) já está pronto: não precisa mexer.
