import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

sys.path.append(os.path.abspath('c:/Users/verma/Desktop/certichain-aura-main (2)/certichain-aura-main/backend'))
from app.core.config import get_settings
from app.db.collections import CERTIFICATES_COLLECTION

async def check_db():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]
    
    count = await db[CERTIFICATES_COLLECTION].count_documents({})
    print(f"Total certificates: {count}")
    
    if count > 0:
        latest = await db[CERTIFICATES_COLLECTION].find().sort("created_at", -1).limit(1).to_list(length=1)
        print(f"Latest cert: {latest[0].get('name')} - {latest[0].get('verification_status')}")
    else:
        print("Database is empty!")

if __name__ == "__main__":
    asyncio.run(check_db())
