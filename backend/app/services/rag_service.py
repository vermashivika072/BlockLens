import logging
from app.db.collections import CERTIFICATES_COLLECTION, ANALYSIS_RESULTS_COLLECTION, KNOWLEDGE_BASE_COLLECTION

logger = logging.getLogger(__name__)

async def get_context(db, query: str) -> str:
    """
    Retrieves relevant context from the database based on the user's query.
    This is a simplified RAG implementation using keyword matching for the demo.
    """
    context_parts = []
    query_lower = query.lower()

    # 1. Search for specific certificates mentioned by name
    # We split the query into words and search for any word that might be a name
    potential_names = [word.strip(",.?!") for word in query_lower.split() if len(word) > 2]
    cert = None
    for name_part in potential_names:
        # Avoid common non-name words
        if name_part in ["the", "this", "that", "what", "how", "verify", "score", "scan", "last", "can", "you", "tell", "about", "status", "certificate", "name"]:
            continue
            
        cert = await db[CERTIFICATES_COLLECTION].find_one({"name": {"$regex": name_part, "$options": "i"}})
        if cert:
            break

    if cert:
        cid = cert["certificate_id"]
        analysis = await db[ANALYSIS_RESULTS_COLLECTION].find_one({"certificate_id": cid})
        
        status = cert["verification_status"].upper()
        score = round(cert["authenticity_score"] * 100, 1)
        
        summary = ""
        if analysis and "auditor" in analysis:
            summary = " ".join(analysis["auditor"].get("explanation", []))
        
        context_parts.append(
            f"FOUND CERTIFICATE INFO: Name: {cert['name']}, Issuer: {cert['issuer']}, "
            f"Status: {status}, Authenticity Score: {score}%, "
            f"Forensic Summary: {summary}"
        )

    # 2. Search General Knowledge Base
    # We match keywords for technical explanations
    kb_keywords = {
        "ela": ["ela", "error level", "tamper", "heatmap", "modified", "forgery"],
        "blockchain": ["blockchain", "ledger", "immutable", "hash", "notarization"],
        "nlp": ["nlp", "natural language", "semantic", "anomaly", "text analysis"],
        "ocr": ["ocr", "optical character", "extraction", "reading text"],
        "osint": ["osint", "open source", "verify issuer", "institution"]
    }

    matched_kb_topics = []
    for topic, keywords in kb_keywords.items():
        if any(kw in query_lower for kw in keywords):
            matched_kb_topics.append(topic)

    if matched_kb_topics:
        kb_entries = await db[KNOWLEDGE_BASE_COLLECTION].find({"topic": {"$in": matched_kb_topics}}).to_list(length=5)
        for entry in kb_entries:
            context_parts.append(f"KNOWLEDGE BASE ({entry['topic'].upper()}): {entry['content']}")

    # 3. Fetch Most Recent Scan Result (Personalization)
    # If the user is asking about "my scan" or "the result" or just generally, show the latest scan
    if not cert or any(kw in query_lower for kw in ["my", "scan", "result", "last", "latest"]):
        latest_cert = await db[CERTIFICATES_COLLECTION].find().sort("created_at", -1).limit(1).to_list(length=1)
        if latest_cert:
            cert = latest_cert[0]
            cid = cert["certificate_id"]
            analysis = await db[ANALYSIS_RESULTS_COLLECTION].find_one({"certificate_id": cid})
            
            status = cert["verification_status"].upper()
            score = round(cert["authenticity_score"] * 100, 1)
            
            ocr_text = cert.get("extracted_text", "No text extracted.")
            ela_report = "{}"
            if analysis and "ela" in analysis:
                ela_report = analysis["ela"].get("report", {})

            context_parts.append(
                f"MOST RECENT SCAN RESULT:\n"
                f"- Candidate Name: {cert.get('name') or 'N/A (Anonymous Scan)'}\n"
                f"- Issuing Institution: {cert.get('issuer') or 'Unknown'}\n"
                f"- Final Verification Status: {status}\n"
                f"- AI Authenticity Score: {score}%\n"
                f"- Extracted Document Text: {ocr_text[:300]}...\n"
                f"- Image Forensic (ELA) Report: {ela_report}\n"
                f"- Scan Timestamp: {cert.get('created_at')}\n"
            )

    if not context_parts:
        # Generic platform context if no match
        context_parts.append(
            "CertiChain Aura is an AI-powered academic credential verification platform. "
            "It uses Error Level Analysis (ELA) for image forensics, Blockchain for immutable record keeping, "
            "and multi-modal AI (OCR/NLP) to detect sophisticated certificate forgeries."
        )

    return "\n\n".join(context_parts)
