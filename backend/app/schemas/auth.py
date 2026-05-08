from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: EmailStr
    role: str = "user"
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class OTPRequest(BaseModel):
    email: EmailStr
    password: str


class OTPVerify(BaseModel):
    email: EmailStr
    code: str
