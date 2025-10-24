import requests
import time

def test_threat_intel_apis():
    """Test the threat intelligence APIs to verify they're working with real data"""
    
    print("Testing Threat Intelligence APIs...")
    
    # Test 1: Get flagged IPs
    print("\n1. Testing /api/get_flagged_ips")
    try:
        response = requests.get("http://localhost:5000/api/get_flagged_ips")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Flagged IPs Count: {len(data.get('flagged_ips', []))}")
        if data.get('flagged_ips'):
            print(f"   Sample Flagged IP: {data['flagged_ips'][0] if data['flagged_ips'] else 'None'}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Get VPN/Proxy/Tor detection
    print("\n2. Testing /api/get_vpn_proxy_tor_detection")
    try:
        response = requests.get("http://localhost:5000/api/get_vpn_proxy_tor_detection")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        vpn_data = data.get('vpn_proxy_tor_data', {})
        print(f"   VPN IPs Count: {vpn_data.get('total_vpn', 0)}")
        print(f"   Proxy IPs Count: {vpn_data.get('total_proxy', 0)}")
        print(f"   Tor IPs Count: {vpn_data.get('total_tor', 0)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Get privacy masked IPs
    print("\n3. Testing /api/get_privacy_masked_ips")
    try:
        response = requests.get("http://localhost:5000/api/get_privacy_masked_ips")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Privacy IPs Count: {len(data.get('privacy_ips', []))}")
        if data.get('privacy_ips'):
            print(f"   Sample Privacy IP: {data['privacy_ips'][0] if data['privacy_ips'] else 'None'}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Get country analytics
    print("\n4. Testing /api/get_country_analytics")
    try:
        response = requests.get("http://localhost:5000/api/get_country_analytics")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Countries Count: {len(data.get('country_data', []))}")
        if data.get('country_data'):
            print(f"   Top Country: {data['country_data'][0]['country'] if data['country_data'] else 'None'}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\nAPI testing completed!")

if __name__ == "__main__":
    test_threat_intel_apis()