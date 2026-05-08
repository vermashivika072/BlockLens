import urllib.request
import sys

try:
    url = "http://127.0.0.1:8000/report/6518395591344db5b2c2813ba6e75580"
    print(f"Fetching {url}")
    response = urllib.request.urlopen(url)
    print("Success! Status:", response.status)
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print("Response body:")
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
