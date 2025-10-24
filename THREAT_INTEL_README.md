# Network Threat Intelligence Dashboard

A fully-featured network security monitoring and threat intelligence platform with real-time analytics and visualization.

## Features

### 🔍 Threat Intelligence
- **IP Reputation & Threat Scoring**: Integration with AbuseIPDB, VirusTotal, and OTX (AlienVault)
- **Real-time Flagged IPs**: Detection of malicious or suspicious IP addresses
- **Privacy Masked IPs**: Identification of VPN, Proxy, and Tor nodes
- **Threat Reports**: Aggregated threat intelligence feeds

### 🌍 Geolocation & Analytics
- **Country Analytics**: Traffic visualization by country and region
- **ASN & ISP Insights**: Autonomous System Number and Internet Service Provider analysis
- **Geo-Time Correlation**: Timezone-based traffic pattern analysis

### 📊 Network Intelligence
- **Port & Protocol Intelligence**: Deep analysis of network ports and protocols
- **IP Clustering & Grouping**: Subnet and CIDR-based IP grouping
- **DNS & Domain Analytics**: Domain name system analysis and suspicious domain detection
- **Network Path Tracing**: Traceroute and WHOIS lookup capabilities

## Prerequisites

- Python 3.7+
- Node.js 16+
- Administrative privileges for packet capture
- Internet connection for threat intelligence feeds

## Setup

1. **Backend Setup**:
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Frontend Setup**:
   ```bash
   # Install Node.js dependencies
   npm install
   ```

3. **Environment Variables**:
   Set the following environment variables for threat intelligence integrations:
   ```bash
   export ABUSEIPDB_API_KEY="your_abuseipdb_api_key"
   export IPINFO_TOKEN="your_ipinfo_token"
   export OTX_API_KEY="your_otx_api_key"
   ```

## Running the Application

### Development Mode

1. **Start Backend Server**:
   ```bash
   # From the backend directory
   python app.py
   ```
   The backend will be available at `http://localhost:5000`

2. **Start Frontend Development Server**:
   ```bash
   # From the frontend directory
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Production Mode

1. **Build Frontend**:
   ```bash
   # From the frontend directory
   npm run build
   ```

2. **Start Backend Server**:
   ```bash
   # From the backend directory
   python app.py
   ```
   The application will be available at `http://localhost:5000`

## Usage

### Starting Packet Capture

1. Access the application at `http://localhost:5000`
2. Select a network interface from the interface selector
3. Click "Start Capture" to begin monitoring network traffic

### Navigating the Dashboard

The application features multiple dashboard sections:

- **Network Traffic**: Real-time packet monitoring and analysis
- **Anomaly Detection**: AI-powered threat detection
- **GeoIP Map**: World map visualization of network traffic
- **Threat Intelligence**: Comprehensive threat intelligence dashboard

### Threat Intelligence Dashboard

The threat intelligence dashboard includes:

1. **Dashboard Overview**: High-level threat statistics
2. **Threat Intelligence**: Blacklisted IPs and threat reports
3. **Flagged IPs**: Detailed view of malicious IP addresses
4. **Privacy Masked IPs**: VPN, Proxy, and Tor detection
5. **Country Analytics**: Geographic traffic analysis
6. **ASN & ISP Insights**: Network provider analysis
7. **Port & Protocol**: Network port and protocol intelligence
8. **IP Clustering**: IP address grouping and analysis
9. **DNS Analytics**: Domain name system analysis
10. **Geo-Time Correlation**: Timezone-based traffic patterns
11. **Network Path Tracing**: Traceroute and WHOIS capabilities

## API Endpoints

### Threat Intelligence
- `GET /api/get_flagged_ips`: Retrieve flagged malicious IPs
- `GET /api/get_vpn_proxy_tor_detection`: Get VPN/Proxy/Tor detection results
- `GET /api/get_privacy_masked_ips`: Retrieve privacy masked IPs
- `GET /api/get_country_analytics`: Get country-wise traffic analytics
- `GET /api/get_asn_isp_insights`: Retrieve ASN and ISP insights

### Network Intelligence
- `GET /api/get_port_protocol_intelligence`: Get port and protocol intelligence
- `GET /api/get_ip_clustering`: Retrieve IP clustering data
- `GET /api/get_dns_analytics`: Get DNS and domain analytics
- `GET /api/get_geo_time_correlation`: Retrieve geo-time correlation data
- `POST /api/network_path_trace`: Perform network path tracing

## Troubleshooting

### Common Issues

1. **"localhost refused to connect"**:
   - Ensure the backend server is running
   - Check that port 5000 is not blocked by firewall
   - Verify no other application is using port 5000

2. **No threat intelligence data**:
   - Ensure API keys are properly configured
   - Wait for packet capture to collect sufficient data
   - Check internet connectivity for threat feeds

3. **Packet capture not working**:
   - Run the application with administrative privileges
   - Verify network interface selection
   - Check that Scapy is properly installed

### Logs and Debugging

Backend logs are displayed in the terminal where the server is running. For detailed debugging:

1. Check the terminal output for error messages
2. Verify API responses using curl or browser developer tools
3. Ensure all dependencies are properly installed

## Security Considerations

- Store API keys securely using environment variables
- Run the application with minimal required privileges
- Regularly update threat intelligence feeds
- Monitor logs for suspicious activity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.