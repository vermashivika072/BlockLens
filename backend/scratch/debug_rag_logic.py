import asyncio
import os
import sys

# Add current dir to path
sys.path.append(os.getcwd())

from app.db.client import mongo_manager, get_database
from app.services.rag_service import get_context

async def test():
    await mongo_manager.connect()
    db = await get_database()
    print(f"DB Connected: {db is not None}")
    
    # Test certificate search
    c1 = await get_context(db, "tell me about shivika")
    print(f"\nCONTEXT (Shivika):\n{c1}")
    
    # Test KB search
    c2 = await get_context(db, "how does ela work?")
    print(f"\nCONTEXT (ELA):\n{c2}")
    
    # Test generic
    c3 = await get_context(db, "what is this?")
    print(f"\nCONTEXT (Generic):\n{c3}")

if __name__ == "__main__":
    asyncio.run(test())
