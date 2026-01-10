from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, field_validator
from enum import Enum


class PaymentStatus(str, Enum):
    """Payment verification status"""
    pending = "pending"
    verified = "verified"
    fake = "fake"


class BookingBase(BaseModel):
    listing_id: int
    amount: float
    quantity: int = 1
    status: Optional[str] = "pending"
    
    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Quantity must be between 1 and 5')
        return v


class BookingCreate(BaseModel):
    listing_id: int
    quantity: int = 1
    payment_id: Optional[str] = None
    payment_screenshot: Optional[str] = None
    
    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Quantity must be between 1 and 5')
        return v


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    amount: Optional[float] = None


class PaymentProofUpload(BaseModel):
    payment_id: str
    payment_screenshot: str  # URL or base64 encoded image


class BookingStatusUpdate(BaseModel):
    status: str  # accepted or rejected


class UserBasic(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class BookingOut(BaseModel):
    id: int
    listing_id: int
    user_id: int
    status: str
    amount: float
    quantity: int
    payment_id: Optional[str] = None
    payment_screenshot: Optional[str] = None
    payment_verified: bool = False
    payment_status: PaymentStatus = PaymentStatus.pending
    payment_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[UserBasic] = None
    
    model_config = ConfigDict(from_attributes=True)


class BookingWithDetails(BaseModel):
    id: int
    listing_id: int
    user_id: int
    status: str
    amount: float
    quantity: int
    payment_id: Optional[str] = None
    payment_screenshot: Optional[str] = None
    payment_verified: bool = False
    payment_status: str = "pending"
    payment_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Additional user and listing details
    user_email: Optional[str] = None
    listing_name: Optional[str] = None
    listing_type: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class BookingListOut(BaseModel):
    bookings: List[BookingOut]
    total: int


class BookingCreateResponse(BaseModel):
    booking: BookingOut
    qr_code: str  # QR code data for payment
    upi_id: str  # UPI ID for payment


# Admin payment verification
class PaymentVerificationUpdate(BaseModel):
    payment_status: PaymentStatus
    notes: Optional[str] = None


# Admin settings for QR code
class AdminSettingsOut(BaseModel):
    id: int
    payment_qr_code: Optional[str] = None
    payment_upi_id: Optional[str] = None
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class AdminSettingsUpdate(BaseModel):
    payment_qr_code: Optional[str] = None
    payment_upi_id: Optional[str] = None
