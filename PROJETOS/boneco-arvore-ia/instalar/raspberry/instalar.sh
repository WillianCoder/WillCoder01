#!/usr/bin/env bash
# ============================================================
#  INSTALADOR DO BONECO — RASPBERRY PI
#  Rode UMA vez, com internet:   bash instalar.sh
#  Pode rodar de novo se der erro: ele continua de onde parou.
# ============================================================
set -e
AQUI="$(cd "$(dirname "$0")" && pwd)"
PROJETO="$(cd "$AQUI/../.." && pwd)"
SRC="$PROJETO/src"
MODELO_IA="${MODELO_IA:-qwen2.5:3b}"   # Pi com 4 GB? rode: MODELO_IA=qwen2.5:1.5b bash instalar.sh

verde(){ echo -e "\n\033[1;32m==> $*\033[0m"; }

verde "1/6 Instalando programas do sistema (sox, áudio)"
sudo apt update
sudo apt install -y python3-pip python3-venv sox alsa-utils libportaudio2 unzip wget curl git

verde "2/6 Criando o ambiente Python"
# --system-site-packages: usa o gpiozero que já vem no Raspberry (olhos de LED)
python3 -m venv --system-site-packages "$PROJETO/.venv"
"$PROJETO/.venv/bin/pip" install --upgrade pip
"$PROJETO/.venv/bin/pip" install -r "$SRC/requirements.txt"

verde "3/6 Baixando o 'ouvido' (Vosk) e a 'voz' (Piper)"
mkdir -p "$SRC/modelos" && cd "$SRC/modelos"
if [ ! -d vosk-model-small-pt-0.3 ]; then
  wget -q --show-progress https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip
  unzip -q vosk-model-small-pt-0.3.zip && rm vosk-model-small-pt-0.3.zip
fi
VOZ=https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium
[ -f pt_BR-faber-medium.onnx ]      || wget -q --show-progress "$VOZ/pt_BR-faber-medium.onnx"
[ -f pt_BR-faber-medium.onnx.json ] || wget -q --show-progress "$VOZ/pt_BR-faber-medium.onnx.json"

verde "4/6 Instalando a IA (Ollama) e baixando o modelo $MODELO_IA"
command -v ollama >/dev/null || curl -fsSL https://ollama.com/install.sh | sh
ollama pull "$MODELO_IA"

verde "5/6 Criando o personagem na IA"
cd "$SRC"
"$PROJETO/.venv/bin/python" - "$MODELO_IA" <<'PY'
import sys, personagem_logica as pl
cfg = pl.carregar_config("config.json")
cfg["modelo_base"] = sys.argv[1]          # guarda qual IA foi instalada
pl.salvar_config("config.json", cfg)
PY
"$PROJETO/.venv/bin/python" personagem.py aplicar

verde "6/6 Fazendo o boneco ligar sozinho"
sed "s#__SRC__#$SRC#g; s#__PYTHON__#$PROJETO/.venv/bin/python#g; s#__USUARIO__#$USER#g" \
  "$AQUI/boneco.service" | sudo tee /etc/systemd/system/boneco.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable boneco.service

verde "PRONTO! 🌳"
echo "Próximos passos:"
echo "  1) Verificar tudo:     bash $AQUI/verificar.sh"
echo "  2) Abrir o menu:       bash $AQUI/menu.sh"
echo "  3) Ligar o boneco:     sudo systemctl start boneco"
