import asyncio
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the backend directory to sys.path to import app modules
sys.path.append(os.getcwd())

from app.core.config import get_settings
from app.db.collections import BLOCKCHAIN_RECORDS_COLLECTION, CERTIFICATES_COLLECTION, ANALYSIS_RESULTS_COLLECTION

async def seed_demo_cert():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]
    
    cert_id = "demo-cert-1"
    file_hash = hashlib.sha256(cert_id.encode()).hexdigest()
    
    cert_doc = {
        "certificate_id": cert_id,
        "name": "Demo Candidate",
        "issuer": "CertiChain University",
        "issue_date": "2026-05-07",
        "expiry_date": "2029-05-07",
        "qr_code": f"http://localhost:8000/verify/{cert_id}",
        "qr_code_url": "",
        "blockchain_hash": file_hash,
        "verification_status": "real",
        "dataset_tag": "real",
        "file_path": "demo.png",
        "original_image_url": "",
        "heatmap_image_url": "",
        "extracted_text": "Demo Certificate Content",
        "authenticity_score": 0.99,
        "fraud_probability": 0.01,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    analysis_doc = {
        "certificate_id": cert_id,
        "analyzed_at": datetime.now(timezone.utc),
        "ocr": {"extracted_text": cert_doc["extracted_text"], "text_length": len(cert_doc["extracted_text"]), "warnings": []},
        "nlp": {"confidence_score": 0.99, "anomalies": []},
        "ela": {"heatmap_path": "", "tamper_score": 0.01, "confidence_category": "Genuine"},
        "osint": {"confidence": 0.99},
        "blockchain_valid": True,
        "qr_safety": {"is_safe": True, "risk_score": 0.01, "reasons": [], "url": "https://google.com", "can_navigate": True},
        "zkp": {"proof": "demo-proof", "proof_type": "Groth16", "verifiable_claim": "Demo Claim"},
        "auditor": {
            "verification_status": "real",
            "authenticity_score": 0.99,
            "fraud_probability": 0.01,
            "explanation": ["Blockchain verified.", "Demo certificate."],
            "forensic_category": "Genuine"
        },
    }

    await db[CERTIFICATES_COLLECTION].update_one({"certificate_id": cert_id}, {"$set": cert_doc}, upsert=True)
    await db[ANALYSIS_RESULTS_COLLECTION].update_one({"certificate_id": cert_id}, {"$set": analysis_doc}, upsert=True)
    await db[BLOCKCHAIN_RECORDS_COLLECTION].update_one({"certificate_id": cert_id}, {"$set": {"certificate_id": cert_id, "hash": file_hash, "stored_at": datetime.now(timezone.utc)}}, upsert=True)
    
    print(f"Successfully seeded {cert_id}")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_demo_cert())
