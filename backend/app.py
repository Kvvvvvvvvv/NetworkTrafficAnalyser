import os
import json
import time
import threading
from collections import defaultdict
from datetime import datetime
import sqlite3
from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from flask_socketio import SocketIO, emit
import psutil
import numpy as np
import requests
import csv
from io import StringIO

# Try to import scapy, but handle if it's not available
try:
    from scapy.all import sniff
    from scapy.layers.inet import IP, TCP, UDP, ICMP
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False
    # Define dummy classes for when scapy is not available
    class IP:
        pass
    class TCP:
        pass
    class UDP:
        pass
    class ICMP:
        pass
    sniff = None
    print("Scapy not available, packet capture will not work")

# Try to import scikit-learn for anomaly detection
try:
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    IsolationForest = None
    StandardScaler = None
    print("Scikit-learn not available, anomaly detection will not work")

# Try to import ipinfo for GeoIP tracking
IPINFO_AVAILABLE = False
ipinfo_handler = None

try:
    ipinfo = __import__('ipinfo')
    IPINFO_AVAILABLE = True
    # Initialize ipinfo handler (you need to get a token from ipinfo.io)
    ipinfo_token = os.environ.get('IPINFO_TOKEN', 'YOUR_IPINFO_TOKEN_HERE')
    ipinfo_handler = ipinfo.getHandler(ipinfo_token) if ipinfo_token != 'YOUR_IPINFO_TOKEN_HERE' else None
except (ImportError, Exception):
    print("ipinfo not available, GeoIP tracking will not work")

# Flask app initialization
app = Flask(__name__)
app.config['SECRET_KEY'] = 'network-traffic-analyzer-secret'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables for packet capture and statistics
packet_stats = {
    'total_packets': 0,
    'total_bytes': 0,
    'protocols': defaultdict(int),
    'ips': defaultdict(lambda: {'sent': 0, 'received': 0, 'bytes': 0}),
    'top_talkers': [],
    'packet_history': [],
    'filtered_packets': [],  # For storing filtered packets
    'anomalies': [],  # For storing detected anomalies
    'geoip_data': {}  # For storing GeoIP information
}

# Anomaly detection model
anomaly_detector = None
anomaly_scaler = None
anomaly_data_buffer = []
anomaly_detection_enabled = True

# Packet filtering configuration
packet_filters = {
    'ip_filter': None,  # Filter by specific IP
    'protocol_filter': None,  # Filter by protocol (TCP, UDP, ICMP, etc.)
    'port_filter': None,  # Filter by port number
    'size_filter': {'min': 0, 'max': float('inf')}  # Filter by packet size
}

# Alert configuration
alerts_config = {
    'high_traffic_threshold': 1000,  # packets per second
    'suspicious_ips': set(),  # Set of IPs to watch
    'enabled': True
}

# Threat intelligence configuration
THREAT_INTEL_CONFIG = {
    'abuseipdb_api_key': os.environ.get('ABUSEIPDB_API_KEY', ''),
    'virustotal_api_key': os.environ.get('VIRUSTOTAL_API_KEY', ''),
    'enabled': True,
    'cache_duration': 3600  # 1 hour
}

# Threat intelligence cache
threat_intel_cache = {}

# Database setup
def init_database():
    """Initialize SQLite database for historical data storage"""
    conn = sqlite3.connect('nta_data.db')
    cursor = conn.cursor()
    
    # Create tables for storing historical data
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS packets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL,
            src_ip TEXT,
            dst_ip TEXT,
            protocol INTEGER,
            size INTEGER,
            interface TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS statistics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL,
            total_packets INTEGER,
            total_bytes INTEGER,
            protocols TEXT,
            top_talkers TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL,
            alert_type TEXT,
            message TEXT,
            severity TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize anomaly detection model
def init_anomaly_detector():
    """Initialize the anomaly detection model"""
    global anomaly_detector, anomaly_scaler
    if SKLEARN_AVAILABLE and IsolationForest is not None and StandardScaler is not None:
        anomaly_detector = IsolationForest(contamination='auto', random_state=42)
        anomaly_scaler = StandardScaler()
        print("Anomaly detection model initialized")
    else:
        anomaly_detector = None
        anomaly_scaler = None
        print("Scikit-learn not available, anomaly detection disabled")

