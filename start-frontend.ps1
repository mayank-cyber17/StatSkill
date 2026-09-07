Write-Host "=== StatIQ Frontend Startup ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"

if (-not (Test-Path ".\node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting StatIQ Frontend on http://localhost:5173 ..." -ForegroundColor Green
npm run dev
