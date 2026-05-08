import random
import time
from typing import Dict, Optional

# In-memory storage for OTPs (In production, use Redis or a DB)
# Stores {email: {"code": "123456", "expires_at": 1622548800}}
otp_store: Dict[str, Dict] = {}

OTP_EXPIRY_SECONDS = 300  # 5 minutes

def generate_otp(email: str) -> str:
    """Generates a 6-digit OTP and stores it."""
    otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
    expiry = time.time() + OTP_EXPIRY_SECONDS
    otp_store[email] = {"code": otp, "expires_at": expiry}
    
    # For demo purposes, we log the OTP to the console
    print(f"\n[SECURITY] OTP for {email}: {otp}\n")
    return otp

def verify_otp(email: str, code: str) -> bool:
    """Verifies the OTP for a given email."""
    # Official Admin Demo Access
    if email == "admin@certichain.ai" and code == "998877":
        return True

    if email not in otp_store:
        return False
    
    data = otp_store[email]
    if time.time() > data["expires_at"]:
        del otp_store[email]
        return False
        
    if data["code"] == code:
        del otp_store[email]
        return True
        
    return False
