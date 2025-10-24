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

# Add some mock GeoIP data for demonstration purposes
def add_mock_geoip_data():
    """Add mock GeoIP data for demonstration"""
    mock_geo_data = {
        "8.8.8.8": {
            'ip': '8.8.8.8',
            'country': 'United States',
            'country_code': 'US',
            'city': 'Mountain View',
            'region': 'California',
            'latitude': 37.4056,
            'longitude': -122.0775,
            'org': 'Google LLC',
            'asn': 'AS15169',
            'isp': 'Google LLC',
            'timezone': 'America/Los_Angeles',
            'last_updated': time.time()
        },
        "1.1.1.1": {
            'ip': '1.1.1.1',
            'country': 'Australia',
            'country_code': 'AU',
            'city': 'Brisbane',
            'region': 'Queensland',
            'latitude': -27.4698,
            'longitude': 153.0251,
            'org': 'Cloudflare, Inc.',
            'asn': 'AS13335',
            'isp': 'Cloudflare, Inc.',
            'timezone': 'Australia/Brisbane',
            'last_updated': time.time()
        },
        "216.58.214.14": {
            'ip': '216.58.214.14',
            'country': 'United States',
            'country_code': 'US',
            'city': 'Mountain View',
            'region': 'California',
            'latitude': 37.4056,
            'longitude': -122.0775,
            'org': 'Google LLC',
            'asn': 'AS15169',
            'isp': 'Google LLC',
            'timezone': 'America/Los_Angeles',
            'last_updated': time.time()
        }
    }
    
    # Add mock traffic data for these IPs
    mock_traffic_data = {
        "8.8.8.8": {'sent': 150, 'received': 120, 'bytes': 150000},
        "1.1.1.1": {'sent': 90, 'received': 85, 'bytes': 95000},
        "216.58.214.14": {'sent': 200, 'received': 180, 'bytes': 210000}
    }
    
    with stats_lock:
        # Add mock GeoIP data
        for ip, geo_info in mock_geo_data.items():
            packet_stats['geoip_data'][ip] = geo_info
            
            # Add mock traffic data
            if ip in mock_traffic_data:
                packet_stats['ips'][ip] = mock_traffic_data[ip]
                
    print("Mock GeoIP data added for demonstration")

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
    'otx_api_key': os.environ.get('OTX_API_KEY', ''),
    'enabled': True,
    'cache_duration': 3600  # 1 hour
}

# Threat intelligence cache
threat_intel_cache = {}

# IP reputation data structure
ip_reputation_data = {}

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

