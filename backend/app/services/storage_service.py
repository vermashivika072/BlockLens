from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings

import fitz

async def save_upload(file: UploadFile) -> Path:
    settings = get_settings()
    extension = Path(file.filename or "").suffix.lower()
    if extension not in settings.allowed_file_extensions:
        raise ValueError(f"Unsupported file type: {extension}")

    content = await file.read()
    
    if extension == ".pdf":
        doc = fitz.open(stream=content, filetype="pdf")
        if len(doc) == 0:
            raise ValueError("PDF is empty")
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=150)
        content = pix.tobytes("png")
        extension = ".png"

    destination = settings.uploads_dir / f"{uuid4().hex}{extension}"
    destination.write_bytes(content)
    await file.seek(0)
    return destination


def as_public_path(path: Path) -> str:
    settings = get_settings()
    relative = path.relative_to(path.parents[1]).as_posix()
    return f"{settings.static_mount}/{relative}"
