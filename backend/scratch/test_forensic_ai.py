import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(os.getcwd())

from app.services.ela_service import AdvancedForensicModule
from app.core.config import get_settings

async def test_ai_engine():
    settings = get_settings()
    print(f"Testing Gemini AI Forensic Engine...")
    print(f"API Key present: {bool(settings.gemini_api_key)}")
    
    # Try to find any uploaded image to test
    uploads = list(settings.uploads_dir.glob("*.png")) + list(settings.uploads_dir.glob("*.jpg"))
    
    if not uploads:
        print("No upload files found to test. Please upload a certificate first.")
        return

    test_image = uploads[0]
    print(f"Analyzing test image: {test_image.name}")
    
    forensics = AdvancedForensicModule(test_image)
    ai_boxes, ai_findings = forensics.run_ai_forensics()
    
    print("\n--- AI AUDIT RESULTS ---")
    print(f"AI Findings: {ai_findings}")
    print(f"Suspicious Regions Found: {len(ai_boxes)}")

if __name__ == "__main__":
    asyncio.run(test_ai_engine())
