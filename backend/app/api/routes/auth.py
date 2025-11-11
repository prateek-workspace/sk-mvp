from fastapi import APIRouter
from pydantic import BaseModel
from app.services.auth_service import register_user_via_supabase, login_user_via_supabase

router = APIRouter()

class RegisterPayload(BaseModel):
    name: str
    email: str
    password: str
    role: str

class LoginPayload(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(payload: RegisterPayload):
    return register_user_via_supabase(payload.name, payload.email, payload.password, payload.role)

@router.post("/login")
def login(payload: LoginPayload):
    return login_user_via_supabase(payload.email, payload.password)
