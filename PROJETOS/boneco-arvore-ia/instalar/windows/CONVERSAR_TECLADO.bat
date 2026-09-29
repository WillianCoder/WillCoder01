@echo off
chcp 65001 >nul
title Conversar pelo teclado
echo Digite perguntas e ouca a resposta com a voz do personagem.
echo Para sair: feche esta janela ou aperte Ctrl+C
cd /d "%~dp0..\..\src"
"..\.venv\Scripts\python.exe" boneco.py --teclado
pause
