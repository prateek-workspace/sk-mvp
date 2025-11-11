from pydantic import BaseModel, EmailStr, constr
from enum import Enum

class UserRole(str, Enum):
    student = "student"
    coaching_owner = "coaching_owner"
    pg_owner = "pg_owner"
    tiffin_owner = "tiffin_owner"
    library_owner = "library_owner"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: constr(min_length=6)
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole

    class Config:
        orm_mode = True
