from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import base64
from fastapi import HTTPException, status
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ------------------ PASSWORD UTILS ------------------ #
def get_password_hash(password: str):
    # bcrypt supports max 72 bytes — truncate if longer
    if len(password.encode("utf-8")) > 72:
        password = password.encode("utf-8")[:72].decode("utf-8", "ignore")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    if len(plain_password.encode("utf-8")) > 72:
        plain_password = plain_password.encode("utf-8")[:72].decode("utf-8", "ignore")
    return pwd_context.verify(plain_password, hashed_password)


# ------------------ JWT UTILS ------------------ #
def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=6)):
    """Used for internal tokens if needed (not Supabase)."""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SUPABASE_JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_supabase_token(token: str):
    """
    Verifies a Supabase-issued JWT using the Base64-decoded Supabase secret.
    """
    try:
        # Decode Base64 secret key first (Supabase stores it encoded)
        secret_bytes = base64.b64decode(settings.SUPABASE_JWT_SECRET)
        
        payload = jwt.decode(
            token,
            secret_bytes,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False}  # Supabase tokens don’t include audience
        )
        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
