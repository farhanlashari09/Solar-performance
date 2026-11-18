@echo off
REM ============================================================================
REM   ☀️ SOLARCARE PLATFORM - ONE-CLICK LAUNCHER (Windows Batch) ☀️
REM ============================================================================
REM
REM   HOW TO RUN THIS PLATFORM:
REM   -------------------------------------------------------------------------
REM   1. Double click on this file ("run.bat") or "start.bat" in Windows Explorer,
REM      OR open Command Prompt / PowerShell here and type:
REM         .\run.bat
REM
REM   WHAT THIS SCRIPT DOES AUTOMATICALLY:
REM   -------------------------------------------------------------------------
REM   Step 1: Checks if Node.js is installed on your computer.
REM   Step 2: Checks if npm dependencies (node_modules) are present; if not,
REM           runs 'npm install' automatically.
REM   Step 3: Checks if environment configuration (.env) exists; if not,
REM           creates it from .env.example.
REM   Step 4: Compiles the frontend production bundle (if dist\ is missing).
REM   Step 5: Launches the Node.js backend server on port 5000 (serving both
REM           the API and the React frontend).
REM   Step 6: Automatically launches Google Chrome pointing to http://localhost:5000.
REM
REM   HOW TO STOP THE PLATFORM:
REM   -------------------------------------------------------------------------
REM   Press "Ctrl + C" inside this command window, then press 'Y' and Enter.
REM
REM   MANUAL TERMINAL RUNNING (OPTIONAL ALTERNATIVE):
REM   -------------------------------------------------------------------------
REM   If you prefer to run directly from PowerShell / CMD:
REM     npm install
REM     npm run build
REM     node server/index.js
REM     (Then open http://localhost:5000 in Chrome)
REM ============================================================================

title SolarCare Smart Solar Platform
cls

echo ============================================================================
echo                     ☀️ SOLARCARE SMART PLATFORM ☀️
echo ============================================================================
echo.

REM 1. Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js install nahi mila!
    echo Barah-e-karam https://nodejs.org se Node.js LTS install karein.
    echo Node.js install karne ke baad is file ko dobara run karein.
    echo.
    pause
    exit /b
)

REM 2. Check dependencies (node_modules)
if not exist "node_modules\" (
    echo [SETUP] Pehli dafa required packages install ho rahe hain, please wait...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install fail ho gaya. Internet connection check karein.
        pause
        exit /b
    )
)

REM 3. Check .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [CONFIG] .env configuration file create ho rahi hai...
        copy ".env.example" ".env" >nul
    )
)

echo [START] Platform start ho raha hai...
echo [INFO] Server chalu ho kar Google Chrome automatically open ho ga.
echo.

REM 4. Run unified platform orchestrator (starts server and opens Chrome when ready)
node start-platform.js

if %errorlevel% neq 0 (
    echo.
    echo [EXCEPTION] Koi masla paish aaya.
    echo Agar port 5000 pehle se use ho rahi hai to purane terminal band karein.
    echo Aap manual terminal se chalane ke liye ye command likhein:
    echo   node server/index.js
    echo.
    pause
)

pause