# Initialize database on startup
init_database()
init_anomaly_detector()

# Lock for thread-safe operations
stats_lock = threading.Lock()

# Flag to control packet capture
capture_running = False
capture_thread = None
capture_interfaces = []  # For multi-interface capture

# Session capture variables
capture_sessions = {}
current_session = None
session_packets = []

def get_network_interfaces():
    """Get list of available network interfaces"""
    interfaces = []
    for interface, addrs in psutil.net_if_addrs().items():
        interfaces.append(interface)
    return interfaces

def packet_matches_filters(packet):
    """Check if a packet matches the current filters"""
    if not packet_filters.get('enabled', False):
        return True  # No filtering enabled
    
    # Size filter
    packet_size = len(packet)
    size_filter = packet_filters.get('size_filter', {'min': 0, 'max': float('inf')})
    if not (size_filter['min'] <= packet_size <= size_filter['max']):
        return False
    
    # IP filter
    ip_filter = packet_filters.get('ip_filter')
    if ip_filter and IP in packet:
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        if ip_filter not in [src_ip, dst_ip]:
            return False
    
    # Protocol filter
    protocol_filter = packet_filters.get('protocol_filter')
    if protocol_filter and IP in packet:
        protocol = packet[IP].proto
        # Map protocol names to numbers (simplified)
        protocol_map = {'TCP': 6, 'UDP': 17, 'ICMP': 1}
        if protocol_filter in protocol_map:
            if protocol != protocol_map[protocol_filter]:
                return False
        elif isinstance(protocol_filter, int) and protocol != protocol_filter:
            return False
    
    # Port filter (for TCP/UDP)
    port_filter = packet_filters.get('port_filter')
    if port_filter and IP in packet:
        if TCP in packet and (packet[TCP].sport == port_filter or packet[TCP].dport == port_filter):
            return True
        elif UDP in packet and (packet[UDP].sport == port_filter or packet[UDP].dport == port_filter):
            return True
        else:
            return False
    
    return True

