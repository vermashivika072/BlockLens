import asyncio
import sys
import os

# Add backend dir to sys.path
sys.path.append(os.path.abspath("backend"))

from app.db.client import get_database
from app.db.collections import CERTIFICATES_COLLECTION, ANALYSIS_RESULTS_COLLECTION, BLOCKCHAIN_RECORDS_COLLECTION
from app.services.report_service import generate_pdf_report

async def test_pdf(cert_id):
    from motor.motor_asyncio import AsyncIOMotorClient
    from app.core.config import settings
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    certificate = await db[CERTIFICATES_COLLECTION].find_one({"certificate_id": cert_id})
    analysis = await db[ANALYSIS_RESULTS_COLLECTION].find_one({"certificate_id": cert_id})
    blockchain = await db[BLOCKCHAIN_RECORDS_COLLECTION].find_one({"certificate_id": cert_id})
    
    if not certificate:
        print("Certificate not found.")
        return
        
    try:
        pdf_buffer = generate_pdf_report(certificate, analysis or {}, blockchain)
        print("PDF generated successfully. Size:", len(pdf_buffer.getvalue()))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("cert_id")
    args = parser.parse_args()
    asyncio.run(test_pdf(args.cert_id))
