#!/usr/bin/env bash
# Menu fácil do boneco:   bash menu.sh
AQUI="$(cd "$(dirname "$0")" && pwd)"; PROJETO="$(cd "$AQUI/../.." && pwd)"; SRC="$PROJETO/src"
PY="$PROJETO/.venv/bin/python"
cd "$SRC" || exit 1
parar(){ sudo systemctl stop boneco 2>/dev/null; }   # libera microfone e caixa de som para os testes
while true; do
  echo
  echo "🌳 ===== MENU DO BONECO ====="
  echo " 1) Verificar instalação"
  echo " 2) Testar a voz"
  echo " 3) Testar microfone (grava 5 s e toca)"
  echo " 4) Conversar pelo teclado (com voz)"
  echo " 5) Ligar o boneco"
  echo " 6) Desligar o boneco"
  echo " 7) Ver o que ele ouve e responde (ao vivo, Ctrl+C sai)"
  echo " 8) Editar nome / senha / voz / respostas fixas"
  echo " 9) Editar personalidade e aplicar"
  echo "10) Trocar de personagem (árvore, dragão, robô, coruja)"
  echo "11) Atualizar o código pelo GitHub"
  echo " 0) Sair"
  read -rp "Escolha: " op
  case $op in
    1) bash "$AQUI/verificar.sh" ;;
    2) read -rp "Tom (-700 grave ... +400 fino, Enter = do config): " tom
       parar; "$PY" testar_voz.py "Olá! Esta é a minha voz." $tom ;;
    3) parar; arecord -d 5 -f S16_LE -r 16000 /tmp/mic.wav && aplay /tmp/mic.wav ;;
    4) parar; "$PY" boneco.py --teclado ;;
    5) sudo systemctl start boneco && echo "Ligado!" ;;
    6) parar && echo "Desligado." ;;
    7) journalctl -u boneco -f -n 20 ;;
    8) nano config.json && "$PY" -c "import personagem_logica as p; p.carregar_config('config.json'); print('config.json OK')" \
         && sudo systemctl restart boneco ;;
    9) P=$("$PY" -c "import personagem_logica as p; print(p.carregar_config('config.json')['personagem'])")
       nano "personagens/$P/Modelfile" && "$PY" personagem.py aplicar && sudo systemctl restart boneco ;;
   10) "$PY" personagem.py listar
       read -rp "Nome da pasta do personagem: " p
       [ -n "$p" ] && "$PY" personagem.py escolher "$p" && sudo systemctl restart boneco ;;
   11) git -C "$PROJETO" pull && "$PROJETO/.venv/bin/pip" install -q -r requirements.txt \
         && sudo systemctl restart boneco && echo "Atualizado!" ;;
    0) exit ;;
  esac
done