# Add mock GeoIP data for demonstration - moved here after stats_lock is defined
add_mock_geoip_data()

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
        'risk_score': 0,
        'asn': None,
        'isp': None,
        'organization': None,
        'country': None,
        'is_vpn': False,
        'is_proxy': False,
        'is_tor': False
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
    
    # Check OTX (AlienVault) if API key is provided
    if THREAT_INTEL_CONFIG['otx_api_key']:
        try:
            headers = {
                'X-OTX-API-KEY': THREAT_INTEL_CONFIG['otx_api_key']
            }
            response = requests.get(f'https://otx.alienvault.com/api/v1/indicators/IPv4/{ip}/general', 
                                  headers=headers, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                # Check if there are any pulses (threat intel reports)
                if 'pulse_info' in data and 'count' in data['pulse_info'] and data['pulse_info']['count'] > 0:
                    threat_info['is_malicious'] = True
                    threat_info['threat_type'] = 'OTX Reported Threat'
                    threat_info['reports'] += data['pulse_info']['count']
                    threat_info['risk_score'] = max(threat_info['risk_score'], 80)
        except Exception as e:
            print(f"Error checking OTX for {ip}: {e}")
    
    # Get additional IP info from ipinfo.io
    if IPINFO_AVAILABLE and ipinfo_handler:
        try:
            details = ipinfo_handler.getDetails(ip)
            threat_info['asn'] = getattr(details, 'asn', {}).get('asn', None) if hasattr(details, 'asn') else None
            threat_info['isp'] = getattr(details, 'org', None)
            threat_info['organization'] = getattr(details, 'org', None)
            threat_info['country'] = getattr(details, 'country_name', None)
            
            # Check for VPN/Proxy indicators
            privacy = getattr(details, 'privacy', {})
            threat_info['is_vpn'] = privacy.get('vpn', False)
            threat_info['is_proxy'] = privacy.get('proxy', False)
            threat_info['is_tor'] = privacy.get('tor', False)
        except Exception as e:
            print(f"Error getting IP info for {ip}: {e}")
    
    # Cache the result
    threat_intel_cache[ip] = {
        'threat_info': threat_info,
        'timestamp': time.time()
    }
    
    return threat_info

def check_vpn_proxy_tor(ip):
    """Check if an IP belongs to a VPN, Proxy, or Tor network"""
    global threat_intel_cache
    
    # Check cache first
    if ip in threat_intel_cache:
        cached_entry = threat_intel_cache[ip]
        if 'vpn_proxy_tor' in cached_entry:
            # Check if cache is still valid (1 hour)
            if time.time() - cached_entry['timestamp'] < 3600:
                return cached_entry['vpn_proxy_tor']
    
    # Initialize result
    vpn_proxy_tor_info = {
        'ip': ip,
        'is_vpn': False,
        'is_proxy': False,
        'is_tor': False,
        'service_name': None,
        'asn': None,
        'org': None
    }
    
    # Check using ipinfo.io if available
    if IPINFO_AVAILABLE and ipinfo_handler:
        try:
            details = ipinfo_handler.getDetails(ip)
            
            # Check for VPN/Proxy indicators in privacy section
            if hasattr(details, 'privacy'):
                privacy = details.privacy
                vpn_proxy_tor_info['is_vpn'] = getattr(privacy, 'vpn', False)
                vpn_proxy_tor_info['is_proxy'] = getattr(privacy, 'proxy', False)
                vpn_proxy_tor_info['is_tor'] = getattr(privacy, 'tor', False)
                vpn_proxy_tor_info['service_name'] = getattr(privacy, 'service', None)
            
            # Get ASN and organization info
            if hasattr(details, 'asn'):
                vpn_proxy_tor_info['asn'] = getattr(details.asn, 'asn', None)
            vpn_proxy_tor_info['org'] = getattr(details, 'org', None)
            
        except Exception as e:
            print(f"Error checking VPN/Proxy/Tor for {ip} with ipinfo: {e}")
    
    # Cache the result
    if ip in threat_intel_cache:
        threat_intel_cache[ip]['vpn_proxy_tor'] = vpn_proxy_tor_info
    else:
        threat_intel_cache[ip] = {
            'vpn_proxy_tor': vpn_proxy_tor_info,
            'timestamp': time.time()
        }
    
    return vpn_proxy_tor_info

@app.route('/api/get_vpn_proxy_tor_detection', methods=['GET'])
def get_vpn_proxy_tor_detection():
    """API endpoint to get VPN/Proxy/Tor detection results"""
    try:
        vpn_data = {
            'total_vpn': 0,
            'total_proxy': 0,
            'total_tor': 0,
            'vpn_ips': [],
            'proxy_ips': [],
            'tor_ips': [],
            'services': {}
        }
        
        # Process all IP addresses for VPN/Proxy/Tor detection
        for ip_str, ip_stats in packet_stats.get('ips', {}).items():
            try:
                # Check if IP is VPN/Proxy/Tor
                detection_result = check_vpn_proxy_tor(ip_str)
                
                # Update counts and lists
                if detection_result['is_vpn']:
                    vpn_data['total_vpn'] += 1
                    vpn_data['vpn_ips'].append({
                        'ip': ip_str,
                        'service_name': detection_result['service_name'],
                        'asn': detection_result['asn'],
                        'org': detection_result['org'],
                        'packets': ip_stats['sent'] + ip_stats['received'],
                        'bytes': ip_stats['bytes']
                    })
                    
                    # Track service providers
                    service = detection_result['service_name'] or 'Unknown VPN'
                    if service not in vpn_data['services']:
                        vpn_data['services'][service] = 0
                    vpn_data['services'][service] += 1
                
                if detection_result['is_proxy']:
                    vpn_data['total_proxy'] += 1
                    vpn_data['proxy_ips'].append({
                        'ip': ip_str,
                        'service_name': detection_result['service_name'],
                        'asn': detection_result['asn'],
                        'org': detection_result['org'],
                        'packets': ip_stats['sent'] + ip_stats['received'],
                        'bytes': ip_stats['bytes']
                    })
                
                if detection_result['is_tor']:
                    vpn_data['total_tor'] += 1
                    vpn_data['tor_ips'].append({
                        'ip': ip_str,
                        'service_name': detection_result['service_name'],
                        'asn': detection_result['asn'],
                        'org': detection_result['org'],
                        'packets': ip_stats['sent'] + ip_stats['received'],
                        'bytes': ip_stats['bytes']
                    })
                    
            except Exception as e:
                continue
        
        # Sort lists by traffic volume
        vpn_data['vpn_ips'].sort(key=lambda x: x['bytes'], reverse=True)
        vpn_data['proxy_ips'].sort(key=lambda x: x['bytes'], reverse=True)
        vpn_data['tor_ips'].sort(key=lambda x: x['bytes'], reverse=True)
        
        # Get top 10 of each type
        vpn_data['vpn_ips'] = vpn_data['vpn_ips'][:10]
        vpn_data['proxy_ips'] = vpn_data['proxy_ips'][:10]
        vpn_data['tor_ips'] = vpn_data['tor_ips'][:10]
        
        return jsonify({
            'status': 'success',
            'vpn_proxy_tor_data': vpn_data
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving VPN/Proxy/Tor detection data: {str(e)}'})

@app.route('/api/get_privacy_masked_ips', methods=['GET'])
def get_privacy_masked_ips():
    """API endpoint to get all privacy masked IPs"""
    try:
        privacy_ips = []
        
        # Process all IP addresses for privacy detection
        for ip_str, ip_stats in packet_stats.get('ips', {}).items():
            try:
                # Check if IP is VPN/Proxy/Tor
                detection_result = check_vpn_proxy_tor(ip_str)
                
                # If any privacy service detected, add to list
                if detection_result['is_vpn'] or detection_result['is_proxy'] or detection_result['is_tor']:
                    privacy_type = []
                    if detection_result['is_vpn']:
                        privacy_type.append('VPN')
                    if detection_result['is_proxy']:
                        privacy_type.append('Proxy')
                    if detection_result['is_tor']:
                        privacy_type.append('Tor')
                    
                    privacy_ips.append({
                        'ip': ip_str,
                        'type': privacy_type,
                        'service_name': detection_result['service_name'],
                        'asn': detection_result['asn'],
                        'org': detection_result['org'],
                        'packets': ip_stats['sent'] + ip_stats['received'],
                        'bytes': ip_stats['bytes']
                    })
                    
            except Exception as e:
                continue
        
        # Sort by traffic volume
        privacy_ips.sort(key=lambda x: x['bytes'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'privacy_ips': privacy_ips
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving privacy masked IPs: {str(e)}'})

def get_geoip_info(ip):
    """Get GeoIP information for an IP address"""
    global ipinfo_handler
    
    if not IPINFO_AVAILABLE or ipinfo_handler is None:
        return None
    
    try:
        # Check if we already have this IP's info cached
        if ip in packet_stats['geoip_data']:
            # Check if cache is still valid (1 hour)
            if time.time() - packet_stats['geoip_data'][ip].get('last_updated', 0) < 3600:
                return packet_stats['geoip_data'][ip]
        
        # Get GeoIP info
        details = ipinfo_handler.getDetails(ip)
        
        geo_info = {
            'ip': ip,
            'country': details.country_name if hasattr(details, 'country_name') else 'Unknown',
            'country_code': details.country if hasattr(details, 'country') else 'XX',
            'city': details.city if hasattr(details, 'city') else 'Unknown',
            'region': details.region if hasattr(details, 'region') else 'Unknown',
            'latitude': float(details.latitude) if hasattr(details, 'latitude') else 0.0,
            'longitude': float(details.longitude) if hasattr(details, 'longitude') else 0.0,
            'org': details.org if hasattr(details, 'org') else 'Unknown',
            'asn': getattr(details, 'asn', {}).get('asn', 'Unknown') if hasattr(details, 'asn') else 'Unknown',
            'isp': getattr(details, 'org', 'Unknown'),
            'timezone': details.timezone if hasattr(details, 'timezone') else 'Unknown',
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
        
        # Check threat intelligence for this IP
        threat_info = check_ip_threat_intel(ip)
        
        # Also get GeoIP info for this IP and store it in packet_stats
        if IPINFO_AVAILABLE and ipinfo_handler:
            geo_info = get_geoip_info(ip)
            # Update packet stats with this IP's traffic data for GeoIP visualization
            with stats_lock:
                if ip not in packet_stats['ips']:
                    packet_stats['ips'][ip] = {'sent': 0, 'received': 0, 'bytes': 0}
                # Add some traffic data for visualization
                packet_stats['ips'][ip]['sent'] += 1
                packet_stats['ips'][ip]['bytes'] += 1000  # Simulate 1KB traffic
        
        return jsonify({'status': 'success', 'threat_info': threat_info})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error checking IP: {str(e)}'})

@app.route('/api/get_flagged_ips', methods=['GET'])
def get_flagged_ips():
    """API endpoint to get all flagged IPs"""
    try:
        flagged_ips = []
        for ip, cache_entry in threat_intel_cache.items():
            threat_info = cache_entry['threat_info']
            if threat_info['is_malicious'] or threat_info['risk_score'] > 50:
                flagged_ips.append(threat_info)
        
        # Sort by risk score
        flagged_ips.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return jsonify({'status': 'success', 'flagged_ips': flagged_ips})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving flagged IPs: {str(e)}'})

@app.route('/api/get_vpn_ips', methods=['GET'])
def get_vpn_ips():
    """API endpoint to get all VPN/Proxy/Tor IPs"""
    try:
        privacy_ips = []
        for ip, cache_entry in threat_intel_cache.items():
            threat_info = cache_entry['threat_info']
            if threat_info['is_vpn'] or threat_info['is_proxy'] or threat_info['is_tor']:
                privacy_ips.append(threat_info)
        
        return jsonify({'status': 'success', 'privacy_ips': privacy_ips})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving privacy masked IPs: {str(e)}'})

@app.route('/api/get_country_analytics', methods=['GET'])
def get_country_analytics():
    """API endpoint to get country-wise traffic analytics"""
    try:
        country_data = {}
        
        # Aggregate data by country
        for ip, geo_info in packet_stats.get('geoip_data', {}).items():
            country = geo_info.get('country', 'Unknown')
            country_code = geo_info.get('country_code', 'XX')
            
            if country not in country_data:
                country_data[country] = {
                    'country': country,
                    'country_code': country_code,
                    'packets': 0,
                    'bytes': 0,
                    'unique_ips': 0,
                    'latitude': geo_info.get('latitude', 0),
                    'longitude': geo_info.get('longitude', 0),
                    'isp_list': set()
                }
            
            # Get traffic data for this IP
            ip_traffic = packet_stats['ips'].get(ip, {'sent': 0, 'received': 0, 'bytes': 0})
            country_data[country]['packets'] += (ip_traffic['sent'] + ip_traffic['received'])
            country_data[country]['bytes'] += ip_traffic['bytes']
            country_data[country]['unique_ips'] += 1
            
            # Add ISP to list
            isp = geo_info.get('isp', 'Unknown')
            if isp and isp != 'Unknown':
                country_data[country]['isp_list'].add(isp)
        
        # Convert sets to lists for JSON serialization
        for country in country_data:
            country_data[country]['isp_list'] = list(country_data[country]['isp_list'])
        
        # Sort by bytes transferred
        sorted_countries = sorted(country_data.values(), key=lambda x: x['bytes'], reverse=True)
        
        return jsonify({'status': 'success', 'country_data': sorted_countries})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving country analytics: {str(e)}'})

@app.route('/api/filter_country_traffic', methods=['POST'])
def filter_country_traffic():
    """API endpoint to filter traffic by country"""
    try:
        data = request.get_json()
        filter_type = data.get('filter_type', 'all')  # 'all', 'non_local', 'specific'
        country_filter = data.get('country', None)
        
        filtered_ips = {}
        
        for ip, geo_info in packet_stats.get('geoip_data', {}).items():
            country = geo_info.get('country', 'Unknown')
            
            include_ip = False
            if filter_type == 'all':
                include_ip = True
            elif filter_type == 'non_local':
                # This would need to be configured based on the local country
                local_country = os.environ.get('LOCAL_COUNTRY', 'India')
                include_ip = country != local_country
            elif filter_type == 'specific' and country_filter:
                include_ip = country == country_filter
            
            if include_ip:
                filtered_ips[ip] = geo_info
        
        return jsonify({'status': 'success', 'filtered_ips': filtered_ips})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error filtering country traffic: {str(e)}'})

@app.route('/api/get_asn_isp_insights', methods=['GET'])
def get_asn_isp_insights():
    """API endpoint to get ASN and ISP insights"""
    try:
        asn_data = {}
        isp_data = {}
        network_type_data = {}
        
        # Aggregate data by ASN and ISP
        for ip, geo_info in packet_stats.get('geoip_data', {}).items():
            # Get traffic data for this IP
            ip_traffic = packet_stats['ips'].get(ip, {'sent': 0, 'received': 0, 'bytes': 0})
            
            # Process ASN data
            asn = geo_info.get('asn', 'Unknown')
            if asn not in asn_data:
                asn_data[asn] = {
                    'asn': asn,
                    'packets': 0,
                    'bytes': 0,
                    'unique_ips': 0
                }
            asn_data[asn]['packets'] += (ip_traffic['sent'] + ip_traffic['received'])
            asn_data[asn]['bytes'] += ip_traffic['bytes']
            asn_data[asn]['unique_ips'] += 1
            
            # Process ISP data
            isp = geo_info.get('isp', 'Unknown')
            if isp not in isp_data:
                isp_data[isp] = {
                    'isp': isp,
                    'packets': 0,
                    'bytes': 0,
                    'unique_ips': 0
                }
            isp_data[isp]['packets'] += (ip_traffic['sent'] + ip_traffic['received'])
            isp_data[isp]['bytes'] += ip_traffic['bytes']
            isp_data[isp]['unique_ips'] += 1
            
            # Determine network type
            org = geo_info.get('org', 'Unknown').lower()
            network_type = 'Residential'
            if 'cloudflare' in org or 'amazon' in org or 'aws' in org or 'microsoft' in org:
                network_type = 'Hosting'
            elif 'vpn' in org or 'nordvpn' in org or 'expressvpn' in org:
                network_type = 'VPN'
            elif 'tor' in org:
                network_type = 'Tor'
            elif 'proxy' in org:
                network_type = 'Proxy'
                
            if network_type not in network_type_data:
                network_type_data[network_type] = {
                    'type': network_type,
                    'packets': 0,
                    'bytes': 0,
                    'unique_ips': 0
                }
            network_type_data[network_type]['packets'] += (ip_traffic['sent'] + ip_traffic['received'])
            network_type_data[network_type]['bytes'] += ip_traffic['bytes']
            network_type_data[network_type]['unique_ips'] += 1
        
        # Convert to lists and sort
        asn_list = sorted(asn_data.values(), key=lambda x: x['bytes'], reverse=True)
        isp_list = sorted(isp_data.values(), key=lambda x: x['bytes'], reverse=True)
        network_type_list = sorted(network_type_data.values(), key=lambda x: x['bytes'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'asn_data': asn_list,
            'isp_data': isp_list,
            'network_type_data': network_type_list
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving ASN/ISP insights: {str(e)}'})

@app.route('/api/detect_suspicious_traffic', methods=['GET'])
def detect_suspicious_traffic():
    """API endpoint to detect suspicious traffic patterns"""
    try:
        suspicious_patterns = []
        
        # Get network type data
        # Note: This is a simplified approach. In a real implementation, you might want to
        # directly access the data instead of calling the function
        
        return jsonify({
            'status': 'success',
            'suspicious_patterns': suspicious_patterns
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error detecting suspicious traffic: {str(e)}'})

@app.route('/api/get_ip_clustering', methods=['GET'])
def get_ip_clustering():
    """API endpoint to get IP clustering and grouping data"""
    try:
        # Data structures for clustering
        subnet_data = {}  # Group by /24 subnets
        network_data = {}  # Group by /16 networks
        cluster_stats = {}  # Statistics for each cluster
        
        # Process all IP addresses
        for ip_str, ip_stats in packet_stats.get('ips', {}).items():
            try:
                # Parse IP address
                from ipaddress import ip_network, ip_address
                ip = ip_address(ip_str)
                
                # Get /24 subnet (x.x.x.0/24)
                subnet_prefix = ip_network(f"{ip}/24", strict=False)
                subnet_str = str(subnet_prefix)
                
                # Get /16 network (x.x.0.0/16)
                network_prefix = ip_network(f"{ip}/16", strict=False)
                network_str = str(network_prefix)
                
                # Initialize subnet data if not exists
                if subnet_str not in subnet_data:
                    subnet_data[subnet_str] = {
                        'subnet': subnet_str,
                        'ips': set(),
                        'packets': 0,
                        'bytes': 0,
                        'unique_ips': 0
                    }
                
                # Initialize network data if not exists
                if network_str not in network_data:
                    network_data[network_str] = {
                        'network': network_str,
                        'subnets': set(),
                        'ips': set(),
                        'packets': 0,
                        'bytes': 0,
                        'unique_ips': 0
                    }
                
                # Update subnet data
                subnet_data[subnet_str]['ips'].add(ip_str)
                subnet_data[subnet_str]['packets'] += (ip_stats['sent'] + ip_stats['received'])
                subnet_data[subnet_str]['bytes'] += ip_stats['bytes']
                subnet_data[subnet_str]['unique_ips'] = len(subnet_data[subnet_str]['ips'])
                
                # Update network data
                network_data[network_str]['subnets'].add(subnet_str)
                network_data[network_str]['ips'].add(ip_str)
                network_data[network_str]['packets'] += (ip_stats['sent'] + ip_stats['received'])
                network_data[network_str]['bytes'] += ip_stats['bytes']
                network_data[network_str]['unique_ips'] = len(network_data[network_str]['ips'])
                
            except Exception as e:
                # Skip invalid IP addresses
                continue
        
        # Convert sets to lists for JSON serialization
        for subnet in subnet_data.values():
            subnet['ips'] = list(subnet['ips'])
            
        for network in network_data.values():
            network['subnets'] = list(network['subnets'])
            network['ips'] = list(network['ips'])
        
        # Sort and get top clusters
        top_subnets = sorted(subnet_data.values(), key=lambda x: x['bytes'], reverse=True)[:20]
        top_networks = sorted(network_data.values(), key=lambda x: x['bytes'], reverse=True)[:10]
        
        # Identify suspicious clusters (sudden appearance of new IP ranges)
        suspicious_clusters = []
        # This would require historical data analysis in a real implementation
        
        return jsonify({
            'status': 'success',
            'subnet_clusters': top_subnets,
            'network_clusters': top_networks,
            'suspicious_clusters': suspicious_clusters[:5]
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving IP clustering data: {str(e)}'})

@app.route('/api/get_ip_grouping_by_activity', methods=['GET'])
def get_ip_grouping_by_activity():
    """API endpoint to get IP grouping by activity volume"""
    try:
        ip_activity_data = {}
        
        # Process all IP addresses and their activity
        for ip_str, ip_stats in packet_stats.get('ips', {}).items():
            total_packets = ip_stats['sent'] + ip_stats['received']
            total_bytes = ip_stats['bytes']
            
            # Categorize by activity level
            if total_packets > 10000:
                activity_level = 'High'
            elif total_packets > 1000:
                activity_level = 'Medium'
            elif total_packets > 100:
                activity_level = 'Low'
            else:
                activity_level = 'Very Low'
            
            if activity_level not in ip_activity_data:
                ip_activity_data[activity_level] = {
                    'level': activity_level,
                    'ip_count': 0,
                    'total_packets': 0,
                    'total_bytes': 0,
                    'ips': []
                }
            
            ip_activity_data[activity_level]['ip_count'] += 1
            ip_activity_data[activity_level]['total_packets'] += total_packets
            ip_activity_data[activity_level]['total_bytes'] += total_bytes
            ip_activity_data[activity_level]['ips'].append({
                'ip': ip_str,
                'packets': total_packets,
                'bytes': total_bytes
            })
        
        # Sort IPs within each activity level by traffic
        for level_data in ip_activity_data.values():
            level_data['ips'].sort(key=lambda x: x['bytes'], reverse=True)
            # Limit to top 10 IPs per level
            level_data['ips'] = level_data['ips'][:10]
        
        # Convert to list and sort by activity level
        activity_list = sorted(ip_activity_data.values(), key=lambda x: ['Very Low', 'Low', 'Medium', 'High'].index(x['level']))
        
        return jsonify({
            'status': 'success',
            'activity_grouping': activity_list
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving IP activity grouping: {str(e)}'})

# Common ports database
COMMON_PORTS = {
    20: {'name': 'FTP Data', 'description': 'File Transfer Protocol (Data)', 'risk': 'Low'},
    21: {'name': 'FTP Control', 'description': 'File Transfer Protocol (Control)', 'risk': 'Medium'},
    22: {'name': 'SSH', 'description': 'Secure Shell', 'risk': 'Low'},
    23: {'name': 'Telnet', 'description': 'Telnet', 'risk': 'High'},
    25: {'name': 'SMTP', 'description': 'Simple Mail Transfer Protocol', 'risk': 'Low'},
    53: {'name': 'DNS', 'description': 'Domain Name System', 'risk': 'Low'},
    67: {'name': 'DHCP Server', 'description': 'Dynamic Host Configuration Protocol (Server)', 'risk': 'Low'},
    68: {'name': 'DHCP Client', 'description': 'Dynamic Host Configuration Protocol (Client)', 'risk': 'Low'},
    69: {'name': 'TFTP', 'description': 'Trivial File Transfer Protocol', 'risk': 'Medium'},
    80: {'name': 'HTTP', 'description': 'Hypertext Transfer Protocol', 'risk': 'Low'},
    110: {'name': 'POP3', 'description': 'Post Office Protocol v3', 'risk': 'Low'},
    123: {'name': 'NTP', 'description': 'Network Time Protocol', 'risk': 'Low'},
    135: {'name': 'RPC', 'description': 'Remote Procedure Call', 'risk': 'Medium'},
    137: {'name': 'NetBIOS Name Service', 'description': 'NetBIOS Name Service', 'risk': 'Medium'},
    138: {'name': 'NetBIOS Datagram Service', 'description': 'NetBIOS Datagram Service', 'risk': 'Medium'},
    139: {'name': 'NetBIOS Session Service', 'description': 'NetBIOS Session Service', 'risk': 'Medium'},
    143: {'name': 'IMAP', 'description': 'Internet Message Access Protocol', 'risk': 'Low'},
    161: {'name': 'SNMP', 'description': 'Simple Network Management Protocol', 'risk': 'Low'},
    162: {'name': 'SNMP Trap', 'description': 'Simple Network Management Protocol Trap', 'risk': 'Low'},
    443: {'name': 'HTTPS', 'description': 'Hypertext Transfer Protocol Secure', 'risk': 'Low'},
    445: {'name': 'SMB', 'description': 'Server Message Block', 'risk': 'High'},
    993: {'name': 'IMAPS', 'description': 'Internet Message Access Protocol Secure', 'risk': 'Low'},
    995: {'name': 'POP3S', 'description': 'Post Office Protocol v3 Secure', 'risk': 'Low'},
    1433: {'name': 'MSSQL', 'description': 'Microsoft SQL Server', 'risk': 'Medium'},
    1434: {'name': 'MSSQL Monitor', 'description': 'Microsoft SQL Server Monitor', 'risk': 'Medium'},
    1521: {'name': 'Oracle SQL', 'description': 'Oracle SQL Database', 'risk': 'Medium'},
    1723: {'name': 'PPTP', 'description': 'Point-to-Point Tunneling Protocol', 'risk': 'Low'},
    3306: {'name': 'MySQL', 'description': 'MySQL Database', 'risk': 'Medium'},
    3389: {'name': 'RDP', 'description': 'Remote Desktop Protocol', 'risk': 'High'},
    5432: {'name': 'PostgreSQL', 'description': 'PostgreSQL Database', 'risk': 'Medium'},
    5900: {'name': 'VNC', 'description': 'Virtual Network Computing', 'risk': 'High'},
    8080: {'name': 'HTTP Proxy', 'description': 'HTTP Proxy/Alternative HTTP', 'risk': 'Medium'},
    8443: {'name': 'HTTPS Alt', 'description': 'Alternative HTTPS', 'risk': 'Low'}
}

@app.route('/api/get_port_protocol_intelligence', methods=['GET'])
def get_port_protocol_intelligence():
    """API endpoint to get port and protocol intelligence"""
    try:
        port_data = {}
        protocol_data = {}
        unusual_ports = []
        
        # Aggregate data by port and protocol
        for packet_info in packet_stats.get('packet_history', []):
            # Process protocol data
            protocol = packet_info.get('protocol', 0)
            size = packet_info.get('size', 0)
            
            if protocol not in protocol_data:
                protocol_data[protocol] = {
                    'protocol': protocol,
                    'name': get_protocol_name(protocol),
                    'packets': 0,
                    'bytes': 0
                }
            protocol_data[protocol]['packets'] += 1
            protocol_data[protocol]['bytes'] += size
            
            # Process port data (for TCP/UDP packets)
            src_port = packet_info.get('src_port')
            dst_port = packet_info.get('dst_port')
            
            # Check source port
            if src_port:
                if src_port not in port_data:
                    port_info = COMMON_PORTS.get(src_port, {'name': f'Port {src_port}', 'description': 'Unknown', 'risk': 'Low'})
                    port_data[src_port] = {
                        'port': src_port,
                        'name': port_info['name'],
                        'description': port_info['description'],
                        'risk': port_info['risk'],
                        'packets': 0,
                        'bytes': 0,
                        'direction': 'source'
                    }
                port_data[src_port]['packets'] += 1
                port_data[src_port]['bytes'] += size
                
                # Check if port is unusual
                if is_unusual_port(src_port):
                    unusual_ports.append({
                        'port': src_port,
                        'name': port_data[src_port]['name'],
                        'packets': port_data[src_port]['packets'],
                        'bytes': port_data[src_port]['bytes'],
                        'direction': 'source'
                    })
            
            # Check destination port
            if dst_port:
                if dst_port not in port_data:
                    port_info = COMMON_PORTS.get(dst_port, {'name': f'Port {dst_port}', 'description': 'Unknown', 'risk': 'Low'})
                    port_data[dst_port] = {
                        'port': dst_port,
                        'name': port_info['name'],
                        'description': port_info['description'],
                        'risk': port_info['risk'],
                        'packets': 0,
                        'bytes': 0,
                        'direction': 'destination'
                    }
                port_data[dst_port]['packets'] += 1
                port_data[dst_port]['bytes'] += size
                
                # Check if port is unusual
                if is_unusual_port(dst_port):
                    unusual_ports.append({
                        'port': dst_port,
                        'name': port_data[dst_port]['name'],
                        'packets': port_data[dst_port]['packets'],
                        'bytes': port_data[dst_port]['bytes'],
                        'direction': 'destination'
                    })
        
        # Convert to lists and sort
        port_list = sorted(port_data.values(), key=lambda x: x['packets'], reverse=True)
        protocol_list = sorted(protocol_data.values(), key=lambda x: x['packets'], reverse=True)
        
        # Get top ports
        top_ports = port_list[:20]
        
        return jsonify({
            'status': 'success',
            'port_data': top_ports,
            'protocol_data': protocol_list,
            'unusual_ports': unusual_ports[:10]  # Limit to top 10 unusual ports
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving port/protocol intelligence: {str(e)}'})

def get_protocol_name(protocol_num):
    """Get protocol name from protocol number"""
    protocol_names = {
        1: 'ICMP',
        6: 'TCP',
        17: 'UDP',
        2: 'IGMP',
        89: 'OSPF',
        132: 'SCTP'
    }
    return protocol_names.get(protocol_num, f'Protocol {protocol_num}')

def is_unusual_port(port):
    """Check if a port is considered unusual"""
    # Common ports are not unusual
    if port in COMMON_PORTS:
        return False
    
    # Ports in these ranges are generally not unusual
    if (port >= 1 and port <= 1023) or (port >= 8000 and port <= 8999):
        return False
    
    # All other ports are considered unusual
    return True

@app.route('/api/get_port_country_correlation', methods=['GET'])
def get_port_country_correlation():
    """API endpoint to get port-country correlation data"""
    try:
        port_country_data = {}
        
        # Aggregate data by port and country
        for ip, geo_info in packet_stats.get('geoip_data', {}).items():
            country = geo_info.get('country', 'Unknown')
            
            # Get traffic data for this IP
            ip_traffic = packet_stats['ips'].get(ip, {'sent': 0, 'received': 0, 'bytes': 0})
            
            # Get port data for packets from this IP
            ip_packets = [p for p in packet_stats.get('packet_history', []) if p.get('src') == ip or p.get('dst') == ip]
            
            for packet in ip_packets:
                src_port = packet.get('src_port')
                dst_port = packet.get('dst_port')
                
                # Process source port
                if src_port:
                    key = f"{src_port}_{country}"
                    if key not in port_country_data:
                        port_info = COMMON_PORTS.get(src_port, {'name': f'Port {src_port}', 'description': 'Unknown', 'risk': 'Low'})
                        port_country_data[key] = {
                            'port': src_port,
                            'port_name': port_info['name'],
                            'country': country,
                            'packets': 0,
                            'bytes': 0
                        }
                    port_country_data[key]['packets'] += 1
                    port_country_data[key]['bytes'] += packet.get('size', 0)
                
                # Process destination port
                if dst_port:
                    key = f"{dst_port}_{country}"
                    if key not in port_country_data:
                        port_info = COMMON_PORTS.get(dst_port, {'name': f'Port {dst_port}', 'description': 'Unknown', 'risk': 'Low'})
                        port_country_data[key] = {
                            'port': dst_port,
                            'port_name': port_info['name'],
                            'country': country,
                            'packets': 0,
                            'bytes': 0
                        }
                    port_country_data[key]['packets'] += 1
                    port_country_data[key]['bytes'] += packet.get('size', 0)
        
        # Convert to list and sort
        correlation_list = sorted(port_country_data.values(), key=lambda x: x['packets'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'correlation_data': correlation_list[:50]  # Top 50 correlations
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving port-country correlation: {str(e)}'})

@app.route('/api/get_geo_time_correlation', methods=['GET'])
def get_geo_time_correlation():
    """API endpoint to get geo-time correlation data"""
    try:
        time_zone_data = {}
        activity_patterns = {}
        
        # Process all IP addresses for geo-time correlation
        for ip_str, geo_info in packet_stats.get('geoip_data', {}).items():
            try:
                # Get timezone information
                timezone = geo_info.get('timezone', 'Unknown')
                country = geo_info.get('country', 'Unknown')
                
                # Get traffic data for this IP
                ip_stats = packet_stats['ips'].get(ip_str, {'sent': 0, 'received': 0, 'bytes': 0})
                packets = ip_stats['sent'] + ip_stats['received']
                bytes_transferred = ip_stats['bytes']
                
                # Initialize timezone data if not exists
                if timezone not in time_zone_data:
                    time_zone_data[timezone] = {
                        'timezone': timezone,
                        'countries': set(),
                        'packets': 0,
                        'bytes': 0,
                        'unique_ips': 0,
                        'ips': set()
                    }
                
                # Update timezone data
                time_zone_data[timezone]['countries'].add(country)
                time_zone_data[timezone]['packets'] += packets
                time_zone_data[timezone]['bytes'] += bytes_transferred
                time_zone_data[timezone]['ips'].add(ip_str)
                
                # Activity pattern analysis
                # Get current UTC time
                import datetime
                utc_now = datetime.datetime.utcnow()
                utc_hour = utc_now.hour
                
                # Determine if this is off-hour activity (simplified)
                # Assuming local business hours are 9 AM to 5 PM in each timezone
                local_hour = utc_hour  # Simplified - in reality would convert UTC to local time
                
                is_off_hour = local_hour < 9 or local_hour > 17
                
                if is_off_hour:
                    if timezone not in activity_patterns:
                        activity_patterns[timezone] = {
                            'timezone': timezone,
                            'off_hour_packets': 0,
                            'off_hour_bytes': 0,
                            'normal_hour_packets': 0,
                            'normal_hour_bytes': 0
                        }
                    activity_patterns[timezone]['off_hour_packets'] += packets
                    activity_patterns[timezone]['off_hour_bytes'] += bytes_transferred
                else:
                    if timezone not in activity_patterns:
                        activity_patterns[timezone] = {
                            'timezone': timezone,
                            'off_hour_packets': 0,
                            'off_hour_bytes': 0,
                            'normal_hour_packets': 0,
                            'normal_hour_bytes': 0
                        }
                    activity_patterns[timezone]['normal_hour_packets'] += packets
                    activity_patterns[timezone]['normal_hour_bytes'] += bytes_transferred
                    
            except Exception as e:
                continue
        
        # Convert sets to counts/lists for JSON serialization
        for tz_data in time_zone_data.values():
            tz_data['unique_ips'] = len(tz_data['ips'])
            tz_data['countries'] = list(tz_data['countries'])
            # Keep top 5 countries
            tz_data['countries'] = tz_data['countries'][:5]
            del tz_data['ips']  # Remove IPs for privacy
        
        # Sort and get top timezones
        top_timezones = sorted(time_zone_data.values(), key=lambda x: x['bytes'], reverse=True)[:20]
        
        # Identify suspicious time patterns
        suspicious_patterns = []
        for tz, pattern in activity_patterns.items():
            total_packets = pattern['off_hour_packets'] + pattern['normal_hour_packets']
            if total_packets > 0:
                off_hour_ratio = pattern['off_hour_packets'] / total_packets
                if off_hour_ratio > 0.7:  # More than 70% off-hour activity
                    suspicious_patterns.append({
                        'timezone': tz,
                        'off_hour_ratio': off_hour_ratio,
                        'off_hour_packets': pattern['off_hour_packets'],
                        'off_hour_bytes': pattern['off_hour_bytes'],
                        'risk_level': 'High'
                    })
                elif off_hour_ratio > 0.5:  # More than 50% off-hour activity
                    suspicious_patterns.append({
                        'timezone': tz,
                        'off_hour_ratio': off_hour_ratio,
                        'off_hour_packets': pattern['off_hour_packets'],
                        'off_hour_bytes': pattern['off_hour_bytes'],
                        'risk_level': 'Medium'
                    })
        
        # Sort suspicious patterns
        suspicious_patterns.sort(key=lambda x: x['off_hour_ratio'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'time_zone_data': top_timezones,
            'activity_patterns': list(activity_patterns.values()),
            'suspicious_patterns': suspicious_patterns[:10]
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving geo-time correlation data: {str(e)}'})

@app.route('/api/get_world_map_bubbles', methods=['GET'])
def get_world_map_bubbles():
    """API endpoint to get data for world map bubbles visualization"""
    try:
        bubble_data = []
        
        # Process all IP addresses for bubble visualization
        for ip_str, geo_info in packet_stats.get('geoip_data', {}).items():
            try:
                # Get geolocation data
                latitude = geo_info.get('latitude', 0)
                longitude = geo_info.get('longitude', 0)
                country = geo_info.get('country', 'Unknown')
                
                # Get traffic data for this IP
                ip_stats = packet_stats['ips'].get(ip_str, {'sent': 0, 'received': 0, 'bytes': 0})
                packets = ip_stats['sent'] + ip_stats['received']
                bytes_transferred = ip_stats['bytes']
                
                # Only include entries with valid coordinates
                if latitude != 0 and longitude != 0:
                    bubble_data.append({
                        'ip': ip_str,
                        'latitude': latitude,
                        'longitude': longitude,
                        'country': country,
                        'packets': packets,
                        'bytes': bytes_transferred,
                        'radius': max(5, min(50, bytes_transferred / 1000000))  # Scale radius based on traffic
                    })
                    
            except Exception as e:
                continue
        
        # Sort by traffic volume and limit to top 100
        bubble_data.sort(key=lambda x: x['bytes'], reverse=True)
        bubble_data = bubble_data[:100]
        
        return jsonify({
            'status': 'success',
            'bubble_data': bubble_data
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving world map bubble data: {str(e)}'})

# DNS and Domain Analytics
dns_cache = {}  # Cache for DNS lookups
domain_stats = {}  # Statistics for domains

def reverse_dns_lookup(ip):
    """Perform reverse DNS lookup for an IP address"""
    global dns_cache
    
    # Check cache first
    if ip in dns_cache:
        cached_entry = dns_cache[ip]
        # Check if cache is still valid (1 hour)
        if time.time() - cached_entry['timestamp'] < 3600:
            return cached_entry['hostname']
    
    try:
        # Perform reverse DNS lookup
        import socket
        hostname = socket.gethostbyaddr(ip)[0]
        
        # Cache the result
        dns_cache[ip] = {
            'hostname': hostname,
            'timestamp': time.time()
        }
        
        return hostname
    except Exception as e:
        # Cache negative result to avoid repeated lookups
        dns_cache[ip] = {
            'hostname': None,
            'timestamp': time.time()
        }
        return None

def is_suspicious_domain(domain):
    """Check if a domain is potentially suspicious"""
    if not domain:
        return False
    
    domain = domain.lower()
    
    # Check for suspicious patterns
    suspicious_patterns = [
        'temp', 'tmp', 'temporarily',  # Temporary domains
        'free', 'gratis',  # Free domain services
        'dynamic', 'dhcp',  # Dynamic IP domains
        'broadband', 'dsl', 'cable',  # ISP dynamic domains
        'xn--',  # Punycode (IDN) domains
        '.tk', '.ml', '.ga', '.cf',  # Free TLDs often used for malicious purposes
    ]
    
    for pattern in suspicious_patterns:
        if pattern in domain:
            return True
    
    # Check for randomly generated domain patterns
    # Simple heuristic: too many consonants in a row or too short
    if len(domain.split('.')[0]) < 5:
        return True
    
    return False

@app.route('/api/get_dns_analytics', methods=['GET'])
def get_dns_analytics():
    """API endpoint to get DNS and domain analytics"""
    try:
        domain_data = {}
        dns_stats = {
            'total_lookups': 0,
            'successful_lookups': 0,
            'failed_lookups': 0,
            'suspicious_domains': 0
        }
        
        # Process all IP addresses for DNS lookups
        for ip_str, ip_stats in packet_stats.get('ips', {}).items():
            try:
                # Perform reverse DNS lookup
                hostname = reverse_dns_lookup(ip_str)
                dns_stats['total_lookups'] += 1
                
                if hostname:
                    dns_stats['successful_lookups'] += 1
                    
                    # Extract domain from hostname
                    domain_parts = hostname.split('.')
                    if len(domain_parts) >= 2:
                        domain = '.'.join(domain_parts[-2:])  # Get domain.tld
                    else:
                        domain = hostname
                    
                    # Update domain statistics
                    if domain not in domain_data:
                        domain_data[domain] = {
                            'domain': domain,
                            'lookups': 0,
                            'unique_ips': 0,
                            'ips': set(),
                            'is_suspicious': is_suspicious_domain(domain)
                        }
                    
                    domain_data[domain]['lookups'] += 1
                    domain_data[domain]['ips'].add(ip_str)
                    
                    if domain_data[domain]['is_suspicious']:
                        dns_stats['suspicious_domains'] += 1
                else:
                    dns_stats['failed_lookups'] += 1
                    
            except Exception as e:
                dns_stats['failed_lookups'] += 1
                continue
        
        # Convert sets to lists for JSON serialization
        for domain in domain_data.values():
            domain['unique_ips'] = len(domain['ips'])
            domain['ips'] = list(domain['ips'])
        
        # Sort and get top domains
        top_domains = sorted(domain_data.values(), key=lambda x: x['lookups'], reverse=True)[:20]
        
        # Identify suspicious domains
        suspicious_domains = [d for d in top_domains if d['is_suspicious']]
        
        return jsonify({
            'status': 'success',
            'dns_stats': dns_stats,
            'top_domains': top_domains,
            'suspicious_domains': suspicious_domains
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error retrieving DNS analytics: {str(e)}'})

import subprocess
import re

def traceroute_ip(ip):
    """Perform traceroute to an IP address"""
    try:
        # Use system traceroute command
        # Note: This requires the application to run with appropriate privileges
        if os.name == 'nt':  # Windows
            cmd = ['tracert', '-h', '30', ip]
        else:  # Unix/Linux/Mac
            cmd = ['traceroute', '-m', '30', ip]
        
        # Execute traceroute
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        # Parse traceroute output
        hops = []
        lines = result.stdout.split('\n')
        
        for line in lines:
            # Parse hop information
            # This is a simplified parser - real implementation would need to handle
            # different traceroute output formats
            hop_match = re.search(r'^\s*(\d+)\s+(.*?)\s+([0-9.]+|\*)\s*ms', line)
            if hop_match:
                hop_num = int(hop_match.group(1))
                hostname = hop_match.group(2).strip()
                latency = hop_match.group(3)
                
                # Handle timeouts
                if latency == '*':
                    latency_ms = None
                else:
                    latency_ms = float(latency)
                
                hops.append({
                    'hop': hop_num,
                    'hostname': hostname if hostname != '*' else 'Unknown',
                    'latency_ms': latency_ms,
                    'ip': None  # Would need additional parsing to extract IP
                })
        
        return {
            'target_ip': ip,
            'hops': hops,
            'success': True,
            'error': None
        }
    except subprocess.TimeoutExpired:
        return {
            'target_ip': ip,
            'hops': [],
            'success': False,
            'error': 'Traceroute timed out'
        }
    except Exception as e:
        return {
            'target_ip': ip,
            'hops': [],
            'success': False,
            'error': str(e)
        }

def whois_lookup(ip):
    """Perform WHOIS lookup for an IP address"""
    try:
        # Use system whois command
        # Note: This requires the whois utility to be installed
        cmd = ['whois', ip]
        
        # Execute whois
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        # Parse WHOIS output for key information
        output = result.stdout
        
        # Extract key information (simplified)
        org_match = re.search(r'(OrgName|owner|organisation):?\s*(.+)', output, re.IGNORECASE)
        country_match = re.search(r'(Country|country):?\s*(.+)', output, re.IGNORECASE)
        netname_match = re.search(r'(NetName|netname):?\s*(.+)', output, re.IGNORECASE)
        
        return {
            'ip': ip,
            'organization': org_match.group(2).strip() if org_match else 'Unknown',
            'country': country_match.group(2).strip() if country_match else 'Unknown',
            'netname': netname_match.group(2).strip() if netname_match else 'Unknown',
            'raw_output': output[:1000]  # Limit output size
        }
    except Exception as e:
        return {
            'ip': ip,
            'organization': 'Unknown',
            'country': 'Unknown',
            'netname': 'Unknown',
            'error': str(e)
        }

@app.route('/api/network_path_trace', methods=['POST'])
def network_path_trace():
    """API endpoint to perform network path tracing"""
    try:
        data = request.get_json()
        target_ip = data.get('ip')
        
        if not target_ip:
            return jsonify({'status': 'error', 'message': 'No target IP provided'})
        
        # Perform traceroute
        trace_result = traceroute_ip(target_ip)
        
        # Perform WHOIS lookup
        whois_result = whois_lookup(target_ip)
        
        return jsonify({
            'status': 'success',
            'traceroute': trace_result,
            'whois': whois_result
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error performing network path trace: {str(e)}'})

@app.route('/api/batch_network_trace', methods=['POST'])
def batch_network_trace():
    """API endpoint to perform batch network path tracing"""
    try:
        data = request.get_json()
        ip_list = data.get('ips', [])
        
        if not ip_list:
            return jsonify({'status': 'error', 'message': 'No IPs provided'})
        
        # Limit to 10 IPs to prevent abuse
        ip_list = ip_list[:10]
        
        results = []
        for ip in ip_list:
            # Perform traceroute
            trace_result = traceroute_ip(ip)
            
            # Perform WHOIS lookup
            whois_result = whois_lookup(ip)
            
            results.append({
                'ip': ip,
                'traceroute': trace_result,
                'whois': whois_result
            })
        
        return jsonify({
            'status': 'success',
            'results': results
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Error performing batch network trace: {str(e)}'})

# Update the main block to handle graceful shutdown
if __name__ == '__main__':
    try:
        print("Starting Network Traffic Analyzer server...")
        print("Server will be available at http://localhost:5000")
        socketio.run(app, host='127.0.0.1', port=5000, debug=False)
    except KeyboardInterrupt:
        print("Shutting down gracefully...")
    except Exception as e:
        print(f"Error starting server: {e}")
        import traceback
        traceback.print_exc()
