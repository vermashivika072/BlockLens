import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
from app.core.security import hash_password
from app.db.collections import USERS_COLLECTION
from datetime import datetime, timezone

async def seed_admin():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]
    
    admin_email = "admin@certichain.ai"
    admin_pass = "Admin@Aura2026"
    
    existing = await db[USERS_COLLECTION].find_one({"email": admin_email})
    if existing:
        print(f"Admin {admin_email} already exists.")
    else:
        admin_doc = {
            "full_name": "CertiChain Admin",
            "email": admin_email,
            "role": "admin",
            "hashed_password": hash_password(admin_pass),
            "created_at": datetime.now(timezone.utc),
        }
        await db[USERS_COLLECTION].insert_one(admin_doc)
        print(f"Admin {admin_email} created successfully.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
