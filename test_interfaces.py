import psutil

def get_network_interfaces():
    """Get list of available network interfaces"""
    interfaces = []
    for interface, addrs in psutil.net_if_addrs().items():
        interfaces.append(interface)
    return interfaces

if __name__ == "__main__":
    print("Available network interfaces:")
    interfaces = get_network_interfaces()
    for i, interface in enumerate(interfaces):
        print(f"{i+1}. {interface}")
    
    print(f"\nTotal interfaces found: {len(interfaces)}")