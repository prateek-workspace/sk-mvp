from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class FacultyBase(BaseModel):
    name: str
    subject: Optional[str] = None
    image_url: Optional[str] = None


class FacultyOut(FacultyBase):
    id: int
    listing_id: int
    
    model_config = ConfigDict(from_attributes=True)


class ListingBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    location: Optional[str] = None
    features: Optional[List[str]] = None
    type: str


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    features: Optional[List[str]] = None
    image_url: Optional[str] = None


class ListingOwnerInfo(BaseModel):
    """Basic owner info for listing cards"""
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class ListingOut(ListingBase):
    id: int
    owner_id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    faculty: List[FacultyOut] = []
    owner: Optional[ListingOwnerInfo] = None
    
    model_config = ConfigDict(from_attributes=True)


class ListingListOut(BaseModel):
    listings: List[ListingOut]
    total: int
    
    model_config = ConfigDict(from_attributes=True)


# Admin schemas
class OwnerInfo(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: str
    is_approved_lister: bool
    
    model_config = ConfigDict(from_attributes=True)


class EnrolledUserInfo(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    booking_id: int
    booking_status: str
    booking_amount: float
    enrolled_at: datetime
    payment_id: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class BookingStats(BaseModel):
    total_bookings: int
    pending_bookings: int
    accepted_bookings: int
    rejected_bookings: int
    total_revenue: float
    
    model_config = ConfigDict(from_attributes=True)


class ListingDetailOut(ListingBase):
    id: int
    owner_id: int
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Owner information
    owner: OwnerInfo
    
    # Faculty list
    faculty: List[FacultyOut] = []
    
    # Booking statistics
    stats: BookingStats
    
    # Enrolled users
    enrolled_users: List[EnrolledUserInfo] = []
    
    model_config = ConfigDict(from_attributes=True)


class AdminListingItem(BaseModel):
    id: int
    name: str
    type: str
    price: float
    location: Optional[str] = None
    owner_email: str
    owner_name: Optional[str] = None
    total_bookings: int
    pending_bookings: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AdminListingsOut(BaseModel):
    listings: List[AdminListingItem]
    total: int
    
    model_config = ConfigDict(from_attributes=True)
