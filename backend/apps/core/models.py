from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from config.database import FastModel


class AdminSettings(FastModel):
    __tablename__ = "admin_settings"

    id = Column(Integer, primary_key=True, index=True)
    payment_qr_code = Column(Text, nullable=True)  # Base64 or URL
    payment_upi_id = Column(String(255), nullable=True)
    updated_at = Column(DateTime, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    updater = relationship("User", foreign_keys=[updated_by])
