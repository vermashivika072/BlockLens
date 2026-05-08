import google.generativeai as genai
from fastapi import APIRouter, Depends
from pydantic import BaseModel
import logging
import time
from app.core.config import get_settings
from app.services.rag_service import get_context
from app.db.client import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    message: str
    history: list = []

@router.post("/chat")
async def chat_with_bot(payload: ChatRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    start_time = time.perf_counter()
    settings = get_settings()
    try:
        # 1. Faster RAG Context Retrieval
        context = await get_context(db, payload.message)
        rag_time = (time.perf_counter() - start_time) * 1000
        
        # 2. Configure Gemini with SYSTEM INSTRUCTION (Highest Priority)
        genai.configure(api_key=settings.gemini_api_key)
        
        # Using a model name confirmed available in the environment (from list_models.py)
        model_id = "gemini-1.5-flash" 
        
        system_instruction = f"""
        You are 'Aura', the CertiChain AI Forensic Expert. 
        You have direct access to the platform's MongoDB database.
        
        CURRENT DATABASE CONTEXT:
        {context}
        
        STRICT RULES:
        - NEVER say "I don't have access" or suggest external tools like AWS/Azure.
        - Use the provided context to answer. If it mentions a scan result, report it.
        - If the context doesn't answer the question, say: "I am monitoring the CertiChain database. I don't see that specific record yet, but I can verify any certificate you upload or check whitelisted users like Shivika Verma."
        - Keep answers short, professional, and fast.
        """
        
        model = genai.GenerativeModel(
            model_name=model_id,
            system_instruction=system_instruction
        )
        
        # 3. Generate Content
        response = model.generate_content(payload.message)
        
        total_time = (time.perf_counter() - start_time) * 1000
        print(f"DEBUG: Chat query '{payload.message}' processed in {total_time:.2f}ms (RAG: {rag_time:.2f}ms)")
        
        if not response or not response.text:
            return {"response": "I'm sorry, I couldn't generate a response. Please try again.", "reply": "Empty response"}

        return {"response": response.text, "reply": response.text}
        
    except Exception as e:
        error_str = str(e)
        print(f"CRITICAL ERROR: {error_str}")
        
        if "429" in error_str or "quota" in error_str.lower():
            fallback_msg = "My AI communication channels are currently experiencing extremely high volume, and I have temporarily hit my processing limit. However, the core verification system remains fully operational. Please use the dashboard to scan and verify certificates directly."
            return {"response": fallback_msg, "reply": fallback_msg}
            
        return {
            "response": "I'm currently undergoing maintenance. Please try again later.", 
            "reply": "Error"
        }
