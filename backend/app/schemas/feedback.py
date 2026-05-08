from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class FeedbackCreate(BaseModel):
    user_email: EmailStr
    content: str
    category: Optional[str] = "general"

class FeedbackResponse(BaseModel):
    id: str
    user_email: str
    content: str
    sentiment: str
    score: float
    is_frustrated: bool
    analyzed_at: datetime

    class Config:
        from_attributes = True
