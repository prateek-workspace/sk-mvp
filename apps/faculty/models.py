from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from config.database import FastModel


class Faculty(FastModel):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)

    # Relationships
    listing = relationship("Listing", back_populates="faculty")
