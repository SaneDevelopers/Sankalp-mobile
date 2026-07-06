@echo off
echo.
echo   ========================================
echo       Sankalp Dev Launcher
echo   ========================================
echo.

:: Load .env into environment
for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env") do (
    set "line=%%A"
    if not "!line:~0,1!"=="#" (
        set "%%A=%%B"
    )
)

:: Set PORT
set PORT=5001
echo   [OK] Loaded .env
echo   [OK] API Server will run on port 5001
echo.

:: Start API server in a new CMD window
echo   Starting API Server...
start "Sankalp API Server" cmd /k "cd /d %~dp0 && set PORT=5001 && set DATABASE_URL=postgresql://postgres:acfzumBJbDXBNZqo@db.gypelfezbulqzgsntsfa.supabase.co:5432/postgres && set JWT_SECRET=sankalp-dev-secret-key-123456 && set SUPABASE_URL=https://gypelfezbulqzgsntsfa.supabase.co && set SUPABASE_JWT_SECRET=your-supabase-jwt-secret-here && npx pnpm@9 --filter @workspace/api-server run dev"

:: Wait a moment for API to start building
timeout /t 3 /nobreak >nul

:: Start Expo in current window
echo   Starting Expo Mobile...
echo.
npx pnpm@9 --filter @workspace/mobile exec expo start --clear
