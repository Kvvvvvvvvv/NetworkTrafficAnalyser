@echo off
echo Network Traffic Analyzer - Run Script
echo ====================================

echo Activating virtual environment...
call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    echo Please run setup.bat first
    pause
    exit /b 1
)

echo Starting Network Traffic Analyzer...
echo Make sure you're running this as Administrator for packet capture!
echo.
echo The application will be available at http://localhost:5000
echo Press Ctrl+C to stop the application
echo.

cd backend
python app.py