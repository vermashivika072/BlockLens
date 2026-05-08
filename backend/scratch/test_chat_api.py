import requests
import json

def test_chat():
    url = "http://localhost:8000/chat"
    payload = {
        "message": "What is the forensic result of my last scan?",
        "history": []
    }
    headers = {"Content-Type": "application/json"}
    
    print(f"Sending request to {url}...")
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    test_chat()
