@echo off
cd /d "%~dp0..\..\src"
notepad personagem\Modelfile
echo Aplicando a nova personalidade...
ollama create arvore -f personagem\Modelfile
pause