def check_ip_threat_intel(ip):
    """Check if an IP is flagged in threat intelligence feeds"""
    global threat_intel_cache
    
    # Check cache first
    if ip in threat_intel_cache:
        cached_entry = threat_intel_cache[ip]
        if time.time() - cached_entry['timestamp'] < THREAT_INTEL_CONFIG['cache_duration']:
            return cached_entry['threat_info']
    
    # If not in cache or expired, check threat feeds
    threat_info = {
        'ip': ip,
        'is_malicious': False,
        'threat_type': None,
        'reports': 0,
        'risk_score': 0
    }
    
    # Check AbuseIPDB if API key is provided
    if THREAT_INTEL_CONFIG['abuseipdb_api_key']:
        try:
            headers = {
                'Key': THREAT_INTEL_CONFIG['abuseipdb_api_key'],
                'Accept': 'application/json'
            }
            params = {
                'ipAddress': ip,
                'maxAgeInDays': 90
            }
            response = requests.get('https://api.abuseipdb.com/api/v2/check', 
                                  headers=headers, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                abuse_confidence_score = data['data']['abuseConfidenceScore']
                total_reports = data['data']['totalReports']
                
                if abuse_confidence_score > 70:
                    threat_info['is_malicious'] = True
                    threat_info['threat_type'] = 'High Abuse Confidence'
                    threat_info['risk_score'] = abuse_confidence_score
                    threat_info['reports'] = total_reports
                elif abuse_confidence_score > 40:
                    threat_info['threat_type'] = 'Medium Abuse Confidence'
                    threat_info['risk_score'] = abuse_confidence_score
                    threat_info['reports'] = total_reports
        except Exception as e:
            print(f"Error checking AbuseIPDB for {ip}: {e}")
    
    # Cache the result
    threat_intel_cache[ip] = {
        'threat_info': threat_info,
        'timestamp': time.time()
    }
    
    return threat_info

def get_geoip_info(ip):
    """Get GeoIP information for an IP address"""
    global ipinfo_handler
    
    if not IPINFO_AVAILABLE or ipinfo_handler is None:
        return None
    
    try:
        # Check if we already have this IP's info cached
        if ip in packet_stats['geoip_data']:
            return packet_stats['geoip_data'][ip]
        
        # Get GeoIP info
        details = ipinfo_handler.getDetails(ip)
        
        geo_info = {
            'ip': ip,
            'country': details.country_name if hasattr(details, 'country_name') else 'Unknown',
            'country_code': details.country if hasattr(details, 'country') else 'XX',
            'city': details.city if hasattr(details, 'city') else 'Unknown',
            'latitude': float(details.latitude) if hasattr(details, 'latitude') else 0.0,
            'longitude': float(details.longitude) if hasattr(details, 'longitude') else 0.0,
            'org': details.org if hasattr(details, 'org') else 'Unknown',
            'last_updated': time.time()
        }
        
        # Cache the info
        packet_stats['geoip_data'][ip] = geo_info
        return geo_info
    except Exception as e:
        print(f"Error getting GeoIP info for {ip}: {e}")
        return None

def packet_handler(packet):
    """Handle captured packets and update statistics"""
    global packet_stats, anomaly_data_buffer, session_packets, current_session
    
    # Only process if scapy is available
    if not SCAPY_AVAILABLE:
        return
    
    # Check if packet matches filters
    if not packet_matches_filters(packet):
        return
    
    # Store packet for session if capture is active
    if current_session:
        packet_info = {
            'timestamp': time.time(),
            'src': packet[IP].src if IP in packet else 'Unknown',
            'dst': packet[IP].dst if IP in packet else 'Unknown',
            'protocol': packet[IP].proto if IP in packet else 0,
            'size': len(packet),
            'raw': str(packet)  # Store raw packet data
        }
        session_packets.append(packet_info)
        
        # Limit session packets to 10000 to prevent memory issues
        if len(session_packets) > 10000:
            session_packets = session_packets[-10000:]
    
    with stats_lock:
        # Update total packet count
        packet_stats['total_packets'] += 1
        packet_size = len(packet)
        packet_stats['total_bytes'] += packet_size
        
        # Extract IP information if available
        if IP in packet:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            protocol = packet[IP].proto
            
            # Update protocol statistics
            packet_stats['protocols'][protocol] += 1
            
            # Update IP statistics
            packet_stats['ips'][src_ip]['sent'] += 1
            packet_stats['ips'][src_ip]['bytes'] += packet_size
            packet_stats['ips'][dst_ip]['received'] += 1
            packet_stats['ips'][dst_ip]['bytes'] += packet_size
            
            # Check threat intelligence for source IP
            if THREAT_INTEL_CONFIG['enabled']:
                threat_info = check_ip_threat_intel(src_ip)
                if threat_info['is_malicious']:
                    # Add to anomalies
                    anomaly = {
                        'type': 'THREAT_INTEL',
                        'message': f'Malicious IP detected: {src_ip} - {threat_info["threat_type"]}',
                        'severity': 'CRITICAL',
                        'timestamp': time.time(),
                        'ip': src_ip,
                        'threat_info': threat_info
                    }
                    packet_stats['anomalies'].append(anomaly)
            
            # Get GeoIP info for source IP
            if IPINFO_AVAILABLE and ipinfo_handler:
                get_geoip_info(src_ip)
            
            # Store packet information for history
            packet_info = {
                'timestamp': time.time(),
                'src': src_ip,
                'dst': dst_ip,
                'protocol': protocol,
                'size': packet_size
            }
            packet_stats['packet_history'].append(packet_info)
            
            # Add to anomaly detection buffer
            anomaly_data_buffer.append([
                packet_size,
                protocol,
                time.time()
            ])
            
            # Keep only last 1000 packets in history
            if len(packet_stats['packet_history']) > 1000:
                packet_stats['packet_history'] = packet_stats['packet_history'][-1000:]
            
            # Keep only last 1000 data points for anomaly detection
            if len(anomaly_data_buffer) > 1000:
                anomaly_data_buffer = anomaly_data_buffer[-1000:]
            
            # Store in database for historical data
            try:
                conn = sqlite3.connect('nta_data.db')
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO packets (timestamp, src_ip, dst_ip, protocol, size, interface)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (time.time(), src_ip, dst_ip, protocol, packet_size, 
                      capture_interfaces[0] if capture_interfaces else 'default'))
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"Error storing packet in database: {e}")

