# 🌐 Network Traffic Analyzer (NTA)

A **Full-Stack Real-Time Network Monitoring Application** that captures live packets, analyzes them, and visualizes network statistics dynamically on a sleek dashboard.

Built with **Flask**, **Scapy**, **React**, and **TailwindCSS**, this project provides **real-time insights** into network traffic using **WebSockets** for live updates.

---

## 🚀 Features

- ✅ **Live Packet Capture** — Uses Scapy to capture and analyze packets in real-time  
- ✅ **Real-Time Dashboard** — Displays live traffic data with dynamic updates via WebSockets  
- ✅ **Protocol Distribution** — Pie chart visualization for different network protocols  
- ✅ **Network Activity Timeline** — Line chart showing network traffic trends  
- ✅ **Traffic Table View** — Displays detailed packet-level data instantly  
- ✅ **Interface Selection** — Choose from available network interfaces before capturing  
- ✅ **Full-Stack Integration** — Flask backend + React frontend with WebSocket communication  

---

## 🧠 Tech Stack

### **Backend**
- 🐍 Python (Flask)
- ⚙️ Scapy (Packet Capture)
- 🔌 Flask-SocketIO (Real-time WebSocket communication)
- 📊 Pandas (Data aggregation)

### **Frontend**
- ⚛️ React (Vite)
- 🎨 TailwindCSS (UI styling)
- 📈 Recharts (Data visualization)
- 🔄 Socket.IO Client (Real-time updates)

---

## 📁 Project Structure

NTA/
├── backend/
│ ├── app.py # Flask backend with Scapy and WebSocket logic
│ ├── requirements.txt # Python dependencies
│ └── README.md # Backend documentation
└── frontend/
├── src/
│ ├── components/ # React components (Charts, Tables, etc.)
│ ├── App.jsx # Main React application
│ └── main.jsx # React entry point
├── package.json # Frontend dependencies
├── vite.config.js # Vite configuration
└── README.md # Frontend documentation


---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.7+**
- **Node.js 16+**
- **npm** or **yarn**
- **Administrator / Root Access** (required for packet capture)

---




| Endpoint             | Method | Description                                |
| -------------------- | ------ | ------------------------------------------ |
| `/api/interfaces`    | GET    | List available network interfaces          |
| `/api/start_capture` | POST   | Start packet capture on selected interface |
| `/api/stop_capture`  | POST   | Stop current packet capture                |
| `/api/stats`         | GET    | Retrieve latest network statistics         |
