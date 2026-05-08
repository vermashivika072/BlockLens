import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)
# Using standard model name for generativeai SDK
model = genai.GenerativeModel("gemini-1.5-flash-latest")

try:
    print("Sending request...")
    response = model.generate_content("Hello, reply briefly.")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
