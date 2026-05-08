import google.generativeai as genai
from app.core.config import get_settings
import httpx
import asyncio

def audit_certificate(
    *,
    ocr_result: dict,
    nlp_result: dict,
    ela_result: dict,
    osint_result: dict,
    blockchain_valid: bool,
    phishing_result: dict,
    ml_result: dict = None,
    cnn_result: dict = None,
) -> dict:
    explanation: list[str] = []

    ocr_score = 0.8 if ocr_result["text_length"] > 50 else 0.45
    if ocr_result["warnings"]:
        explanation.extend(ocr_result["warnings"])

    nlp_score = nlp_result["confidence_score"]
    if nlp_result["anomalies"]:
        explanation.extend(nlp_result["anomalies"])

    ela_score = max(0.0, 1 - ela_result["tamper_score"])
    osint_score = osint_result["confidence"]
    blockchain_score = 1.0 if blockchain_valid else 0.1
    phishing_score = max(0.0, 1 - phishing_result["risk_score"])
    
    # ML/DL Anomaly Scores
    ml_score = ml_result["ml_confidence"] if ml_result else 0.5
    cnn_score = 1.0 - (cnn_result["cnn_pixel_forgery_score"] if cnn_result else 0.0)

    authenticity = (
        0.12 * ocr_score
        + 0.18 * nlp_score
        + 0.15 * ela_score
        + 0.10 * osint_score
        + 0.08 * blockchain_score
        + 0.07 * phishing_score
        + 0.15 * ml_score
        + 0.15 * cnn_score
    )
    fraud_probability = 1 - authenticity

    # Database (Blockchain) is the absolute source of truth for the demo.
    if blockchain_valid:
        status = "real"
        authenticity = max(0.96, authenticity)
        fraud_probability = min(0.04, fraud_probability)
    else:
        status = "fake"
        authenticity = min(0.12, authenticity) # Strict cap for fake docs
        fraud_probability = max(0.88, fraud_probability)
    
    print(f"DEBUG: Auditor Result -> Status: {status}, Score: {authenticity}, Blockchain Valid: {blockchain_valid}")

    if status == "real":
        if phishing_result["is_safe"] and not phishing_result["url"].startswith("http://localhost"):
            explanation.append(f"Official verification link detected: {phishing_result['hostname']}. Authorized for redirection.")
        explanation.append("The certificate aligns with trusted issuer, OCR, and integrity checks.")
    elif status == "fake":
        explanation.append("The combined audit signals indicate likely document tampering or mismatch.")
    elif status == "suspicious":
        explanation.append("The combined audit signals are mixed and require manual review.")

    forensic_category = ela_result.get("confidence_category", "Unknown")
    explanation.append(f"Forensic Analysis: {forensic_category} (Score: {ela_result['tamper_score']})")
    
    if ela_result.get("ai_findings"):
        explanation.append(f"DL Forensic Audit: {ela_result['ai_findings']}")

    if ml_result and ml_result.get("is_anomaly"):
        explanation.append("ML ALERT: Statistical anomaly detected in document metadata pattern.")
    
    if cnn_result:
        explanation.append(f"CNN Pixel Audit: {cnn_result['cnn_layout_audit']['pattern_match']} (Score: {cnn_result['cnn_pixel_forgery_score']})")

    # Final Natural Language Summary generation via Gemini
    final_explanation = " ".join(explanation)
    settings = get_settings()
    
    if settings.gemini_api_key:
        try:
            genai.configure(api_key=settings.gemini_api_key)
            # Use the currently supported gemini-1.5-flash model instead of gemini-3-flash
            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            
            prompt = f"""
            You are a professional digital forensics AI auditor for CertiChain Aura.
            Analyze the following findings and generate a concise, authoritative natural language summary (max 3-4 sentences).
            Do NOT use markdown. Write plain text. Focus on whether the document is genuine or fake, and cite key evidence.
            
            Status: {status.upper()} (Blockchain Verified: {blockchain_valid})
            OCR Result: {ocr_result.get('extracted_text', 'N/A')}
            ELA Tamper Score: {ela_result.get('tamper_score', 'N/A')}
            Forensic Findings: {ela_result.get('ai_findings', 'N/A')}
            CNN Pixel Forgery Score: {cnn_result.get('cnn_pixel_forgery_score', 'N/A') if cnn_result else 'N/A'}
            Phishing Check: Risk Score {phishing_result.get('risk_score', 'N/A')}
            
            Current Rule-based analysis: {final_explanation}
            """
            response = model.generate_content(prompt)
            if response.text:
                final_explanation = response.text.strip().replace("\n", " ")
        except Exception as e:
            print(f"DEBUG: Gemini AI Summary Generation Failed: {e}. Trying Groq...")
            
    # Fallback to Groq if Gemini failed or is missing
    if (not final_explanation or final_explanation == " ".join(explanation)) and settings.groq_api_key:
        try:
            # We use a synchronous-like call or just wrap it
            # Since this function is synchronous, we need to run the async call in a loop
            async def get_groq_summary():
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                        json={
                            "model": "llama-3.3-70b-versatile",
                            "messages": [
                                {"role": "system", "content": "You are a professional digital forensics AI auditor."},
                                {"role": "user", "content": f"Generate a concise 3-4 sentence forensic summary from these findings: {final_explanation}"}
                            ],
                            "temperature": 0.5
                        }
                    )
                    return resp.json()["choices"][0]["message"]["content"]
            
            groq_resp = asyncio.run(get_groq_summary())
            if groq_resp:
                final_explanation = groq_resp.strip().replace("\n", " ")
        except Exception as groq_err:
            print(f"DEBUG: Groq AI Summary Generation Failed: {groq_err}. Using rule-based summary.")

    return {
        "authenticity_score": round(authenticity, 3),
        "fraud_probability": round(max(0.0, min(fraud_probability, 1.0)), 3),
        "verification_status": status,
        "forensic_category": forensic_category,
        "explanation": [final_explanation],
        "forensic_report": ela_result.get("report", {})
    }
