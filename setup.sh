#!/bin/bash

# Network Traffic Analyzer Setup and Run Script

echo "Network Traffic Analyzer Setup Script"
echo "===================================="

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found!"
    echo "Please run this script from the root NTA directory."
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "Error: frontend directory not found!"
    echo "Please run this script from the root NTA directory."
    exit 1
fi

echo "1. Setting up backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error creating virtual environment. Make sure Python is installed."
        exit 1
    fi
fi

echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Error activating virtual environment."
    exit 1
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error installing Python dependencies."
    exit 1
fi

echo "2. Setting up frontend..."
cd ../frontend

echo "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error installing Node.js dependencies. Make sure Node.js is installed."
    exit 1
fi

echo "Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error building frontend."
    exit 1
fi

echo "3. Starting application..."
cd ../backend

echo "To start the application, run:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""
echo "The application will be available at http://localhost:5000"
echo ""
echo "Note: You may need to run this with sudo for packet capture to work."

read -p "Press Enter to continue..."