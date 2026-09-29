#!/usr/bin/env bash
# Menu fácil do boneco:   bash menu.sh
AQUI="$(cd "$(dirname "$0")" && pwd)"; PROJETO="$(cd "$AQUI/../.." && pwd)"; SRC="$PROJETO/src"
PY="$PROJETO/.venv/bin/python"
while true; do
  echo
  echo "🌳 ===== MENU DO BONECO ====="
  echo " 1) Verificar instalação"
  echo " 2) Testar a voz grossa"
  echo " 3) Testar microfone (grava 5 s e toca)"
  echo " 4) Conversar com a IA pelo teclado"
  echo " 5) Ligar o boneco"
  echo " 6) Desligar o boneco"
  echo " 7) Ver o que ele ouve e responde (ao vivo, Ctrl+C sai)"
  echo " 8) Editar nome / senha / voz (config.json)"
  echo " 9) Editar personalidade e aplicar"
  echo " 0) Sair"
  read -rp "Escolha: " op
  case $op in
    1) bash "$AQUI/verificar.sh" ;;
    2) read -rp "Tom (-300 a -700, Enter = -500): " tom
       sudo systemctl stop boneco 2>/dev/null
       (cd "$SRC" && "$PY" testar_voz.py "Hmmm... eu sou a árvore mais antiga desta floresta." "${tom:--500}") ;;
    3) arecord -d 5 -f S16_LE -r 16000 /tmp/mic.wav && aplay /tmp/mic.wav ;;
    4) ollama run arvore ;;
    5) sudo systemctl start boneco && echo "Ligado!" ;;
    6) sudo systemctl stop boneco && echo "Desligado." ;;
    7) journalctl -u boneco -f ;;
    8) nano "$SRC/config.json" && sudo systemctl restart boneco ;;
    9) nano "$SRC/personagem/Modelfile" && ollama create arvore -f "$SRC/personagem/Modelfile" && sudo systemctl restart boneco ;;
    0) exit ;;
  esac
done
