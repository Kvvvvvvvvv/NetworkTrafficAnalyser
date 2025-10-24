import requests
import json

# Start packet capture on Wi-Fi interface
url = "http://localhost:5000/api/start_capture"
payload = {
    "interface": "Wi-Fi"
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, data=json.dumps(payload), headers=headers)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")