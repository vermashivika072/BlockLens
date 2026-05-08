import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict

from app.db.collections import BATCH_JOBS_COLLECTION, CERTIFICATES_COLLECTION
from app.services.certificate_service import create_certificate_record
from app.services.storage_service import save_upload

async def process_batch_background(batch_id: str, file_paths: List[Dict], db) -> None:
    """
    Background task to process a list of files sequentially or concurrently.
    file_paths: list of dicts like [{"path": Path, "filename": "doc.pdf", "name": "", "issuer": "", "dataset_tag": "real"}]
    """
    # Initialize batch record
    await db[BATCH_JOBS_COLLECTION].update_one(
        {"batch_id": batch_id},
        {"$set": {"status": "processing", "processed": 0, "failed": 0, "results": []}}
    )
    
    processed_count = 0
    failed_count = 0
    results = []
    
    # We'll use a dummy UploadFile wrapper since create_certificate_record expects one.
    class DummyUploadFile:
        def __init__(self, path: Path, filename: str):
            self.path = path
            self.filename = filename
            
        async def read(self):
            return self.path.read_bytes()
            
        async def seek(self, offset):
            pass

    for item in file_paths:
        path = item["path"]
        filename = item["filename"]
        try:
            # Create a mock upload file
            mock_file = DummyUploadFile(path, filename)
            
            # Since create_certificate_record calls save_upload internally, 
            # and save_upload reads from the file, this will work.
            cert_doc = await create_certificate_record(
                db,
                file=mock_file,
                name=item["name"] or "Batch Candidate",
                issuer=item["issuer"] or "Batch Issuer",
                issue_date=datetime.now().strftime("%Y-%m-%d"),
                expiry_date=None,
                dataset_tag=item["dataset_tag"]
            )
            
            # Fetch the updated cert from DB after run_analysis (which is called inside create_certificate_record)
            cert_after_analysis = await db[CERTIFICATES_COLLECTION].find_one({"certificate_id": cert_doc["certificate_id"]})
            
            status = cert_after_analysis.get("verification_status", "suspicious")
            score = cert_after_analysis.get("authenticity_score", 0.0)
            
            results.append({
                "filename": filename,
                "certificate_id": cert_doc["certificate_id"],
                "status": status,
                "score": score
            })
            processed_count += 1
            
        except Exception as e:
            print(f"Error processing {filename} in batch {batch_id}: {e}")
            results.append({
                "filename": filename,
                "status": "error",
                "error": str(e)
            })
            failed_count += 1
            
        # Update progress in DB
        await db[BATCH_JOBS_COLLECTION].update_one(
            {"batch_id": batch_id},
            {
                "$set": {
                    "processed": processed_count,
                    "failed": failed_count,
                    "results": results,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # Optional: slight delay to yield to other tasks if needed
        await asyncio.sleep(0.1)
        
    # Mark as completed
    await db[BATCH_JOBS_COLLECTION].update_one(
        {"batch_id": batch_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
    )
