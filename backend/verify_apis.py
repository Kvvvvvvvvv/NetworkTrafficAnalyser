import requests
import json

def verify_threat_intel_apis():
    """Verify that all threat intelligence APIs are working correctly"""
    
    base_url = "http://localhost:5000"
    
    # List of all threat intelligence APIs to test
    apis = [
        ("/api/get_flagged_ips", "Flagged IPs"),
        ("/api/get_vpn_proxy_tor_detection", "VPN/Proxy/Tor Detection"),
        ("/api/get_privacy_masked_ips", "Privacy Masked IPs"),
        ("/api/get_country_analytics", "Country Analytics"),
        ("/api/get_asn_isp_insights", "ASN/ISP Insights"),
        ("/api/get_port_protocol_intelligence", "Port/Protocol Intelligence"),
        ("/api/get_ip_clustering", "IP Clustering"),
        ("/api/get_dns_analytics", "DNS Analytics"),
        ("/api/get_geo_time_correlation", "Geo-Time Correlation"),
        ("/api/threat_intel_status", "Threat Intel Status")
    ]
    
    print("Verifying Threat Intelligence APIs...")
    print("=" * 50)
    
    all_passed = True
    
    for endpoint, name in apis:
        try:
            response = requests.get(base_url + endpoint)
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                if status == 'success':
                    print(f"✓ {name}: PASSED")
                else:
                    print(f"✗ {name}: FAILED - {data.get('message', 'Unknown error')}")
                    all_passed = False
            else:
                print(f"✗ {name}: FAILED - HTTP {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"✗ {name}: FAILED - {str(e)}")
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("All Threat Intelligence APIs are working correctly!")
    else:
        print("Some APIs failed. Check the errors above.")
    
    return all_passed

def verify_network_intel_apis():
    """Verify that all network intelligence APIs are working correctly"""
    
    base_url = "http://localhost:5000"
    
    # List of all network intelligence APIs to test
    apis = [
        ("/api/get_ip_grouping_by_activity", "IP Grouping by Activity"),
        ("/api/get_port_country_correlation", "Port/Country Correlation"),
        ("/api/get_world_map_bubbles", "World Map Bubbles"),
        ("/api/interfaces", "Network Interfaces")  # Fixed endpoint
    ]
    
    print("\nVerifying Network Intelligence APIs...")
    print("=" * 50)
    
    all_passed = True
    
    for endpoint, name in apis:
        try:
            response = requests.get(base_url + endpoint)
            if response.status_code == 200:
                data = response.json()
                status = data.get('status', 'unknown')
                if status == 'success' or endpoint == "/api/interfaces":  # Special case for interfaces
                    print(f"✓ {name}: PASSED")
                else:
                    print(f"✗ {name}: FAILED - {data.get('message', 'Unknown error')}")
                    all_passed = False
            else:
                print(f"✗ {name}: FAILED - HTTP {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"✗ {name}: FAILED - {str(e)}")
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("All Network Intelligence APIs are working correctly!")
    else:
        print("Some APIs failed. Check the errors above.")
    
    return all_passed

def main():
    """Main function to run all API verification tests"""
    print("Network Threat Intelligence Dashboard - API Verification")
    print("=" * 60)
    
    threat_passed = verify_threat_intel_apis()
    network_passed = verify_network_intel_apis()
    
    print("\n" + "=" * 60)
    if threat_passed and network_passed:
        print("🎉 ALL APIS ARE WORKING CORRECTLY! 🎉")
        print("\nYou can now access the fully-featured threat intelligence dashboard at:")
        print("http://localhost:5000")
        print("\nRefer to DEMO_GUIDE.md for a complete walkthrough of all features.")
    else:
        print("❌ SOME APIS ARE NOT WORKING CORRECTLY")
        print("\nPlease check the errors above and ensure the backend server is running properly.")

if __name__ == "__main__":
    main()