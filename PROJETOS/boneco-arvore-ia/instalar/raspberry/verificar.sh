#!/usr/bin/env bash
# Confere se tudo foi instalado certo:   bash verificar.sh
PROJETO="$(cd "$(dirname "$0")/../.." && pwd)"; SRC="$PROJETO/src"
ok(){ echo -e "  \033[32m✔\033[0m $1"; }; ruim(){ echo -e "  \033[31m✘\033[0m $1  →  $2"; }
checa(){ if eval "$2" >/dev/null 2>&1; then ok "$1"; else ruim "$1" "$3"; fi; }

echo "Verificando o boneco..."
checa "Python do projeto"      "[ -x '$PROJETO/.venv/bin/python' ]"            "rode bash instalar.sh"
checa "SoX (voz grossa)"       "command -v sox"                                 "sudo apt install sox"
checa "Modelo de ouvir (Vosk)" "[ -d '$SRC/modelos/vosk-model-small-pt-0.3' ]"  "rode bash instalar.sh"
checa "Voz (Piper)"            "[ -f '$SRC/modelos/pt_BR-faber-medium.onnx' ]"  "rode bash instalar.sh"
checa "Ollama instalado"       "command -v ollama"                              "rode bash instalar.sh"
checa "Personagem 'arvore'"    "ollama list | grep -q arvore"                   "ollama create arvore -f $SRC/personagem/Modelfile"
checa "Microfone conectado"    "arecord -l | grep -q card"                      "plugue o microfone USB"
checa "Saída de som"           "aplay -l | grep -q card"                        "plugue a placa de som USB"
checa "Liga sozinho"           "systemctl is-enabled boneco"                    "rode bash instalar.sh"
checa "Boneco rodando agora"   "systemctl is-active boneco"                     "sudo systemctl start boneco"
