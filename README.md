# Network Traffic Analyzer v2.0 - Cyberpunk Edition

A cutting-edge network monitoring and analysis tool with a futuristic cyberpunk aesthetic, powered by Flask, React, and advanced cybersecurity technologies.

## Features

### 🤖 AI-Based Traffic Anomaly Detection
- Machine learning-powered anomaly detection using Isolation Forest algorithm
- Real-time identification of suspicious network behavior
- Visual threat indicators with color-coded status badges (🟢 Normal / 🟠 Suspicious / 🔴 Malicious)

### 🌐 Interactive Real-Time Charts
- Dynamic visualizations using Recharts
- Smooth animations with Framer Motion
- Protocol distribution, traffic patterns, and top talkers visualization

### 🌍 GeoIP Tracking
- IP geolocation with ipinfo.io integration
- Interactive world map visualization using react-simple-maps
- Glowing markers for active connections

### 🛡️ Threat Intelligence Integration
- AbuseIPDB and VirusTotal API integration
- Real-time blacklisted IP detection
- Threat severity scoring and reporting

### 🔍 Advanced Packet Filtering & Search
- Dynamic filtering by IP, protocol, port, and packet size
- Time-based filtering options
- Real-time filtered view updates

### 📦 Session Capture & Export
- Start/Stop capture functionality
- Export sessions as PCAP or CSV files
- Neon pulse notifications for session events

### 🖤 Cyberpunk UI Theme
- Dark theme with neon green, blue, and purple accents
- Terminal-style JetBrains Mono font
- Animated particle background with glowing effects
- Matrix-inspired grid overlay
- Cyberpunk boot animation sequence

## Technology Stack

### Backend
- **Python 3.7+** - Core language
- **Flask** - Web framework
- **Scapy** - Packet capture and analysis
- **Scikit-learn** - Machine learning for anomaly detection
- **SQLite** - Data storage
- **ipinfo** - GeoIP services

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **react-simple-maps** - GeoIP visualization

## Installation

### Prerequisites
- Python 3.7+
- Node.js 16+
- Administrative privileges for packet capture

### Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Set API keys (optional but recommended)
export IPINFO_TOKEN="your_ipinfo_token"
export ABUSEIPDB_API_KEY="your_abuseipdb_key"
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

## Usage

### Development Mode
```bash
# Start backend (in one terminal)
cd backend
python app.py

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves frontend)
cd backend
python app.py
```

### Automated Scripts
- **Windows**: Run `setup.bat` to install dependencies, `run.bat` to start the application
- **Linux/Mac**: Run `setup.sh` to install dependencies, `run.sh` to start the application

## API Endpoints

### Backend API
- `GET /api/interfaces` - List available network interfaces
- `POST /api/start_capture` - Start packet capture
- `POST /api/stop_capture` - Stop packet capture
- `GET /api/stats` - Get current statistics
- `POST /api/set_filters` - Set packet filters
- `POST /api/disable_filters` - Disable packet filters
- `GET /api/get_geoip_data` - Get GeoIP data
- `GET /api/threat_intel_status` - Get threat intelligence status
- `POST /api/check_ip` - Manually check IP against threat feeds
- `GET /api/export_session` - Export capture session

## WebSocket Events

- `connect` - Client connected
- `disconnect` - Client disconnected
- `update_stats` - Statistics update
- `alert` - Security alert

## Configuration

### Environment Variables
- `IPINFO_TOKEN` - ipinfo.io API token for GeoIP services
- `ABUSEIPDB_API_KEY` - AbuseIPDB API key for threat intelligence
- `VIRUSTOTAL_API_KEY` - VirusTotal API key for threat intelligence

## Project Structure

```
NTA/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── nta_data.db         # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # TailwindCSS configuration
├── setup.sh                # Setup script (Linux/Mac)
├── setup.bat               # Setup script (Windows)
├── run.sh                  # Run script (Linux/Mac)
└── run.bat                 # Run script (Windows)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Scapy](https://scapy.net/) for packet manipulation
- [Flask](https://palletsprojects.com/p/flask/) for the web framework
- [React](https://reactjs.org/) for the frontend library
- [TailwindCSS](https://tailwindcss.com/) for styling
- [ipinfo](https://ipinfo.io/) for GeoIP services
- [AbuseIPDB](https://www.abuseipdb.com/) for threat intelligence