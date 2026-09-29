@echo off
chcp 65001 >nul
title Verificar instalacao
cd /d "%~dp0..\..\src"
"..\.venv\Scripts\python.exe" diagnostico.py
pause
