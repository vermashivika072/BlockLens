from pathlib import Path

import qrcode

from app.core.config import get_settings


def build_verify_url(certificate_id: str) -> str:
    settings = get_settings()
    return f"{settings.frontend_url}{settings.verify_path_prefix}/{certificate_id}"


def generate_qr_code(certificate_id: str) -> tuple[str, Path]:
    settings = get_settings()
    verify_url = build_verify_url(certificate_id)
    qr_image = qrcode.make(verify_url)
    output_path = settings.qr_dir / f"{certificate_id}.png"
    qr_image.save(output_path)
    return verify_url, output_path

import cv2
import google.generativeai as genai
import re

def extract_qr_from_image(image_path: Path) -> str | None:
    # 1. Try OpenCV first (Fast)
    try:
        img = cv2.imread(str(image_path))
        if img is not None:
            detector = cv2.QRCodeDetector()
            data, _, _ = detector.detectAndDecode(img)
            if data:
                return data
    except Exception:
        pass

    # 2. Try Gemini Vision Fallback (Accurate)
    settings = get_settings()
    if settings.gemini_api_key:
        try:
            from PIL import Image
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel("gemini-flash-latest")
            img_pil = Image.open(image_path)
            prompt = "Scan this image for a QR code or an official verification URL. Return only the URL found. If none, return 'None'."
            response = model.generate_content([prompt, img_pil])
            url_match = re.search(r'https?://[^\s<>"]+|www\.[^\s<>"]+', response.text)
            if url_match:
                return url_match.group()
        except Exception:
            pass

    return None
