# 6 · Ligações elétricas

```
                     ┌───────────── Raspberry Pi 5 ─────────────┐
 Power bank PD ──USB-C──▶ entrada de energia                     │
                     │  USB ◀── Microfone USB                    │
                     │  USB ◀── Placa de som USB ──P2──┐         │
                     │  pino 2 (5V) ───────────────┐   │         │
                     │  pino 6 (GND) ────────────┐ │   │         │
                     └───────────────────────────┼─┼───┼─────────┘
                                                 │ │   ▼
                                           ┌─────┴─┴── PAM8403 ──┐
                                           │ GND  5V   L  G  R    │
                                           │   saída L+ / L−  ────┼──▶ 🔊 Alto-falante
                                           └──────────────────────┘
```

## Passo a passo
1. **Cabo P2** da placa de som USB → entrada do PAM8403 (use **L** e **G**; ou solde um P2 cortado: fio da ponta = L, malha = G).
2. **Energia do PAM8403:** `5V` → pino físico **2** do Pi; `GND` → pino **6**.
3. **Alto-falante** → saída **L+ e L−** do PAM8403.
4. Se o módulo tiver potenciômetro, comece com o volume na metade.
5. **Microfone USB** e **placa de som** nas portas USB.
6. **Power bank** no USB-C do Pi.

## ✨ Olhos de LED (opcional)
`GPIO17` (pino 11) → resistor 220 Ω → perna longa do LED; perna curta → GND (pino 9).
Dois LEDs? Um resistor para cada, ambos no mesmo GPIO.

## ⚠️ Cuidados
- Ligue/desligue fios **com tudo desligado**.
- **Nunca** ligue o alto-falante direto no Pi (sem amplificador).
- Fios soltos: isole com fita ou termorretrátil.

## ✅ Teste
```bash
speaker-test -t wav -c 2 -l 1     # ouviu "front left / front right"?
```
