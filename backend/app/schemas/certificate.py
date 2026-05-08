from datetime import datetime, date
from typing import Any

from pydantic import BaseModel, Field


class CertificateCreateResponse(BaseModel):
    certificate_id: str
    blockchain_hash: str
    qr_code_url: str
    verification_status: str
    authenticity_score: float
    fraud_probability: float


class CertificateListItem(BaseModel):
    certificate_id: str
    name: str
    issuer: str
    issue_date: date
    expiry_date: date | None = None
    verification_status: str
    dataset_tag: str
    qr_code_url: str
    blockchain_hash: str
    created_at: datetime


class VerificationResponse(BaseModel):
    certificate_id: str
    name: str
    issuer: str
    issue_date: date
    expiry_date: date | None = None
    verification_status: str
    authenticity_score: float
    fraud_probability: float
    blockchain_hash: str
    blockchain_valid: bool
    qr_code_url: str
    qr_safety: dict[str, Any]
    zkp_proof: dict[str, Any]
    original_image_url: str
    ela_heatmap_url: str
    extracted_text: str
    analysis_summary: list[str]
    forensic_category: str | None = None
    forensic_report: dict[str, Any] | None = None
    ml_anomaly: dict[str, Any] | None = None
    cnn_forensics: dict[str, Any] | None = None


class HeatmapResponse(BaseModel):
    certificate_id: str
    original_image_url: str
    ela_heatmap_url: str
