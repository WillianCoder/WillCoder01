"""Testa a voz do personagem sem microfone e sem IA.

Uso:  python testar_voz.py                      (frase e tom padrão)
      python testar_voz.py "Olá, pequeno." -650 (sua frase e seu tom)
Tom: -300 (pouco grave) até -700 (bem grave). Valores positivos afinam a voz.
"""

import sys

import boneco

texto = sys.argv[1] if len(sys.argv) > 1 else "Hmmm... eu sou a árvore mais antiga desta floresta."
efeito = list(boneco.cfg["efeito_voz"])
if len(sys.argv) > 2:
    if "pitch" in efeito:
        efeito[efeito.index("pitch") + 1] = sys.argv[2]
    else:
        efeito = ["pitch", sys.argv[2], *efeito]

boneco.falar(texto, efeito)
print("Efeito usado:", " ".join(efeito))
print('Gostou? Copie esse tom para "efeito_voz" no config.json')
