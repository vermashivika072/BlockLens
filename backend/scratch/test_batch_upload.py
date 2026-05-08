import requests
import io

url = "http://127.0.0.1:8000/api/v1/batch/upload"
headers = {} # No auth token for now, let's see if we get 401
# Create dummy files
files = [
    ('files', ('test1.pdf', b'dummy content', 'application/pdf')),
    ('files', ('test2.png', b'dummy content', 'image/png'))
]

response = requests.post(url, files=files, headers=headers)
print("Status:", response.status_code)
print("Response:", response.text)
