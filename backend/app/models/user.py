import uuid
import enum
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class UserRole(str, enum.Enum):
    student = "student"
    coaching_owner = "coaching_owner"
    pg_owner = "pg_owner"
    tiffin_owner = "tiffin_owner"
    library_owner = "library_owner"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
