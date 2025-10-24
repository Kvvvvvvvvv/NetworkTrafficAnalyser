import requests
import json

def test_geoip_features():
    """Test the GeoIP and country analytics features"""
    
    print("Testing GeoIP and Country Analytics Features...")
    print("=" * 50)
    
    # Test 1: Get GeoIP data
    print("1. Testing /api/get_geoip_data")
    try:
        response = requests.get("http://localhost:5000/api/get_geoip_data")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   GeoIP Data Count: {len(data.get('geoip_data', []))}")
        if data.get('geoip_data'):
            sample = data['geoip_data'][0]
            print(f"   Sample GeoIP Data: {sample.get('country', 'N/A')} ({sample.get('ip', 'N/A')})")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Get country analytics
    print("\n2. Testing /api/get_country_analytics")
    try:
        response = requests.get("http://localhost:5000/api/get_country_analytics")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Country Data Count: {len(data.get('country_data', []))}")
        if data.get('country_data'):
            sample = data['country_data'][0]
            print(f"   Sample Country Data: {sample.get('country', 'N/A')} ({sample.get('bytes', 0)} bytes)")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Filter country traffic
    print("\n3. Testing /api/filter_country_traffic")
    try:
        payload = {
            "filter_type": "all"
        }
        response = requests.post("http://localhost:5000/api/filter_country_traffic", 
                               json=payload)
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Filtered IPs Count: {len(data.get('filtered_ips', {}))}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: World map bubbles
    print("\n4. Testing /api/get_world_map_bubbles")
    try:
        response = requests.get("http://localhost:5000/api/get_world_map_bubbles")
        print(f"   Status Code: {response.status_code}")
        data = response.json()
        print(f"   Status: {data.get('status')}")
        print(f"   Bubble Data Count: {len(data.get('bubble_data', []))}")
        if data.get('bubble_data'):
            sample = data['bubble_data'][0]
            print(f"   Sample Bubble Data: {sample.get('country', 'N/A')} ({sample.get('ip', 'N/A')})")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("GeoIP feature testing completed!")

if __name__ == "__main__":
    test_geoip_features()