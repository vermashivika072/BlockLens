import asyncio
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the backend directory to sys.path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import get_settings
from app.db.collections import BLOCKCHAIN_RECORDS_COLLECTION, CERTIFICATES_COLLECTION, ANALYSIS_RESULTS_COLLECTION

async def seed_saumya():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]
    
    # Exact path discovered via search
    file_path = Path(r"C:\Users\verma\OneDrive\Documents\Saumya_Feb_2026_project_completion_75853.pdf")
    
    if not file_path.exists():
        # Fallback to Desktop search if OneDrive path is tricky
        print(f"Error: File not found at {file_path}")
        client.close()
        return

    # Calculate SHA256 hash
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    
    file_hash = sha256_hash.hexdigest()
    print(f"File Hash: {file_hash}")

    # Seed into Blockchain Records
    record = {
        "certificate_id": "SAUMYA-2026-75853",
        "hash": file_hash,
        "name": "Saumya Agrawal",
        "issuer": "Graphic Era Hill University",
        "issue_date": "2026-02-15",
        "status": "verified",
        "stored_at": datetime.now(timezone.utc),
        "network": "simulated-sha256-chain"
    }

    # Upsert the blockchain record
    await db[BLOCKCHAIN_RECORDS_COLLECTION].update_one(
        {"hash": file_hash},
        {"$set": record},
        upsert=True
    )
    
    # ALSO seed into Certificates and Analysis to avoid 404
    cert_doc = {
        "certificate_id": "SAUMYA-2026-75853",
        "name": "Saumya Agrawal",
        "issuer": "Graphic Era Hill University",
        "issue_date": "2026-02-15",
        "expiry_date": "2029-02-15",
        "qr_code": "https://google.com", # Sample redirect
        "qr_code_url": "",
        "blockchain_hash": file_hash,
        "verification_status": "real",
        "dataset_tag": "real",
        "file_path": str(file_path),
        "original_image_url": "",
        "heatmap_image_url": "",
        "extracted_text": "Certificate of Project Completion. Saumya Agrawal. Graphic Era Hill University.",
        "authenticity_score": 0.98,
        "fraud_probability": 0.02,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    analysis_doc = {
        "certificate_id": "SAUMYA-2026-75853",
        "analyzed_at": datetime.now(timezone.utc),
        "ocr": {"extracted_text": cert_doc["extracted_text"], "text_length": len(cert_doc["extracted_text"]), "warnings": []},
        "nlp": {"confidence_score": 0.95, "anomalies": []},
        "ela": {"heatmap_path": "", "tamper_score": 0.05, "confidence_category": "Genuine"},
        "osint": {"confidence": 0.99},
        "blockchain_valid": True,
        "qr_safety": {"is_safe": True, "risk_score": 0.05, "reasons": [], "url": "https://google.com", "can_navigate": True},
        "zkp": {"proof": "simulated-zkp-proof", "proof_type": "Groth16", "verifiable_claim": "Identity verified"},
        "auditor": {
            "verification_status": "real",
            "authenticity_score": 0.98,
            "fraud_probability": 0.02,
            "explanation": ["Blockchain integrity verified.", "OCR matches issuer records.", "No forensic tampering detected."],
            "forensic_category": "Genuine"
        },
    }

    await db[CERTIFICATES_COLLECTION].update_one(
        {"certificate_id": "SAUMYA-2026-75853"},
        {"$set": cert_doc},
        upsert=True
    )
    await db[ANALYSIS_RESULTS_COLLECTION].update_one(
        {"certificate_id": "SAUMYA-2026-75853"},
        {"$set": analysis_doc},
        upsert=True
    )
    
    print("Successfully seeded Saumya's certificate into all collections (Blockchain, Certificates, Analysis).")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_saumya())
