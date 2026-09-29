#!/usr/bin/env bash
# Confere se tudo foi instalado certo:   bash verificar.sh
PROJETO="$(cd "$(dirname "$0")/../.." && pwd)"; SRC="$PROJETO/src"
if [ ! -x "$PROJETO/.venv/bin/python" ]; then
  echo "  [X]   Python do projeto  ->  rode: bash instalar.sh"; exit 1
fi
cd "$SRC" && "$PROJETO/.venv/bin/python" diagnostico.py

echo
echo "Raspberry:"
ok(){ echo -e "  [OK]  $1"; }; ruim(){ echo -e "  [X]   $1  ->  $2"; }
systemctl is-enabled boneco >/dev/null 2>&1 && ok "Liga sozinho ao energizar" || ruim "Liga sozinho" "rode: bash instalar.sh"
systemctl is-active  boneco >/dev/null 2>&1 && ok "Boneco rodando agora"     || ruim "Boneco parado" "sudo systemctl start boneco"
TEMP=$(vcgencmd measure_temp 2>/dev/null | grep -o '[0-9.]*')
[ -n "$TEMP" ] && echo "  [i]   Temperatura: ${TEMP}°C (ideal: abaixo de 70)"
vcgencmd get_throttled 2>/dev/null | grep -q "0x0$" || echo "  [!]   Já faltou energia: use um power bank PD 27 W (5V/5A)"
