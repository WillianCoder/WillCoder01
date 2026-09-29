@echo off
title Teste de voz
cd /d "%~dp0..\..\src"
set /p TOM="Tom da voz (-300 a -700, Enter = -500): "
if "%TOM%"=="" set TOM=-500
"..\.venv\Scripts\python.exe" testar_voz.py "Hmmm... eu sou a arvore mais antiga desta floresta." %TOM%
pause
