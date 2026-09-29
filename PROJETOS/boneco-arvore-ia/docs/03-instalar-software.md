# 3 · Instalar o software

Tudo está explicado em **[instalar/README.md](../instalar/README.md)**: onde instalar cada coisa, no Windows e no Raspberry.

## Resumo no Raspberry Pi
```bash
git clone https://github.com/WillianCoder/WillCoder01.git
cd WillCoder01/PROJETOS/boneco-arvore-ia/instalar/raspberry
bash instalar.sh     # instala tudo (20–40 min, baixa ~3 GB)
bash verificar.sh    # confere: tudo ✔ ?
bash menu.sh         # menu fácil
```

O `instalar.sh` faz sozinho:
| Passo | O quê |
|:-:|---|
| 1 | Instala `sox`, `alsa-utils`, `portaudio` |
| 2 | Cria o ambiente Python (`.venv`) e instala Vosk, Piper, sounddevice |
| 3 | Baixa o modelo de ouvir (Vosk PT) e a voz (Piper `faber`) |
| 4 | Instala o Ollama e baixa `qwen2.5:3b` |
| 5 | Cria o personagem `arvore` |
| 6 | Configura o boneco para **ligar sozinho** |

## ✅ Teste
`bash verificar.sh` deve mostrar tudo com ✔ (o item "Boneco rodando agora" só fica ✔ depois de ligar).

> Se o som sair no lugar errado, veja [Problemas](09-problemas.md#som-sai-no-lugar-errado).
