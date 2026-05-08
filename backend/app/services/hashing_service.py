import hashlib
from pathlib import Path


def sha256_for_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_handle:
        for chunk in iter(lambda: file_handle.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_for_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()
