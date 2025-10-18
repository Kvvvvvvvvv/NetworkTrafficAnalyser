#!/bin/bash

# Network Traffic Analyzer Run Script

echo "Network Traffic Analyzer Run Script"
echo "================================"

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found!"
    echo "Please run this script from the root NTA directory."
    exit 1
fi

echo "Starting backend server..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please run setup.sh first."
    exit 1
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Starting Flask server..."
echo "The application will be available at http://localhost:5000"
echo "Press Ctrl+C to stop the server"
python app.py