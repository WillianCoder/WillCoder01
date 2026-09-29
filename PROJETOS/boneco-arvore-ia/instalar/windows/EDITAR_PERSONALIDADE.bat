@echo off
chcp 65001 >nul
title Editar personalidade
cd /d "%~dp0..\..\src"
for /f %%p in ('"..\.venv\Scripts\python.exe" -c "import personagem_logica as p; print(p.carregar_config('config.json')['personagem'])"') do set P=%%p
echo Editando o personagem: %P%  (salve e feche o Bloco de Notas para aplicar)
notepad personagens\%P%\Modelfile
"..\.venv\Scripts\python.exe" personagem.py aplicar
pause
