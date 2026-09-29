@echo off
chcp 65001 >nul
title Teste de voz
cd /d "%~dp0..\..\src"
set /p TOM="Tom da voz (-700 grave ... +400 fino, Enter = do config): "
"..\.venv\Scripts\python.exe" testar_voz.py "Olá! Esta é a minha voz." %TOM%
pause
