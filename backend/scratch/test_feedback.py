import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_feedback(content, email="testuser@example.com"):
    print(f"\n--- Testing Feedback: '{content}' ---")
    payload = {
        "user_email": email,
        "content": content
    }
    try:
        response = requests.post(f"{BASE_URL}/feedback/submit", json=payload)
        print(f"Status Code: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test 1: Positive
    test_feedback("I love this platform! It's super fast and easy to use.")
    
    # Test 2: Negative/Frustrated
    test_feedback("I am very frustrated. The scanner keeps failing and the UI is confusing!!", email="angry.user@domain.com")
