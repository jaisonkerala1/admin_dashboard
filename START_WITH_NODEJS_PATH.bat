@echo off
echo ================================================
echo   Admin Dashboard - Starting with Node.js Path
echo ================================================
echo.

REM Add Node.js to PATH temporarily
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Check if .env.local exists
if not exist .env.local (
    echo Creating .env.local file...
    (
        echo VITE_API_BASE_URL=http://localhost:5000/api
        echo VITE_ADMIN_SECRET_KEY=your-secure-admin-key-change-this-in-production
    ) > .env.local
    echo ✓ Created .env.local
    echo.
    echo IMPORTANT: Make sure VITE_ADMIN_SECRET_KEY matches your backend!
    echo.
    pause
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies... This will take 2-3 minutes...
    echo.
    npm install
    if errorlevel 1 (
        echo.
        echo ✗ Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
    echo ✓ Dependencies installed!
    echo.
)

echo.
echo ================================================
echo   Starting Admin Dashboard...
echo ================================================
echo.
echo   URL: http://localhost:3001
echo   Make sure backend is running on port 5000!
echo.
echo   Press Ctrl+C to stop
echo ================================================
echo.

npm run dev

pause

