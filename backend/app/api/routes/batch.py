import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import List
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile

from app.core.config import get_settings
from app.db.client import get_database
from app.db.collections import BATCH_JOBS_COLLECTION
from app.services.batch_service import process_batch_background
from app.api.deps import get_current_user

router = APIRouter(tags=["Batch Processing"])

@router.post("/batch/upload")
async def upload_batch(
    request: Request,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db = Depends(get_database),
    _user = Depends(get_current_user)
):
    settings = get_settings()
    batch_id = uuid4().hex
    
    # Save files to a temporary location so they are available for the background task
    # because UploadFile will be closed once this request completes.
    saved_files = []
    
    batch_dir = settings.uploads_dir / "batch" / batch_id
    batch_dir.mkdir(parents=True, exist_ok=True)
    
    for file in files:
        ext = Path(file.filename or "").suffix.lower()
        if ext not in settings.allowed_file_extensions:
            continue # Skip unsupported files
            
        temp_path = batch_dir / f"{uuid4().hex}{ext}"
        
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        saved_files.append({
            "path": temp_path,
            "filename": file.filename,
            "name": "",
            "issuer": "",
            "dataset_tag": "real" # Or let user pass it later
        })
        
    if not saved_files:
        raise HTTPException(status_code=400, detail="No valid files provided.")
        
    # Create batch record in DB
    batch_doc = {
        "batch_id": batch_id,
        "status": "pending",
        "total": len(saved_files),
        "processed": 0,
        "failed": 0,
        "results": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    await db[BATCH_JOBS_COLLECTION].insert_one(batch_doc)
    
    # Dispatch background task
    background_tasks.add_task(process_batch_background, batch_id, saved_files, db)
    
    return {
        "batch_id": batch_id,
        "status": "pending",
        "total_files": len(saved_files)
    }

@router.get("/batch/status/{batch_id}")
async def get_batch_status(batch_id: str, db = Depends(get_database)):
    job = await db[BATCH_JOBS_COLLECTION].find_one({"batch_id": batch_id})
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found.")
        
    return {
        "batch_id": job["batch_id"],
        "status": job["status"],
        "total": job["total"],
        "processed": job["processed"],
        "failed": job["failed"],
        "results": job["results"],
        "created_at": job["created_at"]
    }
