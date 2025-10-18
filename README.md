# Network Traffic Analyzer

A full-stack web application that monitors live network packets and displays real-time statistics in a dashboard.

## Features

- Live packet capture using Scapy
- Real-time statistics aggregation
- WebSocket communication between backend and frontend
- React dashboard with TailwindCSS styling
- Live traffic table display
- Protocol distribution pie chart
- Network traffic line chart

## Project Structure

```
NTA/
├── backend/
│   ├── app.py              # Flask application with packet capture
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
└── frontend/
    ├── src/                # React source code
    │   ├── components/     # React components
    │   ├── App.jsx         # Main application component
    │   └── main.jsx        # React entry point
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite configuration
    └── README.md           # Frontend documentation
```

## Prerequisites

- Python 3.7+
- Node.js 16+
- npm or yarn
- Administrative privileges (for packet capture)

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

## Running the Application

### Development Mode

1. Start the backend server:
   ```
   cd backend
   python app.py
   ```
   The backend will start on http://localhost:5000

2. In a separate terminal, start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```
   The frontend will start on http://localhost:3000

### Production Mode

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Start the backend server (it will automatically serve the frontend):
   ```
   cd backend
   python app.py
   ```
   The application will be available on http://localhost:5000

## Usage

1. Open your browser and navigate to the application URL
2. Select a network interface from the dropdown
3. Click "Start Capture" to begin monitoring network traffic
4. View real-time statistics in the dashboard
5. Click "Stop Capture" to stop monitoring

## API Endpoints

- `GET /api/interfaces` - List available network interfaces
- `POST /api/start_capture` - Start packet capture on specified interface
- `POST /api/stop_capture` - Stop packet capture
- `GET /api/stats` - Get current statistics

## WebSocket Events

- `connect` - Client connection established
- `disconnect` - Client disconnected
- `update_stats` - Real-time statistics updates (emitted every 2 seconds)
- `connection_status` - Connection status updates

## Components

### Backend (Python Flask)

- Packet capture using Scapy
- Statistics aggregation
- WebSocket communication with frontend
- REST API endpoints

### Frontend (React + TailwindCSS)

- Dashboard with real-time statistics
- Live traffic table
- Protocol distribution chart
- Network traffic chart
- Network interface selection

## Troubleshooting

### Common Issues

1. **Permission Error**: Packet capture requires administrative privileges. Run the application as administrator/root.

2. **Module Not Found**: Ensure all dependencies are installed:
   ```
   pip install -r backend/requirements.txt
   npm install
   ```

3. **Port Conflicts**: If ports 5000 or 3000 are in use, modify the configuration files to use different ports.

4. **Scapy Not Available**: On some systems, you may need to install Scapy separately:
   ```
   pip install scapy
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.