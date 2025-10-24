# Network Threat Intelligence Dashboard - Demo Guide

## Overview

This guide will help you demonstrate the fully-featured Network Threat Intelligence Dashboard, which includes 10 advanced network-level security features.

## Prerequisites

1. The backend server is running on `http://localhost:5000`
2. A web browser to access the frontend interface

## Demo Features

### 1. IP Reputation & Threat Intelligence
- Integration with AbuseIPDB, ipinfo.io, and OTX (AlienVault)
- Real-time threat scoring for IP addresses
- Malicious IP detection and flagging

### 2. Geolocation Mapping
- Country, region, and city-level traffic visualization
- World map display of network connections
- Geographic traffic distribution analysis

### 3. Country & Region Analytics
- Detailed breakdown of traffic by geographic location
- Filtering options for specific countries
- Real-time analytics dashboard

### 4. ASN & ISP Insights
- Autonomous System Number identification
- Internet Service Provider analysis
- Network provider traffic patterns

### 5. Port & Protocol Intelligence
- Deep analysis of network ports and protocols
- Detection of unusual or suspicious ports
- Database of common port services

### 6. IP Clustering & Grouping
- Subnet and CIDR-based IP grouping
- Network segmentation analysis
- Traffic pattern recognition

### 7. DNS & Domain Analytics
- Domain name system analysis
- Suspicious domain detection
- Reverse DNS lookup capabilities

### 8. VPN/Proxy/Tor Detection
- Identification of privacy-masked traffic
- VPN service detection
- Proxy and Tor network identification

### 9. Geo-time Correlation
- Timezone-based traffic analysis
- Off-hour activity detection
- Suspicious timing pattern identification

### 10. Network Path Tracing
- Traceroute functionality
- WHOIS lookup capabilities
- Network route visualization

## Demo Walkthrough

### Step 1: Access the Application
1. Open your web browser
2. Navigate to `http://localhost:5000`
3. You should see the Network Traffic Analyzer interface

### Step 2: Start Packet Capture
1. Select a network interface from the dropdown
2. Click "Start Capture"
3. Observe the real-time traffic statistics

### Step 3: Navigate to Threat Intelligence Dashboard
1. Click on the "Threat Intelligence" tab in the main navigation
2. Explore the different sections:
   - Dashboard Overview
   - Threat Intelligence
   - Flagged IPs
   - Privacy Masked IPs
   - Country Analytics
   - ASN & ISP Insights
   - Port & Protocol Intelligence
   - IP Clustering
   - DNS Analytics
   - Geo-Time Correlation
   - Network Path Tracing

### Step 4: Demonstrate Key Features

#### Threat Intelligence Dashboard
- Show the overview statistics for critical threats, high-risk IPs, etc.
- Demonstrate the real-time updating of threat data

#### Flagged IPs Section
- Display of malicious IP addresses detected in real-time
- Risk scoring and threat type classification

#### Privacy Masked IPs
- Detection of VPN, Proxy, and Tor connections
- Service provider identification

#### Country Analytics
- World map visualization of traffic origins
- Country-based traffic filtering

#### Network Path Tracing
- Demonstrate traceroute functionality
- Show WHOIS lookup capabilities

## API Endpoints for Testing

You can also test the backend APIs directly:

### Threat Intelligence APIs
```bash
# Get flagged IPs
curl http://localhost:5000/api/get_flagged_ips

# Get VPN/Proxy/Tor detection
curl http://localhost:5000/api/get_vpn_proxy_tor_detection

# Get privacy masked IPs
curl http://localhost:5000/api/get_privacy_masked_ips

# Get country analytics
curl http://localhost:5000/api/get_country_analytics

# Get ASN/ISP insights
curl http://localhost:5000/api/get_asn_isp_insights
```

### Network Intelligence APIs
```bash
# Get port and protocol intelligence
curl http://localhost:5000/api/get_port_protocol_intelligence

# Get IP clustering data
curl http://localhost:5000/api/get_ip_clustering

# Get DNS analytics
curl http://localhost:5000/api/get_dns_analytics

# Get geo-time correlation data
curl http://localhost:5000/api/get_geo_time_correlation
```

### Network Path Tracing
```bash
# Perform network path tracing
curl -X POST http://localhost:5000/api/network_path_trace \
  -H "Content-Type: application/json" \
  -d '{"ip":"8.8.8.8"}'
```

## Expected Results

As network traffic is captured, you should see:
1. Real-time updates in all dashboard components
2. Detection of flagged IPs based on threat intelligence feeds
3. Identification of privacy-masked traffic (VPN/Proxy/Tor)
4. Geographic distribution of network connections
5. Analysis of network ports and protocols
6. Clustering of IP addresses by subnet
7. DNS and domain analytics
8. Time-based correlation of network activity
9. Network path tracing results

## Troubleshooting

### No Data Displayed
- Ensure packet capture is running
- Wait for sufficient traffic to be captured
- Check that API keys are properly configured

### Connection Issues
- Verify the backend server is running on port 5000
- Check firewall settings
- Ensure no other application is using port 5000

### Missing Features
- Confirm all 10 network-level features have been implemented
- Check that all frontend components are properly integrated
- Verify API endpoints are returning expected data

## Conclusion

This fully-featured Network Threat Intelligence Dashboard provides comprehensive network security monitoring with real-time analytics and visualization. The 10 advanced features offer deep insights into network traffic patterns and potential security threats.