# Nexus Center: Industrial Zenith Setup
# 🔒 Host-Container SSL & Loopback Bridge

$ErrorActionPreference = "Stop"
$scriptDir = if ($MyInvocation.MyCommand.Definition) { Split-Path -Parent $MyInvocation.MyCommand.Definition } else { $PSScriptRoot }
if (!$scriptDir) { $scriptDir = $pwd.Path }
$projectRoot = Split-Path -Parent $scriptDir
$certPath = Join-Path $projectRoot "certs\localhost.crt"

Write-Host "`n[Nexus] Initiating Terminal_Bridge Protocol..." -ForegroundColor Cyan

# 1. SSL Trust Sequence
if (Test-Path $certPath) {
    Write-Host "[Nexus] Step 1: Injecting Localhost CRT into System Store..." -ForegroundColor Gray
    try {
        # Adds to Trusted Root Certification Authorities (Local Machine)
        certutil -addstore -f "Root" "$certPath" | Out-Null
        Write-Host "✅ SSL Trusted: Nexus Industrial Certificate." -ForegroundColor Green
    } catch {
        Write-Host "❌ FAILED: Please run terminal as Administrator to trust certificates." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  WARN: localhost.crt not found at $certPath. Skipping SSL trust." -ForegroundColor Yellow
}

# 2. WebView2 Loopback Sequence
Write-Host "[Nexus] Step 2: Harmonizing WebView2 Network Isolation..." -ForegroundColor Gray
try {
    CheckNetIsolation.exe LoopbackExempt -a -n="microsoft.win32webview2_8wekyb3d8bbwe" | Out-Null
    Write-Host "✅ Network Bridge: Loopback Exempted." -ForegroundColor Green
} catch {
    Write-Host "⚠️  Loopback Check skipped (Common if already set)." -ForegroundColor Yellow
}

Write-Host "[Nexus] HOST SYSTEMS: NOMINAL.`n" -ForegroundColor Cyan
