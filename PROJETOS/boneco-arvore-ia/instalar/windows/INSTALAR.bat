@echo off
title Instalador do Boneco
echo Instalando o Boneco Arvore IA... isso leva de 15 a 40 minutos.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar.ps1"
pause
