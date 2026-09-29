@echo off
chcp 65001 >nul
title Editar nome, senha e voz
cd /d "%~dp0..\..\src"
echo Salve e feche o Bloco de Notas para conferir o arquivo.
notepad config.json
"..\.venv\Scripts\python.exe" -c "import personagem_logica as p; p.carregar_config('config.json'); print('config.json OK!')"
pause
