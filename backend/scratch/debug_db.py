import asyncio
import os
import sys

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
from app.db.collections import CERTIFICATES_COLLECTION, BLOCKCHAIN_RECORDS_COLLECTION

async def check():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]
    
    print("--- CERTIFICATES ---")
    certs = await db[CERTIFICATES_COLLECTION].find().to_list(100)
    for c in certs:
        print(f"Name: {c.get('name')}, Issuer: {c.get('issuer')}, Status: {c.get('verification_status')}, Hash: {c.get('blockchain_hash')[:10]}...")
        
    print("\n--- BLOCKCHAIN RECORDS ---")
    records = await db[BLOCKCHAIN_RECORDS_COLLECTION].find().to_list(100)
    for r in records:
        print(f"ID: {r.get('certificate_id')}, Hash: {r.get('hash')[:10]}...")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
