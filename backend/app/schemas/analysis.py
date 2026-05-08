from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    certificate_id: str


class OCRResult(BaseModel):
    extracted_text: str
    text_length: int
    warnings: list[str] = Field(default_factory=list)


class NLPResult(BaseModel):
    confidence_score: float
    issuer_valid: bool
    keyword_score: float
    anomalies: list[str]
    entities: list[str]


class ELAResult(BaseModel):
    heatmap_path: str
    tamper_score: float
    mean_intensity: float
    suspicious_regions: int


class AuditorResult(BaseModel):
    authenticity_score: float
    fraud_probability: float
    verification_status: str
    explanation: list[str]


class AnalysisResultResponse(BaseModel):
    certificate_id: str
    analyzed_at: datetime
    ocr: OCRResult
    nlp: NLPResult
    ela: ELAResult
    osint: dict[str, Any]
    blockchain_valid: bool
    phishing_check: dict[str, Any]
    zkp: dict[str, Any]
    auditor: AuditorResult
