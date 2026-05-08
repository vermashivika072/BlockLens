import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings
from app.db.collections import (
    ANALYSIS_RESULTS_COLLECTION,
    BLOCKCHAIN_RECORDS_COLLECTION,
    CERTIFICATES_COLLECTION,
)
from app.services.auditor_service import audit_certificate
from app.services.ela_service import generate_ela_heatmap
from app.services.hashing_service import sha256_for_file
from app.services.nlp_service import analyze_text
from app.services.osint_service import verify_issuer
from app.services.phishing_service import validate_qr_url
from app.services.qr_service import generate_qr_code
from app.services.storage_service import as_public_path
from app.services.zkp_service import generate_proof

async def ingest_certificate(
    image_path_str: str,
    name: str,
    issuer: str,
    issue_date_str: str,
    expiry_date_str: str
):
    settings = get_settings()
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.heatmaps_dir.mkdir(parents=True, exist_ok=True)
    settings.qr_dir.mkdir(parents=True, exist_ok=True)

    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]

    source_path = Path(image_path_str)
    if not source_path.exists():
        print(f"File not found: {source_path}")
        return

    certificate_id = uuid4().hex
    # Copy file to uploads dir
    dest_path = settings.uploads_dir / f"{certificate_id}{source_path.suffix}"
    dest_path.write_bytes(source_path.read_bytes())

    print(f"Processing {name} from {issuer}...")

    # Generate metadata
    blockchain_hash = sha256_for_file(dest_path)
    verify_url, qr_path = generate_qr_code(certificate_id)
    
    # We set these manually as 'Real' parameters since the user wants them stored as valid
    extracted_text = f"Certificate for {name} issued by {issuer} on {issue_date_str}"
    osint = verify_issuer(issuer)
    nlp = analyze_text(extracted_text, issuer, settings.trusted_issuers)
    phishing = validate_qr_url(verify_url, settings.qr_whitelist_domains, settings.qr_blacklist_domains)
    blockchain_valid = True
    zkp = generate_proof(certificate_id, name, issuer, issue_date_str)
    
    try:
        ela_result = generate_ela_heatmap(dest_path)
    except Exception as e:
        print(f"Error generating ELA heatmap: {e}. Falling back to default.")
        ela_result = {
            "heatmap_path": str(dest_path), # fallback
            "tamper_score": 0.1,
            "mean_intensity": 100,
            "suspicious_regions": 0
        }

    ocr_result = {
        "extracted_text": extracted_text,
        "text_length": len(extracted_text),
        "warnings": [],
    }
    
    auditor = audit_certificate(
        ocr_result=ocr_result,
        nlp_result=nlp,
        ela_result=ela_result,
        osint_result=osint,
        blockchain_valid=blockchain_valid,
        phishing_result=phishing,
    )
    
    # Force 'Real' status for these custom ingested files
    auditor["verification_status"] = "real"
    auditor["fraud_probability"] = 0.05
    auditor["authenticity_score"] = 0.95

    certificate_doc = {
        "certificate_id": certificate_id,
        "name": name,
        "issuer": issuer,
        "issue_date": issue_date_str,
        "expiry_date": expiry_date_str,
        "qr_code": verify_url,
        "qr_code_url": as_public_path(qr_path),
        "blockchain_hash": blockchain_hash,
        "verification_status": auditor["verification_status"],
        "dataset_tag": "real",
        "file_path": str(dest_path),
        "original_image_url": as_public_path(dest_path),
        "heatmap_image_url": as_public_path(Path(ela_result.get("heatmap_path", dest_path))),
        "extracted_text": extracted_text,
        "authenticity_score": auditor["authenticity_score"],
        "fraud_probability": auditor["fraud_probability"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    analysis_doc = {
        "certificate_id": certificate_id,
        "analyzed_at": datetime.now(timezone.utc),
        "ocr": ocr_result,
        "nlp": nlp,
        "ela": {
            **ela_result,
            "heatmap_path": as_public_path(Path(ela_result.get("heatmap_path", dest_path))),
        },
        "osint": osint,
        "blockchain_valid": blockchain_valid,
        "phishing_check": phishing,
        "zkp": zkp,
        "auditor": auditor,
    }
    
    blockchain_doc = {
        "certificate_id": certificate_id,
        "hash": blockchain_hash,
        "stored_at": datetime.now(timezone.utc),
        "network": "simulated-sha256-chain",
    }

    await db[CERTIFICATES_COLLECTION].insert_one(certificate_doc)
    await db[ANALYSIS_RESULTS_COLLECTION].insert_one(analysis_doc)
    await db[BLOCKCHAIN_RECORDS_COLLECTION].insert_one(blockchain_doc)
    
    print(f"Successfully ingested {name}'s certificate! ID: {certificate_id}")

async def main():
    # Certificate 1: Shivika Verma, SAGE Winter School
    await ingest_certificate(
        r"C:\Users\verma\.gemini\antigravity\brain\88cbb185-f41f-4141-b581-d0ff980685d6\media__1778092748049.jpg",
        "Shivika Verma", "The SAGE Group", "2025-03-05", "2030-03-05"
    )
    # Certificate 2: JOHN ANDREW, Gandhinagar International Public School
    await ingest_certificate(
        r"C:\Users\verma\.gemini\antigravity\brain\88cbb185-f41f-4141-b581-d0ff980685d6\media__1778092766410.jpg",
        "JOHN ANDREW", "Gandhinagar International Public School", "2020-02-01", "2030-02-01"
    )
    # Certificate 3: MOHAMMED BASHIR MALA, YH Academy
    await ingest_certificate(
        r"C:\Users\verma\.gemini\antigravity\brain\88cbb185-f41f-4141-b581-d0ff980685d6\media__1778092769187.jpg",
        "MOHAMMED BASHIR MALA", "YH Academy", "2024-01-01", "2034-01-01"
    )
    # Certificate 4: Samuel Matshaba, University of Oxford
    await ingest_certificate(
        r"C:\Users\verma\.gemini\antigravity\brain\88cbb185-f41f-4141-b581-d0ff980685d6\media__1778092773021.jpg",
        "Samuel Matshaba", "University of Oxford", "2023-12-30", "2033-12-30"
    )

if __name__ == "__main__":
    asyncio.run(main())
