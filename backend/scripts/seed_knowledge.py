import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from app.core.config import get_settings
from app.db.collections import KNOWLEDGE_BASE_COLLECTION

KNOWLEDGE_DATA = [
    {
        "topic": "ela",
        "content": "Error Level Analysis (ELA) is a forensic technique that detects digital tampering in images. It works by re-compressing the image at a known quality (e.g., 90%) and calculating the pixel-by-pixel difference. High-contrast areas in the ELA heatmap indicate where pixels were likely modified or pasted into the original file."
    },
    {
        "topic": "blockchain",
        "content": "CertiChain Aura uses a decentralized ledger to store unique cryptographic hashes (SHA-256) of every issued certificate. This creates an immutable trail of authenticity. Even a single pixel change in the document will result in a completely different hash, failing the blockchain verification check."
    },
    {
        "topic": "nlp",
        "content": "Our Natural Language Processing (NLP) engine analyzes the semantic structure of the extracted certificate text. It checks for anomalies in institutional terminology, alignment of credentials with known issuer patterns, and logical inconsistencies that human forgers often overlook."
    },
    {
        "topic": "ocr",
        "content": "The platform uses Neural OCR (Optical Character Recognition) to extract text data from uploaded PDFs and images. This allows us to compare the digital text against the metadata provided by the institution and the blockchain record for a perfect 1:1 match."
    },
    {
        "topic": "osint",
        "content": "OSINT (Open Source Intelligence) modules verify the legitimacy of the issuing institution. We cross-reference issuer identities against global educational databases and verify their digital signatures to ensure the certificate wasn't issued by a 'diploma mill' or a spoofed entity."
    }
]

async def seed():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.database_name]
    
    print(f"Seeding {len(KNOWLEDGE_DATA)} topics into {KNOWLEDGE_BASE_COLLECTION}...")
    
    await db[KNOWLEDGE_BASE_COLLECTION].delete_many({})
    await db[KNOWLEDGE_BASE_COLLECTION].insert_many(KNOWLEDGE_DATA)
    
    print("Seeding complete.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
