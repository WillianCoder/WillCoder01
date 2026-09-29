# 3 · Instalar o software (um comando só)

1. Copie a pasta do projeto para o Pi:
```bash
git clone https://github.com/WillianCoder/WillCoder01.git
cd WillCoder01/PROJETOS/boneco-arvore-ia/src
```
2. Plugue o **microfone USB** e a **placa de som USB**.
3. Rode o instalador (leva 20–40 min, baixa ~3 GB):
```bash
bash instalar.sh
```

O `instalar.sh` faz sozinho:
| Passo | O quê |
|:-:|---|
| 1 | Instala `sox`, `alsa-utils`, `portaudio` |
| 2 | Cria o ambiente Python e instala Vosk, Piper, sounddevice |
| 3 | Baixa o modelo de ouvir (Vosk PT) e a voz (Piper `faber`) |
| 4 | Instala o Ollama, baixa `qwen2.5:3b` e cria o personagem `arvore` |
| 5 | Configura o boneco para **ligar sozinho** quando o Pi ligar |

## ✅ Testes
```bash
arecord -l                          # aparece o microfone USB?
arecord -d 5 t.wav && aplay t.wav   # grava 5 s e toca: ouviu sua voz?
ollama run arvore "Quem é você?"    # respondeu como árvore?
```

> Se o som sair no lugar errado, veja [Problemas](09-problemas.md#som-sai-no-lugar-errado).
