from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Annotated
from sqlalchemy.orm import Session
from app.config import settings
from app.deps import get_db
from app.db.models import User
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


router = APIRouter()


class SignupRequest(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(min_length=6)]
    full_name: str
    # use Literal to enumerate allowed role values
    role: Literal["student", "coaching", "library", "pg", "tiffin"]


class SignupResponse(BaseModel):
    id: str
    email: EmailStr
    role: str


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


class SigninResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str


@router.post("/auth/signup", response_model=SignupResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    """Create a new user in Supabase via the Admin API.

    NOTE: This endpoint requires `SUPABASE_SERVICE_KEY` to be set in env
    because it uses the admin API to create a user and populate raw metadata
    used by the DB trigger to create a profile.
    """
    # create user in local DB (backed by Supabase Postgres)
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")

    hashed = pwd_context.hash(payload.password)
    user = User(email=payload.email, hashed_password=hashed, full_name=payload.full_name, role=payload.role)
    db.add(user)
    db.commit()
    db.refresh(user)

    return SignupResponse(id=user.id, email=user.email, role=user.role)


@router.post("/auth/signin", response_model=SigninResponse)
def signin(payload: SigninRequest, db: Session = Depends(get_db)):
    # authenticate against local DB and return JWT access + refresh (basic)
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    now = datetime.utcnow()
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user.id, "role": user.role, "exp": int(expire.timestamp())}
    access_token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

    # simple refresh token placeholder: in production use secure refresh tokens
    refresh_expire = now + timedelta(days=30)
    refresh_token = jwt.encode({"sub": user.id, "exp": int(refresh_expire.timestamp())}, settings.SECRET_KEY, algorithm="HS256")

    return SigninResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        token_type="bearer",
    )


@router.get("/auth/config")
def auth_config():
    """Return non-sensitive presence of Supabase config (for debugging only).

    This endpoint returns booleans indicating which environment values are set.
    It does NOT return the keys themselves.
    """
    return {
        "supabase_url_set": bool(settings.SUPABASE_URL),
        "supabase_service_key_set": bool(settings.SUPABASE_SERVICE_KEY),
        "supabase_anon_key_set": bool(settings.SUPABASE_ANON_KEY),
    }
