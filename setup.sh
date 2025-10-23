#!/bin/bash

echo "Network Traffic Analyzer - Setup Script"
echo "======================================"

echo "Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "Failed to create virtual environment"
    exit 1
fi

echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Failed to activate virtual environment"
    exit 1
fi

echo "Installing Python dependencies..."
pip install -r backend/requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install Python dependencies"
    exit 1
fi

echo "Installing Node.js dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install Node.js dependencies"
    exit 1
fi

echo "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build frontend"
    exit 1
fi

echo "Setup complete!"
echo ""
echo "To run the application, execute run.sh"
echo "Make sure to set your API keys as environment variables:"
echo "  export IPINFO_TOKEN=your_ipinfo_token"
echo "  export ABUSEIPDB_API_KEY=your_abuseipdb_key"