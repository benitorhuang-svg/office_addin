@echo off
TITLE Nexus Center - Industrial Zenith Starter
SETLOCAL EnableDelayedExpansion
SET "params=%*"
CD /d "%~dp0"

:: --- CLASSIC UAC ELEVATION SNIPPET (Rock-Solid Standard) ---
:: Verification if the user is currently an Administrator
FSUTIL dirty query %systemdrive% >nul 2>&1
if %errorLevel% neq 0 (
    echo [Nexus] Elevating for System Access...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "cmd.exe", "/c cd /d ""%~dp0"" && ""%~s0"" %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /b
)

:: --- INDUSTRIAL INITIALIZATION ---
COLOR 0B
echo ======================================================
echo   NEXUS CENTER: INDUSTRIAL ZENITH GATEWAY
echo ======================================================
echo.

:: 1. Host-Side Bridge (SSL Trust & WebView2 Fix)
echo [1/2] Initiating Host-Bridge Protocol (SSL & Network)...
echo [Nexus] Current Root: %cd%

:: Run PowerShell script with Bypass policy (using short path for script to avoid space errors)
powershell -ExecutionPolicy Bypass -File "scripts\trust-ssl.ps1"
if %errorLevel% neq 0 (
    echo [Nexus] ERROR: PowerShell execution failed.
    echo.
    pause
    exit /b 1
)

:: 2. Docker Orchestration (Industrial-Grade Purge & Lift)
echo.
echo [2/3] Cleaning stale sessions (Nexus_Force_Purge)...
docker-compose down --remove-orphans >nul 2>&1

echo [3/3] Orchestrating Docker Fleet (Lifting Linux Kernel)...
docker-compose up -d --build --remove-orphans --force-recreate
if %errorLevel% neq 0 (
    echo [Nexus] CRITICAL: Docker failed to start. 
    echo [Possible Root Causes]:
    echo 1. Docker Desktop is not RUNNING.
    echo 2. Port 4000 is occupied by another local app.
    echo 3. The build context is missing (ensure you are in the project root).
    echo.
    echo [Error Code]: %errorLevel%
    pause
    exit /b 1
)

:: 3. Station Onboarding (Auto-Pilot)
echo.
echo [Nexus] Waiting for Station_Warmup (5s)...
timeout /t 5 >nul

echo [Nexus] Launching Command Center...
start https://localhost:4000/monitor.html

echo.
echo ======================================================
echo   SYSTEM ONLINE: https://localhost:4000/monitor.html
echo ======================================================
echo.
echo [Nexus] Process Completed. You can minimize this window.
pause
