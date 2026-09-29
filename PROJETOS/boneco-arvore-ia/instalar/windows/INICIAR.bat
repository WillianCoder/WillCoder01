@echo off
title Boneco Arvore IA
echo Fale o NOME do boneco perto do microfone. Para sair, feche esta janela.
cd /d "%~dp0..\..\src"
"..\.venv\Scripts\python.exe" boneco.py
pause
