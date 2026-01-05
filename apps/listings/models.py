from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, Numeric, ARRAY
from sqlalchemy.orm import relationship

from config.database import FastModel


class Listing(FastModel):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # coaching, library, pg, tiffin
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    location = Column(String(255), nullable=True)
    features = Column(ARRAY(String), nullable=True)
    image_url = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    faculty = relationship("Faculty", back_populates="listing", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
