# Network Traffic Analyzer - Backend

This is the backend component of the Network Traffic Analyzer application built with Python Flask.

## Features

- Live packet capture using Scapy
- Real-time statistics aggregation
- WebSocket communication with frontend
- Network interface detection

## Requirements

- Python 3.7+
- Required packages listed in [requirements.txt](requirements.txt)

## Installation

1. Install required packages:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

```
python app.py
```

The backend will start on http://localhost:5000

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