# ============================================================
#  INSTALADOR DO BONECO - WINDOWS (para testar no PC, gratis)
#  Nao rode este arquivo direto: de 2 cliques em INSTALAR.bat
# ============================================================
$ErrorActionPreference = "Stop"
$Projeto = (Resolve-Path "$PSScriptRoot\..\..").Path
$Src = Join-Path $Projeto "src"
function Passo($t) { Write-Host "`n==> $t" -ForegroundColor Green }
function Atualizar-Path { $env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User") }

Passo "1/6 Instalando Python, Ollama e SoX (pode pedir permissao - clique Sim)"
foreach ($app in @("Python.Python.3.12", "Ollama.Ollama", "ChrisBagwell.SoX")) {
    winget install --id $app -e --accept-source-agreements --accept-package-agreements --silent
}
Atualizar-Path

Passo "2/6 Criando o ambiente Python"
$py = (Get-Command py -ErrorAction SilentlyContinue)
if ($py) { py -3.12 -m venv "$Projeto\.venv" } else { python -m venv "$Projeto\.venv" }
$Python = "$Projeto\.venv\Scripts\python.exe"
& $Python -m pip install --upgrade pip
& $Python -m pip install -r "$Src\requirements.txt"

Passo "3/6 Baixando o 'ouvido' (Vosk) e a 'voz' (Piper)"
$Modelos = Join-Path $Src "modelos"
New-Item -ItemType Directory -Force $Modelos | Out-Null
if (-not (Test-Path "$Modelos\vosk-model-small-pt-0.3")) {
    Invoke-WebRequest "https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip" -OutFile "$Modelos\vosk.zip"
    Expand-Archive "$Modelos\vosk.zip" -DestinationPath $Modelos -Force
    Remove-Item "$Modelos\vosk.zip"
}
$Voz = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium"
foreach ($f in @("pt_BR-faber-medium.onnx", "pt_BR-faber-medium.onnx.json")) {
    if (-not (Test-Path "$Modelos\$f")) { Invoke-WebRequest "$Voz/$f" -OutFile "$Modelos\$f" }
}

Passo "4/6 Baixando a IA (qwen2.5:3b, ~2 GB)"
ollama pull qwen2.5:3b

Passo "5/6 Criando o personagem na IA"
Push-Location $Src
& $Python personagem.py aplicar

Passo "6/6 Conferindo"
& $Python diagnostico.py
Pop-Location

Write-Host "`nPRONTO! Agora de 2 cliques em TESTAR_VOZ.bat e depois em CONVERSAR_TECLADO.bat" -ForegroundColor Green
