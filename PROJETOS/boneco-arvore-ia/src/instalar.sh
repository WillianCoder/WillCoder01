#!/usr/bin/env bash
# Instala tudo no Raspberry Pi (rode UMA vez, com internet):  bash instalar.sh
set -e
cd "$(dirname "$0")"

echo "==> 1/5 Pacotes do sistema"
sudo apt update
sudo apt install -y python3-pip python3-venv sox alsa-utils libportaudio2 unzip wget

echo "==> 2/5 Ambiente Python"
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

echo "==> 3/5 Modelos de ouvir (Vosk) e falar (Piper)"
mkdir -p modelos && cd modelos
[ -d vosk-model-small-pt-0.3 ] || { wget -q https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip && unzip -q vosk-model-small-pt-0.3.zip && rm vosk-model-small-pt-0.3.zip; }
BASE=https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium
[ -f pt_BR-faber-medium.onnx ] || wget -q $BASE/pt_BR-faber-medium.onnx
[ -f pt_BR-faber-medium.onnx.json ] || wget -q $BASE/pt_BR-faber-medium.onnx.json
cd ..

echo "==> 4/5 IA (Ollama) e personagem"
command -v ollama >/dev/null || curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:3b
ollama create arvore -f personagem/Modelfile

echo "==> 5/5 Iniciar sozinho ao ligar"
sed "s#__PASTA__#$(pwd)#g; s#__USUARIO__#$USER#g" boneco.service | sudo tee /etc/systemd/system/boneco.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable boneco.service

echo "Pronto! Teste a voz com: bash testar_voz.sh   |   Ligue o boneco: sudo systemctl start boneco"
