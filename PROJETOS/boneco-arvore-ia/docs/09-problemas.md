# 9 · Problemas e soluções

| Problema | Causa provável | Solução |
|---|---|---|
| Pi reinicia sozinho / raio amarelo | Bateria fraca | Power bank **PD 5V/5A (27 W)** |
| Não reconhece o nome | Nome curto/comum ou mic longe | Nome de 2–3 sílabas; teste com `journalctl -u boneco -f` para ver o que ele entende |
| Acorda sozinho com a TV | Nome parecido com palavras comuns | Troque o nome |
| Ouve a própria voz | Mic perto do alto-falante | Afaste; espuma no mic |
| Demora muito para responder | Modelo grande | `qwen2.5:1.5b` (etapa 4.5) |
| Responde fora do personagem | Modelo pequeno "escapa" | Reforce as regras no Modelfile; adicione palavras em `BLOQUEIO` (`src/personagem_logica.py`) |
| Esquenta | Sem ventilação | Cooler ativo + fendas na tampa |
| Chiado no som | Ruído do PAM8403 | Fios curtos; volume do potenciômetro mais baixo |

## Som sai no lugar errado
```bash
aplay -l                   # veja o número do "card" da placa USB (ex.: card 2)
nano ~/.asoundrc
```
Escreva (troque 2 pelo seu número):
```
defaults.pcm.card 2
defaults.ctl.card 2
```

## Sites que ajudam
- Ollama — <https://ollama.com>
- Piper TTS — <https://github.com/rhasspy/piper>
- Vosk — <https://alphacephei.com/vosk>
- Raspberry Pi — <https://www.raspberrypi.com/documentation/>
- Inspiração: YouTube "Raspberry Pi offline AI assistant", "talking animatronic LLM", "Billy Bass AI"
- Tutoriais: Hackster.io e Instructables.com
