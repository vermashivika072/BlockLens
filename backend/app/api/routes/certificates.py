from datetime import date

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import RedirectResponse, StreamingResponse

from app.api.deps import get_current_user
from app.core.rate_limit import limiter
from app.db.client import get_database
from app.db.collections import ANALYSIS_RESULTS_COLLECTION, BLOCKCHAIN_RECORDS_COLLECTION, CERTIFICATES_COLLECTION
from app.schemas.analysis import AnalysisRequest, AnalysisResultResponse
from app.schemas.certificate import (
    CertificateCreateResponse,
    CertificateListItem,
    HeatmapResponse,
    VerificationResponse,
)
from app.services.certificate_service import create_certificate_record, run_analysis


router = APIRouter(tags=["Certificates"])


@router.post("/upload-certificate", response_model=CertificateCreateResponse)
@limiter.limit("10/minute")
async def upload_certificate(
    request: Request,
    file: UploadFile = File(...),
    name: str = Form(...),
    issuer: str = Form(...),
    issue_date: date = Form(...),
    expiry_date: date | None = Form(default=None),
    dataset_tag: str = Form(default="real"),
    db=Depends(get_database),
    _user=Depends(get_current_user),
) -> CertificateCreateResponse:
    try:
        certificate = await create_certificate_record(
            db,
            file=file,
            name=name,
            issuer=issuer,
            issue_date=issue_date.isoformat(),
            expiry_date=expiry_date.isoformat() if expiry_date else None,
            dataset_tag=dataset_tag,
            uploaded_by_email=_user.get("email", "") if isinstance(_user, dict) else getattr(_user, "email", ""),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return CertificateCreateResponse(
        certificate_id=certificate["certificate_id"],
        blockchain_hash=certificate["blockchain_hash"],
        qr_code_url=certificate["qr_code_url"],
        verification_status=certificate["verification_status"],
        authenticity_score=certificate["authenticity_score"],
        fraud_probability=certificate["fraud_probability"],
    )


@router.get("/certificates", response_model=list[CertificateListItem])
@limiter.limit("30/minute")
async def list_certificates(
    request: Request,
    status_filter: str | None = Query(default=None, alias="status"),
    dataset_tag: str | None = Query(default=None),
    db=Depends(get_database),
    _user=Depends(get_current_user),
) -> list[CertificateListItem]:
    query: dict = {}
    if status_filter:
        query["verification_status"] = status_filter
    if dataset_tag:
        query["dataset_tag"] = dataset_tag

    documents = await db[CERTIFICATES_COLLECTION].find(query).sort("created_at", -1).to_list(length=200)
    return [
        CertificateListItem(
            certificate_id=document.get("certificate_id", "N/A"),
            name=document.get("name", "Unknown"),
            issuer=document.get("issuer", "Unknown"),
            issue_date=date.fromisoformat(document.get("issue_date")) if document.get("issue_date") else date.today(),
            expiry_date=date.fromisoformat(document.get("expiry_date")) if document.get("expiry_date") else None,
            verification_status=document.get("verification_status", "Unknown"),
            dataset_tag=document.get("dataset_tag", "real"),
            qr_code_url=document.get("qr_code_url", ""),
            blockchain_hash=document.get("blockchain_hash", "0x..."),
            created_at=document.get("created_at"),
        )
        for document in documents
    ]


@router.post("/analyze", response_model=AnalysisResultResponse)
@limiter.limit("20/minute")
async def analyze_certificate(
    request: Request,
    payload: AnalysisRequest,
    db=Depends(get_database),
    _user=Depends(get_current_user),
) -> AnalysisResultResponse:
    try:
        result = await run_analysis(db, payload.certificate_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return AnalysisResultResponse(**result)


@router.get("/verify/{certificate_id}", response_model=VerificationResponse)
@limiter.limit("60/minute")
async def verify_certificate(request: Request, certificate_id: str, db=Depends(get_database)) -> VerificationResponse | RedirectResponse:
    # Auto-redirect browser requests to the nice Frontend UI
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        settings = get_settings()
        return RedirectResponse(url=f"{settings.frontend_url}/verify/{certificate_id}")

    certificate = await db[CERTIFICATES_COLLECTION].find_one({"certificate_id": certificate_id})
    analysis = await db[ANALYSIS_RESULTS_COLLECTION].find_one({"certificate_id": certificate_id})
    blockchain_record = await db[BLOCKCHAIN_RECORDS_COLLECTION].find_one({"certificate_id": certificate_id})
    if not certificate or not analysis:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    return VerificationResponse(
        certificate_id=certificate["certificate_id"],
        name=certificate["name"],
        issuer=certificate["issuer"],
        issue_date=date.fromisoformat(certificate.get("issue_date")) if certificate.get("issue_date") else date.today(),
        expiry_date=date.fromisoformat(certificate.get("expiry_date")) if certificate.get("expiry_date") else None,
        verification_status=certificate["verification_status"],
        authenticity_score=certificate["authenticity_score"],
        fraud_probability=certificate["fraud_probability"],
        blockchain_hash=certificate["blockchain_hash"],
        blockchain_valid=bool(blockchain_record and blockchain_record["hash"] == certificate["blockchain_hash"]),
        qr_code_url=certificate["qr_code_url"],
        qr_safety=analysis.get("qr_safety") or analysis.get("phishing_check"),
        zkp_proof=analysis["zkp"],
        original_image_url=certificate["original_image_url"],
        ela_heatmap_url=certificate["heatmap_image_url"],
        extracted_text=certificate["extracted_text"],
        analysis_summary=analysis["auditor"]["explanation"],
        forensic_category=analysis["auditor"].get("forensic_category"),
        forensic_report=analysis["auditor"].get("forensic_report"),
        ml_anomaly=analysis.get("ml_anomaly"),
        cnn_forensics=analysis.get("cnn_forensics"),
    )


@router.get("/qr-scan/{certificate_id}")
@limiter.limit("60/minute")
async def qr_scan_certificate(request: Request, certificate_id: str, db=Depends(get_database)) -> dict:
    certificate = await db[CERTIFICATES_COLLECTION].find_one({"certificate_id": certificate_id})
    analysis = await db[ANALYSIS_RESULTS_COLLECTION].find_one({"certificate_id": certificate_id})
    if not certificate or not analysis:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    return {
        "certificate_id": certificate_id,
        "qr_target": certificate["qr_code"],
        "qr_safety": analysis["phishing_check"],
        "verification_endpoint": f"/verify/{certificate_id}",
        "verification_status": certificate["verification_status"],
    }


@router.get("/heatmap/{certificate_id}", response_model=HeatmapResponse)
@limiter.limit("60/minute")
async def heatmap_preview(request: Request, certificate_id: str, db=Depends(get_database)) -> HeatmapResponse:
    certificate = await db[CERTIFICATES_COLLECTION].find_one({"certificate_id": certificate_id})
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found.")

    return HeatmapResponse(
        certificate_id=certificate_id,
        original_image_url=certificate["original_image_url"],
        ela_heatmap_url=certificate["heatmap_image_url"],
    )


@router.get("/stats")
@limiter.limit("60/minute")
async def get_dashboard_stats(request: Request, db=Depends(get_database), _user=Depends(get_current_user)) -> dict:
    total = await db[CERTIFICATES_COLLECTION].count_documents({})
    verified = await db[CERTIFICATES_COLLECTION].count_documents({"verification_status": "real"})
    fraud = await db[CERTIFICATES_COLLECTION].count_documents({"verification_status": "fake"})
    
    return {
        "total_processed": total,
        "verified_batch": verified,
        "failed_suspect": fraud,
    }


@router.get("/analytics")
@limiter.limit("60/minute")
async def get_analytics(request: Request, db=Depends(get_database), _user=Depends(get_current_user)):
    """
    Groups certificates by month for the analytics dashboard.
    """
    pipeline = [
        {
            "$group": {
                "_id": { "$month": "$created_at" },
                "total": { "$sum": 1 },
                "verified": { "$sum": { "$cond": [{ "$eq": ["$verification_status", "real"] }, 1, 0] } },
                "fake": { "$sum": { "$cond": [{ "$eq": ["$verification_status", "fake"] }, 1, 0] } }
            }
        },
        { "$sort": { "_id": 1 } }
    ]
    
    results = await db[CERTIFICATES_COLLECTION].aggregate(pipeline).to_list(length=12)
    
    MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    analytics_data = []
    
    # Fill in all 12 months, even if they have no data
    for i in range(1, 13):
        found = next((r for r in results if r["_id"] == i), None)
        if found:
            analytics_data.append({
                "month": MONTHS[i-1],
                "original": found["verified"],
                "fake": found["fake"],
                "total": found["total"]
            })
        else:
            analytics_data.append({
                "month": MONTHS[i-1],
                "original": 0,
                "fake": 0,
                "total": 0
            })
            
    return analytics_data


@router.get("/report/{certificate_id}")
@limiter.limit("20/minute")
async def download_report(request: Request, certificate_id: str, db=Depends(get_database)):
    certificate = await db[CERTIFICATES_COLLECTION].find_one({"certificate_id": certificate_id})
    analysis = await db[ANALYSIS_RESULTS_COLLECTION].find_one({"certificate_id": certificate_id})
    blockchain_record = await db[BLOCKCHAIN_RECORDS_COLLECTION].find_one({"certificate_id": certificate_id})
    
    if not certificate or not analysis:
        raise HTTPException(status_code=404, detail="Certificate not found.")
        
    try:
        from app.services.report_service import generate_pdf_report
        pdf_buffer = generate_pdf_report(certificate, analysis, blockchain_record)
        
        from fastapi.responses import Response
        headers = {
            'Content-Disposition': f'attachment; filename="certichain_report_{certificate_id}.pdf"'
        }
        return Response(content=pdf_buffer.getvalue(), media_type="application/pdf", headers=headers)
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        raise HTTPException(status_code=500, detail=str(error_msg))
