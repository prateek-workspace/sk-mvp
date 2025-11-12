from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class BookingSummary(BaseModel):
    id: str
    listing_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ListingSummary(BaseModel):
    id: str
    title: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    total_bookings: Optional[int] = 0
    completed: Optional[int] = 0
    pending: Optional[int] = 0
    total_listings: Optional[int] = 0


class DashboardResponse(BaseModel):
    user: dict
    bookings: Optional[List[BookingSummary]] = []
    listings: Optional[List[ListingSummary]] = []
    analytics: Optional[AnalyticsSummary]
