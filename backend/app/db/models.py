
import datetime
import uuid
from sqlalchemy import Column, String, DateTime, Enum
from app.db.base import Base
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, nullable=False, default="student")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

