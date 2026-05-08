import sys
import os
import asyncio

sys.path.append(os.path.abspath('c:/Users/verma/Desktop/certichain-aura-main (2)/certichain-aura-main/backend'))

from app.core.config import get_settings
import google.generativeai as genai

async def test():
    settings = get_settings()
    api_key = settings.gemini_api_key
    print(f"API Key present: {bool(api_key)}")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-flash-latest")
        chat = model.start_chat(history=[])
        response = chat.send_message("Hello")
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
