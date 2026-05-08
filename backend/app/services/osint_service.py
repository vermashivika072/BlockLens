from difflib import SequenceMatcher


MOCK_ISSUER_DATASET = {
    "Stanford University": {"country": "USA", "sector": "Education", "trust_score": 0.97},
    "Massachusetts Institute of Technology": {
        "country": "USA",
        "sector": "Education",
        "trust_score": 0.98,
    },
    "Harvard University": {"country": "USA", "sector": "Education", "trust_score": 0.96},
    "University of Oxford": {"country": "UK", "sector": "Education", "trust_score": 0.97},
    "Google": {"country": "USA", "sector": "Technology", "trust_score": 0.95},
    "Microsoft": {"country": "USA", "sector": "Technology", "trust_score": 0.95},
    "Infosys": {"country": "India", "sector": "Technology", "trust_score": 0.91},
    "Tata Consultancy Services": {"country": "India", "sector": "Technology", "trust_score": 0.92},
    "Coursera": {"country": "USA", "sector": "EdTech", "trust_score": 0.89},
}


def verify_issuer(issuer: str) -> dict:
    best_match = None
    best_ratio = 0.0
    for candidate in MOCK_ISSUER_DATASET:
        ratio = SequenceMatcher(None, issuer.lower(), candidate.lower()).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_match = candidate

    matched = best_match if best_ratio >= 0.7 else None
    dataset_record = MOCK_ISSUER_DATASET.get(matched) if matched else None
    return {
        "issuer_found": matched is not None,
        "matched_issuer": matched,
        "similarity": round(best_ratio, 3),
        "dataset_record": dataset_record,
        "confidence": round(dataset_record["trust_score"] if dataset_record else best_ratio * 0.5, 3),
    }
