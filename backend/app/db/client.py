from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING

from app.core.config import get_settings
from app.db.collections import (
    ANALYSIS_RESULTS_COLLECTION,
    BLOCKCHAIN_RECORDS_COLLECTION,
    CERTIFICATES_COLLECTION,
    USERS_COLLECTION,
)


class MongoManager:
    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None

    async def connect(self) -> None:
        settings = get_settings()
        self._client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=settings.mongodb_server_selection_timeout_ms,
        )
        await self.ping()
        await self.init_indexes()

    def close(self) -> None:
        if self._client:
            self._client.close()
            self._client = None

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._client is None:
            raise RuntimeError("MongoDB client is not initialized. Start the app to establish the database connection.")
        settings = get_settings()
        assert self._client is not None
        return self._client[settings.database_name]

    async def ping(self) -> bool:
        await self.db.command("ping")
        return True

    async def init_indexes(self) -> None:
        await self.db[USERS_COLLECTION].create_index([("email", ASCENDING)], unique=True)
        await self.db[CERTIFICATES_COLLECTION].create_index([("certificate_id", ASCENDING)], unique=True)
        await self.db[CERTIFICATES_COLLECTION].create_index([("verification_status", ASCENDING)])
        await self.db[CERTIFICATES_COLLECTION].create_index([("dataset_tag", ASCENDING)])
        await self.db[ANALYSIS_RESULTS_COLLECTION].create_index([("certificate_id", ASCENDING)], unique=True)
        await self.db[BLOCKCHAIN_RECORDS_COLLECTION].create_index([("certificate_id", ASCENDING)], unique=True)


mongo_manager = MongoManager()


async def get_database() -> AsyncIOMotorDatabase:
    return mongo_manager.db
