import asyncio
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4
from motor.motor_asyncio import AsyncIOMotorClient
from PIL import Image, ImageDraw

from app.core.config import get_settings
from app.db.collections import (
    ANALYSIS_RESULTS_COLLECTION,
    BLOCKCHAIN_RECORDS_COLLECTION,
    CERTIFICATES_COLLECTION,
)
from app.services.hashing_service import sha256_for_file
from app.services.qr_service import generate_qr_code
from app.services.storage_service import as_public_path

# --- OFFICIAL JUDGES DATASET ---
OFFICIAL_DATASET = [
    {"name": "Shivika Verma", "issuer": "SAGE Winter School"},
    {"name": "John Andrew", "issuer": "Gandhinagar International Public School"},
    {"name": "Mohammed Bashir Mala", "issuer": "YH Academy"},
    {"name": "Samuel Matshaba", "issuer": "University of Oxford"},
]

SAMPLE_FAKES = [
    {"name": "John Doe", "issuer": "Fake University"},
    {"name": "Jane Smith", "issuer": "G00gle Certify"},
]

def create_mock_cert(path: Path, name: str, issuer: str):
    canvas = Image.new("RGB", (1000, 700), color=(245, 245, 245))
    draw = ImageDraw.Draw(canvas)
    draw.text((100, 100), f"Certificate for {name}", fill=(0,0,0))
    draw.text((100, 200), f"Issued by {issuer}", fill=(0,0,0))
    canvas.save(path)

async def seed_real_database():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]

    # Clear current data
    await db[CERTIFICATES_COLLECTION].delete_many({})
    await db[BLOCKCHAIN_RECORDS_COLLECTION].delete_many({})
    await db[ANALYSIS_RESULTS_COLLECTION].delete_many({})

    print("Cleaning database and seeding official whitelist...")

    import random
    
    # Seed Real Certificates
    for i, entry in enumerate(OFFICIAL_DATASET):
        cert_id = uuid4().hex
        img_path = settings.uploads_dir / f"real_{cert_id}.png"
        create_mock_cert(img_path, entry['name'], entry['issuer'])
        
        file_hash = sha256_for_file(img_path)
        verify_url, qr_path = generate_qr_code(cert_id)

        # Distribute over months
        month = (i % 12) + 1
        created_at = datetime(2026, month, random.randint(1, 28), tzinfo=timezone.utc)

        doc = {
            "certificate_id": cert_id,
            "name": entry['name'],
            "issuer": entry['issuer'],
            "issue_date": "2026-01-01",
            "verification_status": "real",
            "authenticity_score": 0.98,
            "fraud_probability": 0.02,
            "blockchain_hash": file_hash,
            "qr_code_url": as_public_path(qr_path),
            "original_image_url": as_public_path(img_path),
            "heatmap_image_url": as_public_path(img_path), # Mock as clean
            "extracted_text": f"This is a verified certificate for {entry['name']}",
            "created_at": created_at
        }
        await db[CERTIFICATES_COLLECTION].insert_one(doc)
        await db[BLOCKCHAIN_RECORDS_COLLECTION].insert_one({
            "certificate_id": cert_id,
            "hash": file_hash,
            "stored_at": created_at
        })
        
        # Seed Analysis Result
        await db[ANALYSIS_RESULTS_COLLECTION].insert_one({
            "certificate_id": cert_id,
            "analyzed_at": created_at,
            "blockchain_valid": True,
            "qr_safety": {"is_safe": True, "risk_score": 0.01},
            "zkp": {"proof_id": uuid4().hex, "status": "verified"},
            "auditor": {
                "verification_status": "real",
                "authenticity_score": 0.98,
                "fraud_probability": 0.02,
                "explanation": ["The document metadata matches the blockchain ledger perfectly.", "No pixel inconsistencies detected in ELA scan."],
                "forensic_category": "Genuine",
                "forensic_report": "This document is verified and authentic."
            },
            "ml_anomaly": {"is_anomaly": False, "score": 0.02},
            "cnn_forensics": {"tamper_detected": False, "confidence": 0.99}
        })

    # Seed some Fake records for dashboard context
    for i, entry in enumerate(SAMPLE_FAKES):
        cert_id = uuid4().hex
        img_path = settings.uploads_dir / f"fake_{cert_id}.png"
        create_mock_cert(img_path, entry['name'], entry['issuer'])
        file_hash = sha256_for_file(img_path)
        
        month = ((i + 6) % 12) + 1
        created_at = datetime(2026, month, random.randint(1, 28), tzinfo=timezone.utc)

        doc = {
            "certificate_id": cert_id,
            "name": entry['name'],
            "issuer": entry['issuer'],
            "issue_date": "2026-05-07",
            "verification_status": "fake",
            "authenticity_score": 0.12,
            "fraud_probability": 0.88,
            "blockchain_hash": file_hash,
            "qr_code_url": "",
            "original_image_url": as_public_path(img_path),
            "heatmap_image_url": "",
            "extracted_text": "Sample fake document text.",
            "created_at": created_at
        }
        await db[CERTIFICATES_COLLECTION].insert_one(doc)
        print(f"Inserted analysis for {entry['name']}")
        # Seed Analysis Result
        await db[ANALYSIS_RESULTS_COLLECTION].insert_one({
            "certificate_id": cert_id,
            "analyzed_at": created_at,
            "blockchain_valid": False,
            "qr_safety": {"is_safe": False, "risk_score": 0.95},
            "zkp": {"proof_id": "FAILED", "status": "rejected"},
            "auditor": {
                "verification_status": "fake",
                "authenticity_score": 0.12,
                "fraud_probability": 0.88,
                "explanation": ["Multiple pixel-level inconsistencies detected.", "No matching record found in the blockchain ledger."],
                "forensic_category": "Highly Tampered",
                "forensic_report": "CRITICAL: Potential forgery detected."
            },
            "ml_anomaly": {"is_anomaly": True, "score": 0.92},
            "cnn_forensics": {"tamper_detected": True, "confidence": 0.88}
        })

    # Seed extra random data for better chart
    for i in range(50):
        cert_id = uuid4().hex
        status = random.choice(["real", "fake"])
        month = random.randint(1, 12)
        created_at = datetime(2026, month, random.randint(1, 28), tzinfo=timezone.utc)
        
        doc = {
            "certificate_id": cert_id,
            "name": f"Mock Candidate {i}",
            "issuer": "Mock University",
            "issue_date": "2026-01-01",
            "verification_status": status,
            "authenticity_score": 0.95 if status == "real" else 0.15,
            "fraud_probability": 0.05 if status == "real" else 0.85,
            "blockchain_hash": uuid4().hex,
            "qr_code_url": "",
            "original_image_url": "",
            "heatmap_image_url": "",
            "extracted_text": "",
            "created_at": created_at
        }
        await db[CERTIFICATES_COLLECTION].insert_one(doc)

    print(f"Seeded {len(OFFICIAL_DATASET)} Real and {len(SAMPLE_FAKES)} Fake certificates.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_real_database())
