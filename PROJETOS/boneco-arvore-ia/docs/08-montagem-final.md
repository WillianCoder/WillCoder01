# 8 · Montagem final

1. Parafuse o **Pi** (com cooler) na plataforma interna, **perto da ventilação**.
2. Cole o **alto-falante** atrás da grade, com tecido fino na frente. Uma "caixinha" fechada atrás dele deixa o som mais grave.
3. Cole o **microfone** no furo da cabeça (espuma ao redor evita vibração).
4. Prenda o PAM8403 com fita dupla-face; organize os fios com abraçadeiras.
5. Power bank na base (é o mais pesado → boneco estável).
6. Feche a tampa (ímãs).
7. Ligue e espere ~40 s: ele diz **"Hmmm... Tronco despertou."** 🎉

## Comandos úteis
```bash
sudo systemctl status boneco      # está rodando?
journalctl -u boneco -f           # ver o que ele ouve/responde ao vivo
sudo systemctl restart boneco     # reiniciar
sudo systemctl stop boneco        # parar
```

## 🔒 Blindagem final (opcional, avançado)
Deixe o cartão **somente leitura** — nada pode ser alterado e desligar na tomada não corrompe:
```bash
sudo raspi-config   # Performance Options → Overlay File System → Sim
```
⚠️ Com isso ativo, **trocar o nome pela voz não fica salvo** após desligar. Configure tudo antes; para editar depois, desative pelo mesmo menu.

## 🔋 Bateria
| Power bank | Duração aproximada |
|---|:-:|
| 10.000 mAh | 2–3 h |
| 20.000 mAh | 4–6 h |
