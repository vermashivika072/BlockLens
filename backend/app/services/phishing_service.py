from ipaddress import ip_address
from urllib.parse import urlparse


def _is_ip(hostname: str) -> bool:
    try:
        ip_address(hostname)
        return True
    except ValueError:
        return False


def validate_qr_url(url: str, whitelist: list[str], blacklist: list[str], metadata: dict = None) -> dict:
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()

    reasons: list[str] = []
    is_safe = True
    
    # Check against certificate metadata (Issuer Domain) - Relaxed for Demo
    if metadata and "issuer" in metadata:
        issuer_name = metadata["issuer"].lower()
        # Only flag if a high-trust domain is expected but a known suspicious domain is found
        if "stanford" in issuer_name and "stanford.edu" not in hostname and hostname != "":
            # Only downgrade if it looks like a suspicious alternative
            if any(ext in hostname for ext in [".xyz", ".top", ".club", "verify-"]):
                is_safe = False
                reasons.append(f"Suspicious Domain: QR points to '{hostname}' which looks like a phishing site for '{issuer_name}'.")

    if parsed.scheme not in {"http", "https"}:
        is_safe = False
        reasons.append("Unsupported URL scheme.")
    if hostname in blacklist:
        is_safe = False
        reasons.append("Domain is blacklisted.")
    if whitelist and hostname not in whitelist and not hostname.endswith(".local") and is_safe:
        reasons.append("Domain is not in the trusted whitelist.")
    if _is_ip(hostname) and hostname not in {"127.0.0.1"}:
        is_safe = False
        reasons.append("Direct IP destinations are treated as risky.")
    if "@" in url or "xn--" in hostname:
        is_safe = False
        reasons.append("URL uses obfuscation patterns that resemble phishing attempts.")

    risk_score = 0.15
    risk_score += 0.55 if hostname in blacklist or not is_safe else 0
    risk_score += 0.2 if reasons else 0
    risk_score += 0.1 if hostname and hostname not in whitelist else 0

    return {
        "url": url,
        "hostname": hostname,
        "is_safe": is_safe and hostname not in blacklist,
        "risk_score": round(min(risk_score, 1.0), 3),
        "reasons": reasons,
        "can_navigate": is_safe and hostname not in blacklist # Allow UI to redirect if safe
    }
