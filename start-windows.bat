@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 20+ is required. Install from https://nodejs.org/
 pause
 exit /b 1
)
if not exist node_modules (
 echo Installing application dependencies...
 call npm install
 if errorlevel 1 (pause & exit /b 1)
)
if not exist .env copy .env.example .env >nul
start "" http://localhost:5173
echo Starting AviNivesh Pro 2.0 - browser address: http://localhost:5173
call npm run dev
pause
