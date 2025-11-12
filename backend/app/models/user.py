import uuid
import enum
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserRole(str, enum.Enum):
    student = "student"
    coaching_owner = "coaching_owner"
    pg_owner = "pg_owner"
    tiffin_owner = "tiffin_owner"
    library_owner = "library_owner"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    listings = relationship("Listing", back_populates="owner")
    bookings = relationship("Booking", back_populates="user")