def detect_anomalies_with_ai():
    """Detect anomalies using AI model"""
    global anomaly_detector, anomaly_scaler, anomaly_data_buffer, packet_stats
    
    if not anomaly_detection_enabled or not SKLEARN_AVAILABLE or anomaly_detector is None or anomaly_scaler is None or len(anomaly_data_buffer) < 10:
        return []
    
    try:
        # Convert buffer to numpy array
        data = np.array(anomaly_data_buffer[-100:])  # Use last 100 packets
        
        # Scale the data
        scaled_data = anomaly_scaler.fit_transform(data)
        
        # Predict anomalies
        predictions = anomaly_detector.fit_predict(scaled_data)
        
        # Find anomalous packets
        anomalies = []
        for i, pred in enumerate(predictions):
            if pred == -1:  # Anomaly detected
                packet_idx = len(anomaly_data_buffer) - len(predictions) + i
                if packet_idx >= 0 and packet_idx < len(packet_stats['packet_history']):
                    packet = packet_stats['packet_history'][packet_idx]
                    anomalies.append({
                        'type': 'AI_ANOMALY',
                        'message': f'Anomalous traffic detected from {packet.get("src", "Unknown")} to {packet.get("dst", "Unknown")}',
                        'severity': 'WARNING',
                        'timestamp': packet.get('timestamp', time.time()),
                        'packet_info': packet
                    })
        
        return anomalies
    except Exception as e:
        print(f"Error in AI anomaly detection: {e}")
        return []

def detect_simple_anomalies():
    """Simple anomaly detection based on traffic patterns"""
    anomalies = []
    
    with stats_lock:
        # Check for high traffic rate
        if len(packet_stats['packet_history']) >= 2:
            recent_packets = packet_stats['packet_history'][-10:]  # Last 10 packets
            if len(recent_packets) >= 2:
                time_diff = recent_packets[-1]['timestamp'] - recent_packets[0]['timestamp']
                if time_diff > 0:
                    pps = len(recent_packets) / time_diff
                    if pps > alerts_config['high_traffic_threshold']:
                        anomalies.append({
                            'type': 'HIGH_TRAFFIC',
                            'message': f'High traffic detected: {pps:.2f} packets/second',
                            'severity': 'WARNING',
                            'timestamp': time.time()
                        })
        
        # Check for suspicious IPs
        for ip in alerts_config['suspicious_ips']:
            if ip in packet_stats['ips']:
                anomalies.append({
                    'type': 'SUSPICIOUS_IP',
                    'message': f'Suspicious IP activity detected: {ip}',
                    'severity': 'ALERT',
                    'timestamp': time.time()
                })
    
    return anomalies

def periodic_stats_update():
    """Periodically send updated statistics to clients"""
    last_packet_count = 0
    last_time = time.time()
    
    while capture_running:
        update_top_talkers()
        
        # Detect anomalies
        simple_anomalies = detect_simple_anomalies()
        ai_anomalies = detect_anomalies_with_ai() if SKLEARN_AVAILABLE else []
        all_anomalies = simple_anomalies + ai_anomalies
        
        # Update anomalies in packet_stats
        with stats_lock:
            packet_stats['anomalies'] = all_anomalies[-50:]  # Keep last 50 anomalies
        
        # Store alerts if any
        if all_anomalies and alerts_config['enabled']:
            try:
                conn = sqlite3.connect('nta_data.db')
                cursor = conn.cursor()
                for anomaly in all_anomalies:
                    cursor.execute('''
                        INSERT INTO alerts (timestamp, alert_type, message, severity)
                        VALUES (?, ?, ?, ?)
                    ''', (anomaly['timestamp'], anomaly['type'], anomaly['message'], anomaly['severity']))
                conn.commit()
                conn.close()
                
                # Send alerts to clients
                for anomaly in all_anomalies:
                    socketio.emit('alert', anomaly)
            except Exception as e:
                print(f"Error handling alerts: {e}")
        
        # Store statistics in database every 10 seconds
        current_time = time.time()
        if current_time - last_time >= 10:
            store_statistics()
            last_time = current_time
        
        with stats_lock:
            # Create a copy of stats to send
            stats_copy = {
                'total_packets': packet_stats['total_packets'],
                'total_bytes': packet_stats['total_bytes'],
                'protocols': dict(packet_stats['protocols']),
                'ips': dict(list(packet_stats['ips'].items())[:50]),  # Limit to 50 IPs
                'top_talkers': packet_stats['top_talkers'],  # This is now in the correct format
                'packet_history': packet_stats['packet_history'][-50:],  # Last 50 packets
                'anomalies': packet_stats['anomalies'][-20:]  # Last 20 anomalies
            }
        
        # Emit stats to all connected clients
        socketio.emit('update_stats', stats_copy)
        time.sleep(2)  # Update every 2 seconds

