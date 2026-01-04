from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from apps.bookings.schemas import (
    BookingCreate, BookingUpdate, BookingOut, BookingListOut,
    BookingCreateResponse, PaymentProofUpload, BookingStatusUpdate,
    BookingWithDetails, PaymentVerificationUpdate, AdminSettingsOut, AdminSettingsUpdate
)
from apps.bookings.services import BookingService, AdminSettingsService
from apps.accounts.services.authenticate import AccountService
from apps.accounts.models import User
from config.database import get_db

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def get_booking_service(db: Session = Depends(get_db)) -> BookingService:
    return BookingService(db)


def get_admin_settings_service(db: Session = Depends(get_db)) -> AdminSettingsService:
    return AdminSettingsService(db)


@router.get("/payment-info", response_model=AdminSettingsOut)
def get_payment_info(
    settings_service: AdminSettingsService = Depends(get_admin_settings_service),
):
    """Get admin payment QR code and UPI ID for bookings"""
    settings = settings_service.get_settings()
    if not settings or not settings.payment_qr_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Payment information not configured by admin"
        )
    return settings


@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: BookingCreate,
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """Create a new booking with quantity and payment proof"""
    booking = service.create_booking(
        data, 
        user_id=current_user.id,
        payment_id=data.payment_id,
        payment_screenshot=data.payment_screenshot
    )
    return booking


@router.post("/{booking_id}/payment", response_model=BookingOut)
def upload_payment_proof(
    booking_id: int,
    data: PaymentProofUpload,
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """Upload payment proof (screenshot and payment ID) for a booking"""
    booking = service.get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    # Check if user owns the booking
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return service.upload_payment_proof(booking_id, data.payment_id, data.payment_screenshot)


@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """Lister can accept/reject/waitlist a booking"""
    booking = service.get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    # Check if current user is the owner of the listing
    from apps.listings.services import ListingService
    listing_service = ListingService(service.db)
    listing = listing_service.get_listing(booking.listing_id)
    
    if not listing or listing.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    if data.status not in ["accepted", "rejected", "waitlist"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status. Must be: accepted, rejected, or waitlist")
    
    return service.update_booking_status(booking_id, data.status)


@router.get("/", response_model=BookingListOut)
async def list_bookings(
    listing_id: int = Query(None),
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """List bookings for the current user or their listings"""
    # If user is a listing owner, show bookings for their listings
    if current_user.role in ['hostel', 'coaching', 'library', 'tiffin']:
        from apps.listings.services import ListingService
        listing_service = ListingService(service.db)
        my_listings = listing_service.list_listings(owner_id=current_user.id)
        listing_ids = [l.id for l in my_listings]
        
        # Get all bookings for owner's listings
        all_bookings = []
        for lid in listing_ids:
            bookings = service.list_bookings(listing_id=lid)
            all_bookings.extend(bookings)
        return {"bookings": all_bookings, "total": len(all_bookings)}
    
    # For regular users, show their bookings
    bookings = service.list_bookings(user_id=current_user.id, listing_id=listing_id)
    return {"bookings": bookings, "total": len(bookings)}


@router.get("/admin/all", response_model=BookingListOut)
def list_all_bookings_admin(
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """Admin can view all bookings"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    bookings = service.list_bookings()
    return {"bookings": bookings, "total": len(bookings)}


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: int,
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """Get a single booking by ID"""
    booking = service.get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    # Check if user owns the booking
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this booking")
    
    return booking


@router.put("/{booking_id}", response_model=BookingOut)
def update_booking(
    booking_id: int,
    data: BookingUpdate,
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """Update a booking"""
    booking = service.get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    # Check if user owns the booking
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this booking")
    
    updated_booking = service.update_booking(booking_id, data)
    return updated_booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: int,
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """Delete a booking"""
    booking = service.get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    # Check if user owns the booking
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this booking")
    
    service.delete_booking(booking_id)
    return None


# Admin endpoints for payment verification and settings
@router.patch("/admin/{booking_id}/verify-payment", response_model=BookingOut)
def verify_payment(
    booking_id: int,
    data: PaymentVerificationUpdate,
    current_user: User = Depends(AccountService.current_user),
    service: BookingService = Depends(get_booking_service),
):
    """Admin verifies payment for a booking"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    booking = service.get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    
    return service.verify_payment(booking_id, data.payment_verified)


@router.get("/admin/settings", response_model=AdminSettingsOut)
def get_admin_settings(
    current_user: User = Depends(AccountService.current_user),
    settings_service: AdminSettingsService = Depends(get_admin_settings_service),
):
    """Get admin payment settings"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    settings = settings_service.get_settings()
    return settings if settings else {"id": 0, "payment_qr_code": None, "payment_upi_id": None}


@router.put("/admin/settings", response_model=AdminSettingsOut)
def update_admin_settings(
    data: AdminSettingsUpdate,
    current_user: User = Depends(AccountService.current_user),
    settings_service: AdminSettingsService = Depends(get_admin_settings_service),
):
    """Update admin payment settings (QR code and UPI ID)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    return settings_service.update_settings(data, current_user.id)
