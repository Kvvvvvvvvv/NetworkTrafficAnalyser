import requests
import time
import random

def simulate_network_traffic():
    """Simulate network traffic to populate GeoIP data"""
    
    print("Simulating network traffic with GeoIP data...")
    
    # List of IPs to simulate traffic for
    test_ips = [
        "8.8.8.8",      # Google DNS - US
        "1.1.1.1",      # Cloudflare DNS - Australia
        "216.58.214.14", # Google - US
        "209.85.202.138", # Google - US
        "172.217.160.142", # Google - US
        "104.18.32.145", # Cloudflare - US
        "13.107.42.14",  # Microsoft - US
        "52.97.134.1",   # Amazon - Ireland
        "185.199.108.153", # GitHub - US
        "104.26.0.1"     # Cloudflare - US
    ]
    
    # Simulate traffic by making requests to check these IPs
    for ip in test_ips:
        try:
            print(f"Simulating traffic for {ip}...")
            response = requests.post("http://localhost:5000/api/check_ip", 
                                   json={"ip": ip})
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    print(f"  ✓ Successfully checked {ip}")
                else:
                    print(f"  ✗ Failed to check {ip}: {data.get('message', 'Unknown error')}")
            else:
                print(f"  ✗ HTTP {response.status_code} for {ip}")
        except Exception as e:
            print(f"  ✗ Error checking {ip}: {e}")
        
        # Small delay between requests
        time.sleep(0.5)
    
    print("\nTraffic simulation completed!")
    print("You can now refresh the GeoIP dashboard to see the data.")

if __name__ == "__main__":
    simulate_network_traffic()