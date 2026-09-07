@echo off
echo ===================================================
echo   StatIQ - AI Skill Intelligence Platform
echo ===================================================
echo.
echo Starting StatIQ Backend on http://localhost:8000 ...
start "StatIQ Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe run.py"

timeout /t 3 /nobreak >nul

echo Starting StatIQ Frontend on http://localhost:5173 ...
start "StatIQ Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Platform URLs:
echo   - Web UI:   http://localhost:5173
echo   - API Docs: http://localhost:8000/docs
echo ===================================================
echo.
pause
