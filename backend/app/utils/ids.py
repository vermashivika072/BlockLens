from bson import ObjectId


def serialize_id(document: dict) -> dict:
    if "_id" in document:
        document["_id"] = str(document["_id"])
    return document


def to_object_id(value: str) -> ObjectId:
    return ObjectId(value)
