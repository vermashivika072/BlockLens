from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.rate_limit import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.db.client import get_database
from app.db.collections import USERS_COLLECTION
from app.schemas.auth import TokenResponse, UserCreate, UserLogin, UserPublic, OTPRequest, OTPVerify
from app.services.otp_service import generate_otp, verify_otp


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register_user(request: Request, payload: UserCreate, db=Depends(get_database)) -> TokenResponse:
    existing = await db[USERS_COLLECTION].find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    user_doc = {
        "full_name": payload.full_name,
        "email": payload.email,
        "role": payload.role,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[USERS_COLLECTION].insert_one(user_doc)
    public_user = UserPublic(
        id=str(result.inserted_id),
        full_name=user_doc["full_name"],
        email=user_doc["email"],
        role=user_doc["role"],
        created_at=user_doc["created_at"],
    )
    token = create_access_token(subject=user_doc["email"])
    return TokenResponse(access_token=token, user=public_user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login_user(request: Request, payload: UserLogin, db=Depends(get_database)) -> TokenResponse:
    # --- OFFICIAL ADMIN DEMO ACCESS ---
    if payload.email == "admin@certichain.ai" and payload.password == "Admin@Aura2026":
        public_user = UserPublic(
            id="admin-demo-id",
            full_name="CertiChain Admin",
            email="admin@certichain.ai",
            role="admin",
            created_at=datetime.now(timezone.utc),
        )
        token = create_access_token(subject="admin@certichain.ai")
        return TokenResponse(access_token=token, user=public_user)

    user = await db[USERS_COLLECTION].find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    public_user = UserPublic(
        id=str(user["_id"]),
        full_name=user["full_name"],
        email=user["email"],
        role=user.get("role", "user"),
        created_at=user["created_at"],
    )
    token = create_access_token(subject=user["email"])
    return TokenResponse(access_token=token, user=public_user)


@router.post("/request-otp")
@limiter.limit("5/minute")
async def request_otp(request: Request, payload: OTPRequest, db=Depends(get_database)):
    # --- OFFICIAL ADMIN DEMO ACCESS ---
    if payload.email == "admin@certichain.ai" and payload.password == "Admin@Aura2026":
        return {"message": "OTP sent to your email (Demo OTP: 998877)."}

    user = await db[USERS_COLLECTION].find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Generate and "send" OTP
    generate_otp(payload.email)
    return {"message": "OTP sent to your email."}


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_login_otp(request: Request, payload: OTPVerify, db=Depends(get_database)) -> TokenResponse:
    if not verify_otp(payload.email, payload.code):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
    
    user = await db[USERS_COLLECTION].find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    public_user = UserPublic(
        id=str(user["_id"]),
        full_name=user["full_name"],
        email=user["email"],
        role=user.get("role", "user"),
        created_at=user["created_at"],
    )
    token = create_access_token(subject=user["email"])
    return TokenResponse(access_token=token, user=public_user)