def update_top_talkers():
    """Calculate and update top talkers based on byte count"""
    with stats_lock:
        # Sort IPs by total bytes
        sorted_ips = sorted(
            packet_stats['ips'].items(), 
            key=lambda x: x[1]['bytes'], 
            reverse=True
        )
        # Get top 10 talkers
        packet_stats['top_talkers'] = sorted_ips[:10]

def store_statistics():
    """Store current statistics in database"""
    with stats_lock:
        try:
            conn = sqlite3.connect('nta_data.db')
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO statistics (timestamp, total_packets, total_bytes, protocols, top_talkers)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                time.time(),
                packet_stats['total_packets'],
                packet_stats['total_bytes'],
                json.dumps(dict(packet_stats['protocols'])),
                json.dumps(packet_stats['top_talkers'])
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error storing statistics in database: {e}")

def start_packet_capture(interfaces=None):
    """Start packet capture on specified interface(s)"""
    global capture_running, capture_thread, capture_interfaces
    
    if not SCAPY_AVAILABLE or sniff is None:
        print("Scapy not available, cannot start packet capture")
        return
    
    capture_running = True
    capture_interfaces = interfaces if interfaces else []
    
    # Start periodic stats update thread
    stats_thread = threading.Thread(target=periodic_stats_update)
    stats_thread.daemon = True
    stats_thread.start()
    
    # Start packet capture
    try:
        if interfaces and len(interfaces) > 0:
            # Multi-interface capture
            from scapy.all import AsyncSniffer
            sniffers = []
            for interface in interfaces:
                sniffer = AsyncSniffer(
                    iface=interface,
                    prn=packet_handler,
                    store=0
                )
                sniffer.start()
                sniffers.append(sniffer)
            
            # Wait for all sniffers
            for sniffer in sniffers:
                sniffer.join()
        else:
            # Single interface capture (default)
            sniff(prn=packet_handler, store=0)
    except Exception as e:
        print(f"Error starting packet capture: {e}")
        capture_running = False

# Check if frontend build exists, if so, serve it
frontend_build_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

if os.path.exists(frontend_build_path) and os.path.isdir(frontend_build_path):
    app.static_folder = frontend_build_path
    
    @app.route('/')
    def serve_index():
        if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        else:
            return "Frontend not built. Please run 'npm run build' in the frontend directory.", 404
    
    @app.route('/<path:path>')
    def serve_static(path):
        if app.static_folder and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            # For SPA, serve index.html for any unknown routes
            if path.startswith('api/') or path.startswith('socket.io'):
                return "Not found", 404
            return serve_index()
