@echo off
REM Network Traffic Analyzer Run Script

echo Network Traffic Analyzer Run Script
echo ================================

REM Check if we're in the right directory
if not exist "backend" (
    echo Error: backend directory not found!
    echo Please run this script from the root NTA directory.
    pause
    exit /b 1
)

echo Starting backend server...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Error: Virtual environment not found!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting Flask server...
echo The application will be available at http://localhost:5000
echo Press Ctrl+C to stop the server
python app.py