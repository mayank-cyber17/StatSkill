Write-Host "=== StatIQ Backend Startup ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"

if (-not (Test-Path ".\venv\Scripts\Activate.ps1")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

if (-not (Test-Path ".\.env")) {
    Write-Host "WARNING: .env file not found. Copying from .env.example" -ForegroundColor Red
    Copy-Item ".\.env.example" ".\.env"
    Write-Host "Please edit backend\.env and add your GEMINI_API_KEY" -ForegroundColor Red
}

Write-Host "Starting StatIQ Backend on http://localhost:8000 ..." -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
python run.py
