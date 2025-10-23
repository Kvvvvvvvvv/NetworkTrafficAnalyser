#!/bin/bash

echo "Network Traffic Analyzer - Run Script"
echo "==================================="

echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Failed to activate virtual environment"
    echo "Please run setup.sh first"
    exit 1
fi

echo "Starting Network Traffic Analyzer..."
echo "Make sure you're running this with sudo for packet capture!"
echo ""
echo "The application will be available at http://localhost:5000"
echo "Press Ctrl+C to stop the application"
echo ""

cd backend
python app.py