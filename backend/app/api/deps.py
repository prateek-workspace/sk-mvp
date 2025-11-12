# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings
from app.db.sessions import SessionLocal
from app.models.user import User

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Verify token using SUPABASE_JWT_SECRET
        payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    # Check email verified
    # Supabase JWT may contain 'email' and optionally 'exp', and metadata fields depend on setup.
    # Supabase includes 'email' and 'email_confirmed_at' in claims when using JWT secret verification.
    if not payload.get("email_confirmed_at"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified")

    # payload['sub'] is the user UUID (subject)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Optionally load local user record by same id (if you upserted it)
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()

    # If you rely entirely on auth.users and not your local users table,
    # you could return `payload` instead of a DB row. Here we prefer DB record if present.
    if user:
        return user

    # as fallback, return payload as a simple object/dict
    return payload

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
