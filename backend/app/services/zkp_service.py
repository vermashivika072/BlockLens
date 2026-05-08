from app.services.hashing_service import sha256_for_text


def generate_proof(certificate_id: str, name: str, issuer: str, issue_date: str) -> dict:
    payload = f"{certificate_id}|{name[:2]}***|{issuer}|{issue_date}"
    proof = sha256_for_text(payload)
    return {
        "proof": proof,
        "proof_type": "simulated-zkp",
        "verifiable_claim": "certificate_exists_without_full_disclosure",
        "revealed_fields": {
            "certificate_id": certificate_id,
            "issuer": issuer,
            "issue_date": issue_date,
        },
    }
