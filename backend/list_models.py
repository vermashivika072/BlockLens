import google.generativeai as genai
from app.core.config import get_settings
import os
import sys

sys.path.append(os.path.abspath('c:/Users/verma/Desktop/certichain-aura-main (2)/certichain-aura-main/backend'))

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
