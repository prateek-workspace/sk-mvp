from fastapi import HTTPException
from supabase import create_client, Client
from app.core.config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def register_user_via_supabase(name: str, email: str, password: str, role: str):
    """
    Register a new user via Supabase Auth and trigger public.users sync.
    """
    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"name": str(name), "role": str(role)}}
        })
        # print("✅ Supabase signup response:", res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Supabase signup failed: {str(e)}")

    if not res.user:
        raise HTTPException(status_code=400, detail="Supabase signup returned no user object")

    return {
        "message": "Signup successful. Please verify your email.",
        "user": {
            "id": str(res.user.id),
            "email": res.user.email,
            "name": name,
            "role": role
        }
    }

def login_user_via_supabase(email: str, password: str):
    """
    Log in existing user via Supabase Auth.
    """
    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        # print("✅ Supabase login response:", res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Login failed: {str(e)}")

    if not res.session or not res.session.access_token:
        raise HTTPException(status_code=400, detail="Invalid login credentials")

    return {
        "access_token": res.session.access_token,
        "refresh_token": res.session.refresh_token,
        "user": {
            "id": str(res.user.id),
            "email": res.user.email,
            "role": res.user.user_metadata.get("role", "student"),
            "name": res.user.user_metadata.get("name", "")
        }
    }
