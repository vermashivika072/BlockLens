import google.generativeai as genai
import logging
import json
from datetime import datetime
from app.core.config import get_settings
from app.db.collections import FEEDBACK_COLLECTION

logger = logging.getLogger(__name__)

async def analyze_sentiment(text: str) -> dict:
    """
    Analyzes the sentiment of feedback using Gemini.
    Returns a dict with sentiment, score, and is_frustrated flag.
    """
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-flash-latest")

    prompt = f"""
    Analyze the sentiment of the following user feedback for a certificate verification platform.
    
    FEEDBACK: "{text}"
    
    Respond in JSON format with these exact keys:
    {{
        "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        "score": float (0.0 to 1.0, where 1.0 is very positive),
        "is_frustrated": boolean (true if the user sounds angry, annoyed, or stuck),
        "summary": "a short one-sentence summary of their feedback"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean potential markdown from response
        clean_json = response.text.strip().replace("```json", "").replace("```", "")
        result = json.loads(clean_json)
        return result
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {e}")
        # Default fallback
        return {
            "sentiment": "NEUTRAL",
            "score": 0.5,
            "is_frustrated": False,
            "summary": "Analysis unavailable"
        }

async def save_feedback(db, email: str, content: str, analysis: dict):
    """Saves feedback and its analysis to MongoDB."""
    feedback_doc = {
        "user_email": email,
        "content": content,
        "sentiment": analysis.get("sentiment"),
        "score": analysis.get("score"),
        "is_frustrated": analysis.get("is_frustrated"),
        "summary": analysis.get("summary"),
        "created_at": datetime.utcnow()
    }
    result = await db[FEEDBACK_COLLECTION].insert_one(feedback_doc)
    
    if analysis.get("is_frustrated"):
        logger.warning(f"ADMIN ALERT: High frustration detected from {email}!")
        print(f"\n[ADMIN ALERT] User {email} is FRUSTRATED: {content}\n")
    
    return str(result.inserted_id)

def send_feedback_email(email: str, analysis: dict):
    """
    Simulates sending an email to the user with their feedback analysis.
    In a real app, use SendGrid/SES.
    """
    subject = "Thank you for your feedback - CertiChain Aura"
    body = f"""
    Hello,
    
    Thank you for sharing your experience with CertiChain Aura.
    
    Our AI system has analyzed your feedback:
    - Sentiment: {analysis.get('sentiment')}
    - AI Interpretation: {analysis.get('summary')}
    
    We value your input and will use it to improve our platform.
    
    Best regards,
    The CertiChain Team
    """
    
    print(f"\n[EMAIL SIMULATION] Sending to {email}...")
    print(f"Subject: {subject}")
    print(f"Body: {body}\n")
    logger.info(f"Feedback email simulated for {email}")
