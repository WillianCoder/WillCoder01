@echo off
chcp 65001 >nul
title Trocar personagem
cd /d "%~dp0..\..\src"
"..\.venv\Scripts\python.exe" personagem.py listar
echo.
set /p P="Digite o nome da pasta do personagem (ex.: dragao): "
if not "%P%"=="" "..\.venv\Scripts\python.exe" personagem.py escolher %P%
pause
