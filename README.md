🌐 Network Traffic Analyzer (NTA)

A Full-Stack Real-Time Network Monitoring Application that captures live packets, analyzes them, and visualizes network statistics dynamically on a sleek dashboard.

Built with Flask, Scapy, React, and TailwindCSS, this project provides real-time insights into network traffic using WebSockets for live updates.

🚀 Features

✅ Live Packet Capture — Uses Scapy to capture and analyze packets in real-time
✅ Real-Time Dashboard — Displays live traffic data with dynamic updates via WebSockets
✅ Protocol Distribution — Pie chart visualization for different network protocols
✅ Network Activity Timeline — Line chart showing network traffic trends
✅ Traffic Table View — Displays detailed packet-level data instantly
✅ Interface Selection — Choose from available network interfaces before capturing
✅ Full-Stack Integration — Flask backend + React frontend with WebSocket communication

🧠 Tech Stack
Backend

🐍 Python (Flask)

⚙️ Scapy (Packet Capture)

🔌 Flask-SocketIO (Real-time WebSocket communication)

📊 Pandas (Data aggregation)

Frontend

⚛️ React (Vite)

🎨 TailwindCSS (UI styling)

📈 Recharts (Data visualization)

🔄 Socket.IO Client (Real-time updates)

📁 Project Structure
NTA/
├── backend/
│   ├── app.py              # Flask backend with Scapy and WebSocket logic
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
└── frontend/
    ├── src/
    │   ├── components/     # React components (Charts, Tables, etc.)
    │   ├── App.jsx         # Main React application
    │   └── main.jsx        # React entry point
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite configuration
    └── README.md           # Frontend documentation

⚙️ Prerequisites

Before you begin, ensure you have the following installed:

Python 3.7+

Node.js 16+

npm or yarn

Administrator / Root Access (required for packet capture)

🧩 Installation Guide
🔹 Backend Setup
cd backend
python -m venv venv


Activate the environment:

Windows:

venv\Scripts\activate


macOS/Linux:

source venv/bin/activate


Install dependencies:

pip install -r requirements.txt

🔹 Frontend Setup
cd frontend
npm install

🏃 Running the Application
🔧 Development Mode

Start Backend:

cd backend
python app.py


→ Runs on http://localhost:5000

Start Frontend (in a new terminal):

cd frontend
npm run dev


→ Runs on http://localhost:3000

🚀 Production Mode

Build Frontend:

cd frontend
npm run build


Run Backend (serves built frontend):

cd backend
python app.py


→ Access via http://localhost:5000

📊 Dashboard Overview

Network Interface Selector — Choose interface before capture

Live Packet Capture Controls — Start/Stop buttons

Real-Time Statistics — Auto-updating traffic overview

Protocol Pie Chart — Visualizes distribution (TCP, UDP, ICMP, etc.)

Traffic Line Chart — Monitors bandwidth trends

Live Packet Table — Displays ongoing packet data

🌐 API Endpoints
Endpoint	Method	Description
/api/interfaces	GET	List available network interfaces
/api/start_capture	POST	Start packet capture on selected interface
/api/stop_capture	POST	Stop current packet capture
/api/stats	GET	Retrieve latest network statistics
🔄 WebSocket Events
Event	Direction	Description
connect	Client → Server	WebSocket connection established
disconnect	Client → Server	WebSocket disconnected
update_stats	Server → Client	Sends live statistics (every 2 seconds)
connection_status	Server → Client	Updates current connection state
🧰 Troubleshooting
Issue	Possible Cause	Solution
Permission Denied	Scapy requires root/admin privileges	Run as Administrator or use sudo
Module Not Found	Missing dependencies	pip install -r requirements.txt or npm install
Port Conflict	Port 5000/3000 already in use	Update Flask or Vite config
Scapy Not Available	OS dependency issue	Run pip install scapy manually
🧑‍💻 Contributing

Fork the repository

Create a new branch:

git checkout -b feature/your-feature-name


Commit your changes:

git commit -m "Add: new feature"


Push the branch:

git push origin feature/your-feature-name


Create a Pull Request

📜 License

This project is licensed under the MIT License.
See the LICENSE
 file for more details.

💡 Future Enhancements

🔍 Advanced packet filtering options

📈 Historical data storage (SQLite / MongoDB)

🧠 AI-based anomaly detection

📡 Multi-interface capture

🔔 Alert system for suspicious activity
