from fastapi import APIRouter, Depends, Header, HTTPException
from supabase import create_client, Client
import jwt
from app.core.config import settings

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def get_current_user(authorization: str = Header(...)):
    """Validate Supabase JWT and extract user ID"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization format")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_aud": False},  # disable audience check
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Missing 'sub' in token")

    return user_id


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user)):
    """Fetch authenticated user's full profile"""
    # Fetch from Supabase Auth
    auth_user = supabase.auth.admin.get_user_by_id(user_id).user
    if not auth_user:
        raise HTTPException(status_code=404, detail="User not found in Supabase auth")

    # Fetch from custom users table (if exists)
    db_user = supabase.table("users").select("*").eq("id", user_id).execute()
    db_info = db_user.data[0] if db_user.data else {}

    return {
        "id": user_id,
        "email": auth_user.email,
        "email_verified": getattr(auth_user, "email_confirmed_at", None),
        "name": db_info.get("name", auth_user.user_metadata.get("name")),
        "role": db_info.get("role", auth_user.user_metadata.get("role")),
        "metadata": auth_user.user_metadata,
        "created_at": db_info.get("created_at"),
    }
