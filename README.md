# 🌐 Network Traffic Analyzer (NTA)

A **Full-Stack Real-Time Network Monitoring Application** that captures live packets, analyzes them intelligently, and visualizes dynamic network insights on a **cyber-themed dashboard**.

Built with **Flask**, **Scapy**, **React**, and **TailwindCSS**, this project offers live visualization, anomaly detection, and AI-powered insights — blending performance with aesthetic hacker vibes.  

---

## ⚙️ Tech Stack

**Backend:** Flask • Scapy • Flask-SocketIO • scikit-learn  
**Frontend:** React • TailwindCSS • Recharts • Framer Motion  
**Database (optional):** SQLite (for session logs)  
**APIs:** geoip2 / ipinfo.io (for GeoIP mapping), AbuseIPDB (for threat checks)

---

## 🚀 Features

### 🧠 1. AI-Based Traffic Anomaly Detection
Detect unusual network patterns using a lightweight ML model (`IsolationForest` / `OneClassSVM`).  
Packets are automatically categorized as:
- 🟢 **Normal**
- 🟠 **Suspicious**
- 🔴 **Malicious**

Includes a “Threat Insights” panel summarizing alerts in real-time.

---

### 📊 2. Interactive Real-Time Charts
Live traffic updates rendered with **Recharts**:
- 📈 Protocol distribution (TCP/UDP/ICMP)
- 🌐 Top source & destination IPs
- ⚡ Packet rate timeline
Smooth animations powered by **Framer Motion** for every data refresh.

---

### 🗺️ 3. GeoIP Tracking
Visualize live traffic on a world map 🌍  
Each packet source is mapped to its geographic location via `geoip2` or `ipinfo.io`.  
Includes hover tooltips with country name, IP, and packet count.

---

### 🕵️ 4. Threat Intelligence Integration
Integrates with **AbuseIPDB / VirusTotal** APIs to check if an IP is malicious.  
Displays red alert icons 🔴 next to known threats and highlights dangerous regions on the map.

---

### 🔍 5. Advanced Packet Filtering & Search
Easily filter live packets by:
- Protocol (TCP/UDP/ICMP/HTTP)
- Source/Destination IP
- Port number or time range  
Built-in query bar enables instant results with smooth visual feedback.

---

### 💾 6. Session Capture & Export
Start / Stop packet capture with a single click.  
Export sessions as:
- `.pcap` — for Wireshark analysis  
- `.csv` — for data logging  
Each saved session gets timestamped and can be reloaded anytime.

---

### 🌑 7. Dark Cyberpunk UI
A futuristic dark dashboard with **neon green accents**, **animated grids**, and **terminal-inspired typography** (`JetBrains Mono`).  
Smooth transitions and particle backgrounds create an immersive “hacker console” vibe.

---

## 🧩 System Architecture

The **Network Traffic Analyzer (NTA)** follows a modular full-stack architecture — integrating live packet capture, intelligent analysis, and dynamic visualization through WebSockets.

                  ┌────────────────────────────┐
                  │        Frontend UI          │
                  │────────────────────────────│
                  │  React + TailwindCSS        │
                  │  Recharts + Framer Motion   │
                  │                            │
                  │ • Displays real-time charts │
                  │ • Handles filtering/search  │
                  │ • Shows GeoIP map & alerts  │
                  │ • Communicates via WebSocket│
                  └──────────────┬──────────────┘
                                 │
                      🔁 Real-Time Data Stream
                                 │
                  ┌──────────────┴──────────────┐
                  │         Backend API          │
                  │────────────────────────────│
                  │  Flask + Flask-SocketIO     │
                  │  Scapy + scikit-learn       │
                  │                            │
                  │ • Captures live packets     │
                  │ • Extracts key features     │
                  │ • Performs anomaly detection│
                  │ • Enriches data with GeoIP  │
                  │ • Checks IPs via Threat APIs│
                  │ • Emits JSON payload to UI  │
                  └──────────────┬──────────────┘
                                 │
                      🔁 Data Storage / Logs
                                 │
                  ┌──────────────┴──────────────┐
                  │         Data Layer           │
                  │────────────────────────────│
                  │   SQLite / CSV / PCAP       │
                  │                            │
                  │ • Stores captured sessions  │
                  │ • Maintains threat logs     │
                  │ • Supports export features  │
                  └──────────────┬──────────────┘
                                 │
                        🧠 Machine Learning Model
                                 │
                  ┌──────────────┴──────────────┐
                  │    AI Anomaly Detector      │
                  │────────────────────────────│
                  │  IsolationForest / SVM      │
                  │                            │
                  │ • Learns normal patterns    │
                  │ • Flags suspicious activity │
                  │ • Sends threat level alerts │
                  └────────────────────────────┘



---

## 🧠 How It Works

1. **Scapy** captures live packets from the network interface.  
2. **Flask-SocketIO** streams data to the frontend in real-time.  
3. The **AI model** classifies packet activity into normal/suspicious/malicious.  
4. **GeoIP + Threat APIs** enrich packet metadata.  
5. **React dashboard** visualizes everything dynamically.

---

## 🧰 Installation & Setup

### 🔹 Prerequisites
- Python 3.9+
- Node.js 16+
- `pip` & `npm` installed

### 🔹 Backend Setup
```bash
git clone https://github.com/Kvvvvvvvvv/NetworkTrafficAnalyser.git
cd NetworkTrafficAnalyser/backend
pip install -r requirements.txt
python app.py


🧠 Future Enhancements

🧬 Deep learning model for traffic classification

🔐 Role-based dashboard access (Admin / Analyst)

🗄️ Cloud packet storage and remote monitoring

📡 Integration with firewall logs

📱 Mobile-responsive interface

🧰 Plugin support for custom analyzers

🎨 UI Preview (Coming Soon)

A cyberpunk dashboard interface with neon aesthetics, animated graphs, and a “Threat Matrix” panel.

🤝 Contributing

Pull requests are welcome!
For major changes, please open an issue first to discuss what you’d like to modify or add.

🛡️ License

This project is licensed under the MIT License — free to use and modify with attribution.

✨ Author

Developed by: Kvvvvvvvvv

Made with 💻, ☕, and Cyber Vibes

