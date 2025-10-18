import os
import json
import time
import threading
from collections import defaultdict
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
import psutil

# Try to import scapy, but handle if it's not available
try:
    from scapy.all import sniff, IP, TCP, UDP
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
    sniff = None
    print("Scapy not available, packet capture will not work")

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
    'packet_history': []
}

# Lock for thread-safe operations
stats_lock = threading.Lock()

# Flag to control packet capture
capture_running = False
capture_thread = None

def get_network_interfaces():
    """Get list of available network interfaces"""
    interfaces = []
    for interface, addrs in psutil.net_if_addrs().items():
        interfaces.append(interface)
    return interfaces

def packet_handler(packet):
    """Handle captured packets and update statistics"""
    global packet_stats
    
    # Only process if scapy is available
    if not SCAPY_AVAILABLE:
        return
    
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
            
            # Store packet information for history
            packet_info = {
                'timestamp': time.time(),
                'src': src_ip,
                'dst': dst_ip,
                'protocol': protocol,
                'size': packet_size
            }
            packet_stats['packet_history'].append(packet_info)
            
            # Keep only last 1000 packets in history
            if len(packet_stats['packet_history']) > 1000:
                packet_stats['packet_history'] = packet_stats['packet_history'][-1000:]

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

def periodic_stats_update():
    """Periodically send updated statistics to clients"""
    while capture_running:
        update_top_talkers()
        with stats_lock:
            # Create a copy of stats to send
            stats_copy = {
                'total_packets': packet_stats['total_packets'],
                'total_bytes': packet_stats['total_bytes'],
                'protocols': dict(packet_stats['protocols']),
                'ips': dict(list(packet_stats['ips'].items())[:50]),  # Limit to 50 IPs
                'top_talkers': packet_stats['top_talkers'],  # This is now in the correct format
                'packet_history': packet_stats['packet_history'][-50:]  # Last 50 packets
            }
        
        # Emit stats to all connected clients
        socketio.emit('update_stats', stats_copy)
        time.sleep(2)  # Update every 2 seconds

def start_packet_capture(interface=None):
    """Start packet capture on specified interface"""
    global capture_running, capture_thread
    
    if not SCAPY_AVAILABLE or sniff is None:
        print("Scapy not available, cannot start packet capture")
        return
    
    capture_running = True
    
    # Start periodic stats update thread
    stats_thread = threading.Thread(target=periodic_stats_update)
    stats_thread.daemon = True
    stats_thread.start()
    
    # Start packet capture
    try:
        if interface:
            sniff(iface=interface, prn=packet_handler, store=0)
        else:
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

@app.route('/api/start_capture', methods=['POST'])
def start_capture():
    """API endpoint to start packet capture"""
    global capture_thread, capture_running
    
    data = request.get_json()
    interface = data.get('interface', None)
    
    if capture_running:
        return jsonify({'status': 'error', 'message': 'Capture already running'})
    
    # Start capture in a separate thread
    capture_thread = threading.Thread(target=start_packet_capture, args=(interface,))
    capture_thread.daemon = True
    capture_thread.start()
    
    return jsonify({'status': 'success', 'message': 'Packet capture started'})

@app.route('/api/stop_capture', methods=['POST'])
def stop_capture():
    """API endpoint to stop packet capture"""
    global capture_running
    
    capture_running = False
    return jsonify({'status': 'success', 'message': 'Packet capture stopped'})

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

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)