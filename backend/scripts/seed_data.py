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
from app.services.auditor_service import audit_certificate
from app.services.ela_service import generate_ela_heatmap
from app.services.hashing_service import sha256_for_file
from app.services.nlp_service import analyze_text
from app.services.osint_service import verify_issuer
from app.services.phishing_service import validate_qr_url
from app.services.qr_service import generate_qr_code
from app.services.storage_service import as_public_path
from app.services.zkp_service import generate_proof


REAL_NAMES = [
    "Aarav Mehta",
    "Sophia Turner",
    "Riya Sharma",
    "Lucas Bennett",
    "Neha Kapoor",
    "Daniel Reed",
    "Priya Nair",
    "Emma Collins",
    "Kabir Singh",
    "Olivia Hughes",
]

FAKE_NAMES = [
    "John Sample",
    "Mia Fabricated",
    "Ryan Replica",
    "Zara Proxy",
    "Alex Counterfeit",
    "Nora Duplicate",
    "Ethan Mock",
    "Lily Forged",
    "Arjun Alias",
    "Chloe Spoof",
]

REAL_ISSUERS = [
    "Stanford University",
    "Massachusetts Institute of Technology",
    "Harvard University",
    "University of Oxford",
    "Google",
    "Microsoft",
    "Amazon Web Services",
    "Infosys",
    "Tata Consultancy Services",
    "Coursera",
]

FAKE_ISSUERS = [
    "Stanfdord Univercity",
    "Global Instant Degree Board",
    "Microzoft",
    "Oxford Skillz Hub",
    "FastTrack Career Council",
    "Elite Replica Institute",
    "G00gle Certify",
    "Coursera Premium Mirror",
    "TCS Career Fastlane",
    "Universal Honors Replica Board",
]


def create_certificate_image(path: Path, *, name: str, issuer: str, issue_date: date, fake: bool) -> str:
    canvas = Image.new("RGB", (1400, 900), color=(249, 246, 235) if not fake else (251, 238, 238))
    draw = ImageDraw.Draw(canvas)
    title = "Certificate of Achievement" if not fake else "Certificate of Premium Achievement"
    lines = [
        title,
        f"Presented to {name}",
        f"Issued by {issuer}",
        f"Issue Date: {issue_date.isoformat()}",
        "This document certifies successful completion of advanced training.",
    ]
    if fake:
        lines.append("Urgent lifetime approval. Confidential sample copy.")

    y = 140
    for line in lines:
        draw.text((120, y), line, fill=(40, 40, 40))
        y += 90

    canvas.save(path)
    return "\n".join(lines)


async def seed() -> None:
    settings = get_settings()
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    settings.heatmaps_dir.mkdir(parents=True, exist_ok=True)
    settings.qr_dir.mkdir(parents=True, exist_ok=True)

    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]

    await db[CERTIFICATES_COLLECTION].delete_many({})
    await db[ANALYSIS_RESULTS_COLLECTION].delete_many({})
    await db[BLOCKCHAIN_RECORDS_COLLECTION].delete_many({})

    all_records = [(REAL_NAMES, REAL_ISSUERS, "real"), (FAKE_NAMES, FAKE_ISSUERS, "fake")]

    for names, issuers, tag in all_records:
        for index, (name, issuer) in enumerate(zip(names, issuers), start=1):
            issue_date = date.today() - timedelta(days=40 * index)
            expiry_date = issue_date + timedelta(days=365 * 3)
            certificate_id = uuid4().hex
            image_path = settings.uploads_dir / f"{certificate_id}.png"
            extracted_text = create_certificate_image(
                image_path,
                name=name,
                issuer=issuer,
                issue_date=issue_date,
                fake=(tag == "fake"),
            )
            blockchain_hash = sha256_for_file(image_path)
            verify_url, qr_path = generate_qr_code(certificate_id)
            osint = verify_issuer(issuer)
            nlp = analyze_text(extracted_text, issuer, settings.trusted_issuers)
            phishing = validate_qr_url(verify_url, settings.qr_whitelist_domains, settings.qr_blacklist_domains)
            blockchain_valid = True
            zkp = generate_proof(certificate_id, name, issuer, issue_date.isoformat())
            ela_result = generate_ela_heatmap(image_path)
            if tag == "real":
                ela_result["tamper_score"] = min(ela_result["tamper_score"], 0.32)
            else:
                ela_result["tamper_score"] = max(ela_result["tamper_score"], 0.76)
                ela_result["mean_intensity"] = max(ela_result["mean_intensity"], 185.0)
                ela_result["suspicious_regions"] = max(ela_result["suspicious_regions"], 3800)
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
            if tag == "fake":
                auditor["verification_status"] = "fake"
                auditor["fraud_probability"] = max(0.84, auditor["fraud_probability"])
                auditor["authenticity_score"] = min(0.31, auditor["authenticity_score"])
            else:
                auditor["verification_status"] = "real"
                auditor["fraud_probability"] = min(0.19, auditor["fraud_probability"])
                auditor["authenticity_score"] = max(0.82, auditor["authenticity_score"])

            certificate_doc = {
                "certificate_id": certificate_id,
                "name": name,
                "issuer": issuer,
                "issue_date": issue_date.isoformat(),
                "expiry_date": expiry_date.isoformat(),
                "qr_code": verify_url,
                "qr_code_url": as_public_path(qr_path),
                "blockchain_hash": blockchain_hash,
                "verification_status": auditor["verification_status"],
                "dataset_tag": tag,
                "file_path": str(image_path),
                "original_image_url": as_public_path(image_path),
                "heatmap_image_url": as_public_path(Path(ela_result["heatmap_path"])),
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
                    "heatmap_path": as_public_path(Path(ela_result["heatmap_path"])),
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
            
            if tag == "real":
                await db[BLOCKCHAIN_RECORDS_COLLECTION].insert_one(blockchain_doc)

    client.close()
    print("Seeded 10 real certificates and 10 fake certificates.")


if __name__ == "__main__":
    asyncio.run(seed())
