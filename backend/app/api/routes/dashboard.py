from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.security import decode_supabase_token
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import get_dashboard_data
from jose import jwt, JWTError
from app.core.config import settings


router = APIRouter()
security = HTTPBearer()


# router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# Dependency: Extract current user from Authorization header
def get_current_user(authorization: str = Depends(lambda: None)):
    from fastapi import Request
    from fastapi.security.utils import get_authorization_scheme_param
    import jwt

    request: Request
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    scheme, token = get_authorization_scheme_param(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    # Decode Supabase JWT
    user_payload = decode_supabase_token(token)
    if not user_payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Extract essential fields
    return {
        "id": user_payload.get("sub"),
        "email": user_payload.get("email"),
        "name": user_payload.get("user_metadata", {}).get("name"),
        "role": user_payload.get("user_metadata", {}).get("role")
    }


@router.get("/dashboard")
def get_dashboard(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # ✅ ignore audience claim from Supabase
        )
        metadata = payload.get("user_metadata", {}) or payload.get("user_meta_data", {})
        role = metadata.get("role", "student")
        email = metadata.get("email", "unknown")

    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid or expired token: {str(e)}")

    # Return dynamic dashboard data
    return {
        "user": {"email": email, "role": role},
        "dashboard": get_dashboard_data(role)
    }
