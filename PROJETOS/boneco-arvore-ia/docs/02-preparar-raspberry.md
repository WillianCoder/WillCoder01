# 2 · Preparar o Raspberry Pi

1. No seu PC, baixe o **Raspberry Pi Imager**: <https://www.raspberrypi.com/software/>
2. Coloque o microSD no PC e abra o Imager:
   - **Dispositivo:** Raspberry Pi 5
   - **Sistema:** Raspberry Pi OS **(64-bit)**
   - **Armazenamento:** seu cartão
3. Clique em **Editar configurações** (engrenagem):
   - Nome do host: `boneco`
   - Usuário e senha (anote!)
   - Wi-Fi da sua casa (só para instalar)
   - Aba **Serviços:** ative **SSH**
4. Grave, coloque o cartão no Pi, encaixe o **cooler** e ligue.
5. Acesse o Pi:
   - com monitor + teclado, **ou**
   - pelo PC: `ssh seu_usuario@boneco.local`
6. Atualize:
```bash
sudo apt update && sudo apt upgrade -y
```

## ✅ Teste
```bash
uname -m     # deve mostrar: aarch64
free -h      # deve mostrar ~8 GB
```
