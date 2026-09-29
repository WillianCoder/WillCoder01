#!/usr/bin/env bash
# Teste rápido da voz grossa. Uso: bash testar_voz.sh "texto" [tom]
# Tom: -300 (pouco grave) até -700 (bem grave). Padrão -500.
cd "$(dirname "$0")"
TEXTO="${1:-Hmmm... eu sou a árvore mais antiga desta floresta.}"
TOM="${2:--500}"
echo "$TEXTO" | .venv/bin/piper -m modelos/pt_BR-faber-medium.onnx -f teste.wav
sox teste.wav teste_grossa.wav pitch "$TOM" tempo 0.9 reverb 20
aplay teste_grossa.wav
echo "Gostou? Coloque o tom $TOM em \"efeito_voz\" no config.json"
