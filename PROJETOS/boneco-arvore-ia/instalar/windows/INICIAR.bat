@echo off
chcp 65001 >nul
title Boneco IA
echo Fale o NOME do boneco perto do microfone. Para sair, feche esta janela.
cd /d "%~dp0..\..\src"
"..\.venv\Scripts\python.exe" boneco.py
pause
