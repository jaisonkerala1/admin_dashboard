@echo off
echo ================================================
echo   Admin Dashboard Startup Script
echo ================================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo Creating .env.local file...
    (
        echo VITE_API_BASE_URL=http://localhost:5000/api
        echo VITE_ADMIN_SECRET_KEY=your-secure-admin-key-change-this-in-production
    ) > .env.local
    echo ✓ Created .env.local
    echo.
    echo IMPORTANT: Make sure VITE_ADMIN_SECRET_KEY matches your backend ADMIN_SECRET_KEY!
    echo.
    pause
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies... This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ✗ Failed to install dependencies
        echo   Please make sure Node.js and npm are installed
        pause
        exit /b 1
    )
    echo.
    echo ✓ Dependencies installed successfully!
    echo.
)

echo.
echo ================================================
echo   Starting Admin Dashboard...
echo ================================================
echo.
echo   Frontend will run on: http://localhost:3001
echo.
echo   Make sure your backend is running on port 5000!
echo.
echo   Press Ctrl+C to stop the server
echo ================================================
echo.

REM Start the dev server
call npm run dev

pause

