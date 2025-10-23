@echo off
echo Network Traffic Analyzer - Setup Script
echo ======================================

echo Creating virtual environment...
python -m venv venv
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create virtual environment
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment
    exit /b 1
)

echo Installing Python dependencies...
pip install -r backend/requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Python dependencies
    exit /b 1
)

echo Installing Node.js dependencies...
cd frontend
npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Node.js dependencies
    exit /b 1
)

echo Building frontend...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Failed to build frontend
    exit /b 1
)

echo Setup complete!
echo.
echo To run the application, execute run.bat
echo Make sure to set your API keys as environment variables:
echo   IPINFO_TOKEN=your_ipinfo_token
echo   ABUSEIPDB_API_KEY=your_abuseipdb_key
pause