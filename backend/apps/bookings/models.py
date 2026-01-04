from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Numeric, Text, Boolean
from sqlalchemy.orm import relationship

from config.database import FastModel


class Booking(FastModel):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending")  # pending, waitlist, accepted, rejected
    amount = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    
    # Payment details
    payment_id = Column(String(255), nullable=True)
    payment_screenshot = Column(Text, nullable=True)  # URL or base64
    payment_verified = Column(Boolean, default=False, nullable=False)
    payment_verified_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

    # Relationships
    listing = relationship("Listing", back_populates="bookings")
    user = relationship("User", foreign_keys=[user_id])
