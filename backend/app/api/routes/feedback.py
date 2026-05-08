from fastapi import APIRouter, Depends, HTTPException
from app.db.client import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.feedback import FeedbackCreate
from app.services.feedback_service import analyze_sentiment, save_feedback, send_feedback_email

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("/submit")
async def submit_feedback(payload: FeedbackCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        # 1. Analyze Sentiment
        analysis = await analyze_sentiment(payload.content)
        
        # 2. Save to DB
        feedback_id = await save_feedback(db, payload.user_email, payload.content, analysis)
        
        # 3. Send Email (Simulated)
        send_feedback_email(payload.user_email, analysis)
        
        return {
            "status": "success",
            "message": "Feedback submitted and analyzed successfully.",
            "feedback_id": feedback_id,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback processing failed: {str(e)}")

@router.get("/all")
async def get_all_feedback(db: AsyncIOMotorDatabase = Depends(get_database)):
    try:
        from app.db.collections import FEEDBACK_COLLECTION
        cursor = db[FEEDBACK_COLLECTION].find().sort("created_at", -1)
        feedbacks = await cursor.to_list(length=100)
        
        # Format for response
        for f in feedbacks:
            f["id"] = str(f["_id"])
            del f["_id"]
            if "created_at" in f:
                f["analyzed_at"] = f["created_at"] # Match schema name
        
        return feedbacks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feedback: {str(e)}")
