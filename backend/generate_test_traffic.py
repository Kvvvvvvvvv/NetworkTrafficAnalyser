import requests
import time
import random

def generate_test_traffic():
    """Generate some test traffic to populate the threat intelligence dashboard"""
    
    print("Generating test traffic for threat intelligence dashboard...")
    
    # List of known malicious IPs for testing
    malicious_ips = [
        "192.168.1.100",
        "10.0.0.50",
        "172.16.0.75",
        "203.0.113.5",  # VPN IP
        "198.51.100.23",  # Proxy IP
        "192.0.2.178",  # Tor IP
        "198.51.100.45",  # Another Tor IP
        "192.168.2.200",
        "10.10.10.10"
    ]
    
    # List of countries for GeoIP testing
    countries = [
        {"ip": "8.8.8.8", "country": "United States", "city": "Mountain View"},
        {"ip": "1.1.1.1", "country": "Australia", "city": "Brisbane"},
        {"ip": "216.58.214.14", "country": "United States", "city": "Mountain View"},
        {"ip": "209.85.202.138", "country": "United States", "city": "Moncks Corner"},
        {"ip": "172.217.160.142", "country": "United States", "city": "Kansas City"},
        {"ip": "172.217.160.142", "country": "United States", "city": "Kansas City"},
        {"ip": "172.217.160.142", "country": "United States", "city": "Kansas City"},
        {"ip": "172.217.160.142", "country": "United States", "city": "Kansas City"},
        {"ip": "172.217.160.142", "country": "United States", "city": "Kansas City"},
        {"ip": "172.217.160.142", "country": "United States", "city": "Kansas City"}
    ]
    
    # Simulate traffic by making requests to the backend APIs
    try:
        # Simulate checking flagged IPs
        print("1. Checking flagged IPs...")
        response = requests.get("http://localhost:5000/api/get_flagged_ips")
        print(f"   Response: {response.status_code}")
        
        # Simulate checking VPN/Proxy/Tor detection
        print("2. Checking VPN/Proxy/Tor detection...")
        response = requests.get("http://localhost:5000/api/get_vpn_proxy_tor_detection")
        print(f"   Response: {response.status_code}")
        
        # Simulate checking privacy masked IPs
        print("3. Checking privacy masked IPs...")
        response = requests.get("http://localhost:5000/api/get_privacy_masked_ips")
        print(f"   Response: {response.status_code}")
        
        # Simulate checking country analytics
        print("4. Checking country analytics...")
        response = requests.get("http://localhost:5000/api/get_country_analytics")
        print(f"   Response: {response.status_code}")
        
        # Simulate checking ASN/ISP insights
        print("5. Checking ASN/ISP insights...")
        response = requests.get("http://localhost:5000/api/get_asn_isp_insights")
        print(f"   Response: {response.status_code}")
        
        print("\nTest traffic generation completed!")
        print("Note: Actual threat intelligence data will populate as real network traffic is captured.")
        
    except Exception as e:
        print(f"Error generating test traffic: {e}")

if __name__ == "__main__":
    generate_test_traffic()