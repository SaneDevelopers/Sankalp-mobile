# ─── Sankalp Dev Launcher ───────────────────────────────────────────
# Run both API server (port 5000) and Expo Mobile in a single command.
# Usage:  .\dev.ps1
# ────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Yellow
Write-Host "      Sankalp Dev Launcher" -ForegroundColor Yellow
Write-Host "  ========================================" -ForegroundColor Yellow
Write-Host ""

# Load .env file into current process environment
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $eqIdx = $line.IndexOf("=")
            if ($eqIdx -gt 0) {
                $key = $line.Substring(0, $eqIdx).Trim()
                $val = $line.Substring($eqIdx + 1).Trim()
                [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
    Write-Host "  [OK] Loaded .env" -ForegroundColor Green
} else {
    Write-Host "  [!!] .env file not found!" -ForegroundColor Red
}

$env:PORT = "5001"
Write-Host "  [OK] API Server will run on port 5001" -ForegroundColor Green
Write-Host ""

# Create a temp script for the API server window
$tempScript = Join-Path $env:TEMP "sankalp-api-start.ps1"
@"
Set-Location '$PSScriptRoot'
`$envFile = '.env'
Get-Content `$envFile | ForEach-Object {
    `$line = `$_.Trim()
    if (`$line -and -not `$line.StartsWith('#')) {
        `$eqIdx = `$line.IndexOf('=')
        if (`$eqIdx -gt 0) {
            `$key = `$line.Substring(0, `$eqIdx).Trim()
            `$val = `$line.Substring(`$eqIdx + 1).Trim()
            [System.Environment]::SetEnvironmentVariable(`$key, `$val, 'Process')
        }
    }
}
`$env:PORT = '5001'
Write-Host ''
Write-Host '  API Server starting on port 5001...' -ForegroundColor Green
Write-Host ''
npx pnpm@9 --filter @workspace/api-server run dev
"@ | Set-Content $tempScript

# Launch API server in a new PowerShell window
Write-Host "  Starting API Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", $tempScript

# Small delay to let the API start building
Start-Sleep -Seconds 3

# Launch Expo in the current terminal
Write-Host "  Starting Expo Mobile..." -ForegroundColor Cyan
Write-Host ""
npx pnpm@9 --filter @workspace/mobile exec expo start --clear
