# ============================================
# JobHunter AI — Dev Environment Starter
# Run from project root: .\scripts\start-dev.ps1
# ============================================

`$ErrorActionPreference = "Stop"
`$ROOT = Split-Path -Parent `$PSScriptRoot

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  JobHunter AI — Starting Dev Services" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# --- 1. AI Service (Python) ---
Write-Host "[1/3] Starting AI Service (port 8001)..." -ForegroundColor Yellow
`$aiPath = Join-Path `$ROOT "services\ai-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '`$aiPath'
    .\venv\Scripts\activate
    Write-Host 'AI Service starting...' -ForegroundColor Green
    python -m uvicorn app.main:app --reload --port 8001
"@

Start-Sleep -Seconds 3

# --- 2. API Gateway (Go) ---
Write-Host "[2/3] Starting API Gateway (port 8080)..." -ForegroundColor Yellow
`$gwPath = Join-Path `$ROOT "services\api-gateway"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '`$gwPath'
    `$env:GOTOOLCHAIN = 'local'
    `$env:AI_SERVICE_URL = 'http://localhost:8001'
    Write-Host 'API Gateway starting...' -ForegroundColor Green
    .\api-gateway.exe
"@

Start-Sleep -Seconds 2

# --- 3. Frontend (Next.js) ---
Write-Host "[3/3] Starting Frontend (port 3000)..." -ForegroundColor Yellow
`$webPath = Join-Path `$ROOT "apps\web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '`$webPath'
    Write-Host 'Frontend starting...' -ForegroundColor Green
    npm run dev
"@

Start-Sleep -Seconds 5

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  All services launched!" -ForegroundColor Green
Write-Host "  AI Service:  http://127.0.0.1:8001" -ForegroundColor White
Write-Host "  API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green
