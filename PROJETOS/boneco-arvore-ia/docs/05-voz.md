# 5 · Voz grossa

```bash
cd src
bash testar_voz.sh                               # tom padrão (-500)
bash testar_voz.sh "Olá, pequeno viajante." -650  # mais grave
```

## Ajustes do `"efeito_voz"` em `config.json`
| Efeito | O que faz | Valores |
|---|---|---|
| `pitch -500` | Engrossa a voz | -300 leve · -500 árvore · -700 gigante |
| `tempo 0.9` | Fala mais devagar | 0.8 lento · 1.0 normal |
| `reverb 20` | Eco de floresta | 0 seco · 40 caverna |
| `bass +6` *(adicione)* | Mais grave | 0 – 10 |

Exemplo de voz "ent gigante":
```json
"efeito_voz": ["pitch", "-650", "tempo", "0.85", "bass", "+6", "reverb", "30"]
```

## Outras vozes
Ouça as vozes em <https://rhasspy.github.io/piper-samples/> (procure **pt_BR**).
Baixe o `.onnx` + `.onnx.json` para `src/modelos/` e altere `"voz_piper"`.

## ✅ Teste
O som saiu grave, claro e sem chiado? Siga para a eletrônica.