else:
    # Fallback to simple template
    @app.route('/')
    def index():
        # Create a simple HTML page if no frontend is built
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Network Traffic Analyzer</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                p { color: #666; }
            </style>
        </head>
        <body>
            <h1>Network Traffic Analyzer</h1>
            <p>The frontend has not been built yet. Please run the setup script or build the frontend manually.</p>
            <p>Current backend API endpoints:</p>
            <ul>
                <li>GET /api/interfaces - List available network interfaces</li>
                <li>POST /api/start_capture - Start packet capture</li>
                <li>POST /api/stop_capture - Stop packet capture</li>
                <li>GET /api/stats - Get current statistics</li>
            </ul>
        </body>
        </html>
        """

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket client connections"""
    print('Client connected')
    emit('connection_status', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket client disconnections"""
    print('Client disconnected')

# API routes
@app.route('/api/interfaces')
def list_interfaces():
    """API endpoint to list available network interfaces"""
    interfaces = get_network_interfaces()
    return jsonify({'interfaces': interfaces})

# New API routes for advanced features
@app.route('/api/set_filters', methods=['POST'])
def set_filters():
    """API endpoint to set packet filters"""
    global packet_filters
    
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No filter data provided'})
    
    # Update filters
    packet_filters.update(data)
    packet_filters['enabled'] = True
    
    return jsonify({'status': 'success', 'message': 'Filters updated', 'filters': packet_filters})

@app.route('/api/disable_filters', methods=['POST'])
def disable_filters():
    """API endpoint to disable packet filters"""
    global packet_filters
    
    packet_filters['enabled'] = False
    
    return jsonify({'status': 'success', 'message': 'Filters disabled'})

@app.route('/api/get_filters', methods=['GET'])
def get_filters():
    """API endpoint to get current filter settings"""
    return jsonify({'status': 'success', 'filters': packet_filters})

@app.route('/api/set_alerts_config', methods=['POST'])
def set_alerts_config():
    """API endpoint to configure alerts"""
    global alerts_config
    
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'No alert configuration provided'})
    
    # Update alerts config
    alerts_config.update(data)
    
    return jsonify({'status': 'success', 'message': 'Alert configuration updated', 'config': alerts_config})

@app.route('/api/get_alerts_config', methods=['GET'])
def get_alerts_config():
    """API endpoint to get current alert configuration"""
    return jsonify({'status': 'success', 'config': alerts_config})

@app.route('/api/get_historical_data', methods=['GET'])
def get_historical_data():
    """API endpoint to get historical packet data"""
    try:
        conn = sqlite3.connect('nta_data.db')
        cursor = conn.cursor()
        
        # Get packets from last 24 hours
        twenty_four_hours_ago = time.time() - (24 * 60 * 60)
        cursor.execute('''
            SELECT timestamp, src_ip, dst_ip, protocol, size FROM packets
            WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 1000
        ''', (twenty_four_hours_ago,))
        
        packets = cursor.fetchall()
        conn.close()
        
        # Format packets for JSON response
        packet_list = []
        for packet in packets:
            packet_list.append({
                'timestamp': packet[0],
                'src_ip': packet[1],
                'dst_ip': packet[2],
                'protocol': packet[3],
                'size': packet[4]
            })
        
        return jsonify({'status': 'success', 'packets': packet_list})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving historical data: {str(e)}'})

@app.route('/api/get_statistics_history', methods=['GET'])
def get_statistics_history():
    """API endpoint to get historical statistics"""
    try:
        conn = sqlite3.connect('nta_data.db')
        cursor = conn.cursor()
        
        # Get statistics from last 24 hours
        twenty_four_hours_ago = time.time() - (24 * 60 * 60)
        cursor.execute('''
            SELECT timestamp, total_packets, total_bytes, protocols, top_talkers FROM statistics
            WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 100
        ''', (twenty_four_hours_ago,))
        
        stats = cursor.fetchall()
        conn.close()
        
        # Format statistics for JSON response
        stats_list = []
        for stat in stats:
            stats_list.append({
                'timestamp': stat[0],
                'total_packets': stat[1],
                'total_bytes': stat[2],
                'protocols': json.loads(stat[3]) if stat[3] else {},
                'top_talkers': json.loads(stat[4]) if stat[4] else []
            })
        
        return jsonify({'status': 'success', 'statistics': stats_list})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving statistics history: {str(e)}'})

@app.route('/api/get_alerts', methods=['GET'])
def get_alerts():
    """API endpoint to get recent alerts"""
    try:
        conn = sqlite3.connect('nta_data.db')
        cursor = conn.cursor()
        
        # Get alerts from last 24 hours
        twenty_four_hours_ago = time.time() - (24 * 60 * 60)
        cursor.execute('''
            SELECT timestamp, alert_type, message, severity FROM alerts
            WHERE timestamp > ? ORDER BY timestamp DESC LIMIT 50
        ''', (twenty_four_hours_ago,))
        
        alerts = cursor.fetchall()
        conn.close()
        
        # Format alerts for JSON response
        alert_list = []
        for alert in alerts:
            alert_list.append({
                'timestamp': alert[0],
                'type': alert[1],
                'message': alert[2],
                'severity': alert[3]
            })
        
        return jsonify({'status': 'success', 'alerts': alert_list})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving alerts: {str(e)}'})

@app.route('/api/start_capture', methods=['POST'])
def start_capture():
    """API endpoint to start packet capture"""
    global capture_thread, capture_running, current_session, session_packets
    
    print(f"DEBUG: start_capture called. Current capture_running state: {capture_running}")
    
    data = request.get_json()
    interfaces = data.get('interfaces', None)  # Support for multiple interfaces
    interface = data.get('interface', None)  # Backward compatibility
    session_name = data.get('session_name', f'NTA-Session-{int(time.time())}')
    
    # If capture is already running, automatically stop it first
    if capture_running:
        print("DEBUG: Capture already running, stopping it first")
        # Stop the current capture
        capture_running = False
        
        # Wait a bit for the capture thread to stop
        time.sleep(0.5)
        
        # Reset session data
        current_session = None
        session_packets = []
    
    # Initialize new session
    current_session = {
        'name': session_name,
        'start_time': time.time(),
        'packets': []
    }
    session_packets = []
    
    # Handle both single interface and multiple interfaces
    capture_interfaces = []
    if interfaces and isinstance(interfaces, list):
        capture_interfaces = interfaces
    elif interface:
        capture_interfaces = [interface]
    
    # Start capture in a separate thread
    capture_thread = threading.Thread(target=start_packet_capture, args=(capture_interfaces,))
    capture_thread.daemon = True
    capture_thread.start()
    
    # Update capture_running state
    capture_running = True
    print(f"DEBUG: Capture started. New capture_running state: {capture_running}")
    
    return jsonify({'status': 'success', 'message': 'Packet capture started', 'session_name': session_name})

@app.route('/api/stop_capture', methods=['POST'])
def stop_capture():
    """API endpoint to stop packet capture"""
    global capture_running, current_session, session_packets
    
    print(f"DEBUG: stop_capture called. Current capture_running state: {capture_running}")
    capture_running = False
    print(f"DEBUG: capture_running state after setting to False: {capture_running}")
    
    # Save session data
    if current_session:
        current_session['end_time'] = time.time()
        current_session['duration'] = current_session['end_time'] - current_session['start_time']
        current_session['packet_count'] = len(session_packets)
        
        # Save session to file
        session_filename = f"session_{current_session['name'].replace(' ', '_')}_{int(current_session['start_time'])}.json"
        try:
            with open(session_filename, 'w') as f:
                json.dump({
                    'session_info': current_session,
                    'packets': session_packets
                }, f, indent=2)
            print(f"DEBUG: Session saved to {session_filename}")
        except Exception as e:
            print(f"Error saving session: {e}")
    
    return jsonify({'status': 'success', 'message': 'Packet capture stopped'})

@app.route('/api/force_reset', methods=['POST'])
def force_reset():
    """API endpoint to force reset capture state"""
    global capture_running, current_session, session_packets, capture_thread
    
    print(f"DEBUG: force_reset called. Current capture_running state: {capture_running}")
    capture_running = False
    capture_thread = None
    current_session = None
    session_packets = []
    print(f"DEBUG: capture state after force reset: capture_running={capture_running}, capture_thread={capture_thread}")
    
    return jsonify({'status': 'success', 'message': 'Capture state force reset'})

@app.route('/api/export_session', methods=['GET'])
def export_session():
    """API endpoint to export session data"""
    global current_session, session_packets
    
    format_type = request.args.get('format', 'pcap')
    
    if not current_session or len(session_packets) == 0:
        return jsonify({'status': 'error', 'message': 'No session data available'})
    
    try:
        if format_type == 'csv':
            # Export as CSV
            output = StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(['Timestamp', 'Source IP', 'Destination IP', 'Protocol', 'Size'])
            
            # Write packet data
            for packet in session_packets:
                writer.writerow([
                    datetime.fromtimestamp(packet['timestamp']).strftime('%Y-%m-%d %H:%M:%S'),
                    packet['src'],
                    packet['dst'],
                    packet['protocol'],
                    packet['size']
                ])
            
            # Return CSV response
            csv_data = output.getvalue()
            output.close()
            
            return Response(
                csv_data,
                mimetype='text/csv',
                headers={'Content-Disposition': f'attachment; filename={current_session["name"]}.csv'}
            )
        
        elif format_type == 'json':
            # Export as JSON
            data = {
                'session_info': current_session,
                'packets': session_packets
            }
            
            return Response(
                json.dumps(data, indent=2),
                mimetype='application/json',
                headers={'Content-Disposition': f'attachment; filename={current_session["name"]}.json'}
            )
        
        else:
            # For PCAP, we would need to reconstruct the packets
            # This is a simplified version - in a real implementation, you would use scapy to write actual PCAP files
            pcap_data = "# This is a simplified PCAP export\n"
            pcap_data += f"# Session: {current_session['name']}\n"
            pcap_data += f"# Packets: {len(session_packets)}\n\n"
            
            for packet in session_packets:
                pcap_data += f"{datetime.fromtimestamp(packet['timestamp'])} {packet['src']} -> {packet['dst']} (Protocol: {packet['protocol']}, Size: {packet['size']} bytes)\n"
            
            return Response(
                pcap_data,
                mimetype='application/octet-stream',
                headers={'Content-Disposition': f'attachment; filename={current_session["name"]}.txt'}
            )
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error exporting session: {str(e)}'})

@app.route('/api/stats')
def get_stats():
    """API endpoint to get current statistics"""
    update_top_talkers()
    with stats_lock:
        stats_copy = {
            'total_packets': packet_stats['total_packets'],
            'total_bytes': packet_stats['total_bytes'],
            'protocols': dict(packet_stats['protocols']),
            'ips': dict(list(packet_stats['ips'].items())[:50]),
            'top_talkers': packet_stats['top_talkers'],
            'packet_history': packet_stats['packet_history'][-50:]
        }
    return jsonify(stats_copy)

@app.route('/api/get_geoip_data', methods=['GET'])
def get_geoip_data():
    """API endpoint to get GeoIP data"""
    try:
        # Return cached GeoIP data
        geoip_data = packet_stats.get('geoip_data', {})
        
        # Convert to list format for JSON serialization
        geoip_list = []
        for ip, data in geoip_data.items():
            # Calculate traffic for this IP
            ip_traffic = packet_stats['ips'].get(ip, {'bytes': 0})
            data['traffic'] = ip_traffic['bytes']
            geoip_list.append(data)
        
        return jsonify({'status': 'success', 'geoip_data': geoip_list})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving GeoIP data: {str(e)}'})

@app.route('/api/threat_intel_status', methods=['GET'])
def threat_intel_status():
    """API endpoint to get threat intelligence status"""
    try:
        status = {
            'abuseipdb_enabled': bool(THREAT_INTEL_CONFIG['abuseipdb_api_key']),
            'virustotal_enabled': bool(THREAT_INTEL_CONFIG['virustotal_api_key']),
            'cache_size': len(threat_intel_cache),
            'cached_ips': list(threat_intel_cache.keys())[:10]  # First 10 cached IPs
        }
        return jsonify({'status': 'success', 'threat_intel_status': status})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving threat intel status: {str(e)}'})

@app.route('/api/check_ip', methods=['POST'])
def check_ip():
    """API endpoint to manually check an IP against threat intelligence feeds"""
    try:
        data = request.get_json()
        ip = data.get('ip')
        
        if not ip:
            return jsonify({'status': 'error', 'message': 'No IP provided'})
        
        threat_info = check_ip_threat_intel(ip)
        return jsonify({'status': 'success', 'threat_info': threat_info})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error checking IP: {str(e)}'})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)