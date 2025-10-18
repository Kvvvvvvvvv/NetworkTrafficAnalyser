@echo off
REM Network Traffic Analyzer Setup and Run Script

echo Network Traffic Analyzer Setup Script
echo ====================================

REM Check if we're in the right directory
if not exist "backend" (
    echo Error: backend directory not found!
    echo Please run this script from the root NTA directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo Error: frontend directory not found!
    echo Please run this script from the root NTA directory.
    pause
    exit /b 1
)

echo 1. Setting up backend...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Error creating virtual environment. Make sure Python is installed.
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo Error activating virtual environment.
    pause
    exit /b 1
)

echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing Python dependencies.
    pause
    exit /b 1
)

echo 2. Setting up frontend...
cd ..\frontend

echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo Error installing Node.js dependencies. Make sure Node.js is installed.
    pause
    exit /b 1
)

echo Building frontend...
npm run build
if %errorlevel% neq 0 (
    echo Error building frontend.
    pause
    exit /b 1
)

echo 3. Starting application...
cd ..\backend

echo To start the application, run:
echo   cd backend
echo   call venv\Scripts\activate.bat
echo   python app.py
echo.
echo The application will be available at http://localhost:5000
echo.
echo Note: You may need to run this as administrator for packet capture to work.

pause