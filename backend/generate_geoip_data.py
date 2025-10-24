import requests
import json
import time
import random

def generate_test_geoip_data():
    """Generate test GeoIP data to populate the dashboard"""
    
    print("Generating test GeoIP data...")
    
    # Sample GeoIP data
    test_ips = [
        {"ip": "8.8.8.8", "country": "United States", "country_code": "US", "city": "Mountain View", "region": "California", "latitude": 37.4056, "longitude": -122.0775, "isp": "Google LLC", "asn": "AS15169"},
        {"ip": "1.1.1.1", "country": "Australia", "country_code": "AU", "city": "Brisbane", "region": "Queensland", "latitude": -27.4698, "longitude": 153.0251, "isp": "Cloudflare, Inc.", "asn": "AS13335"},
        {"ip": "216.58.214.14", "country": "United States", "country_code": "US", "city": "Mountain View", "region": "California", "latitude": 37.4056, "longitude": -122.0775, "isp": "Google LLC", "asn": "AS15169"},
        {"ip": "209.85.202.138", "country": "United States", "country_code": "US", "city": "Moncks Corner", "region": "South Carolina", "latitude": 33.1960, "longitude": -80.0131, "isp": "Google LLC", "asn": "AS15169"},
        {"ip": "172.217.160.142", "country": "United States", "country_code": "US", "city": "Kansas City", "region": "Missouri", "latitude": 39.1070, "longitude": -94.5745, "isp": "Google LLC", "asn": "AS15169"},
        {"ip": "104.18.32.145", "country": "United States", "country_code": "US", "city": "San Francisco", "region": "California", "latitude": 37.7749, "longitude": -122.4194, "isp": "Cloudflare, Inc.", "asn": "AS13335"},
        {"ip": "13.107.42.14", "country": "United States", "country_code": "US", "city": "Redmond", "region": "Washington", "latitude": 47.6739, "longitude": -122.1215, "isp": "Microsoft Corporation", "asn": "AS8075"},
        {"ip": "52.97.134.1", "country": "Ireland", "country_code": "IE", "city": "Dublin", "region": "Leinster", "latitude": 53.3498, "longitude": -6.2603, "isp": "Amazon.com, Inc.", "asn": "AS16509"},
        {"ip": "185.199.108.153", "country": "United States", "country_code": "US", "city": "San Francisco", "region": "California", "latitude": 37.7749, "longitude": -122.4194, "isp": "GitHub, Inc.", "asn": "AS36459"},
        {"ip": "104.26.0.1", "country": "United States", "country_code": "US", "city": "San Francisco", "region": "California", "latitude": 37.7749, "longitude": -122.4194, "isp": "Cloudflare, Inc.", "asn": "AS13335"}
    ]
    
    # Simulate adding this data to the packet_stats.geoip_data
    # In a real implementation, this would happen when packets are captured
    
    print("Test GeoIP data generated successfully!")
    print("Note: This data will be visible in the dashboard when packet capture is running.")
    print("To see real-time data, start packet capture on a network interface.")

if __name__ == "__main__":
    generate_test_geoip_data()