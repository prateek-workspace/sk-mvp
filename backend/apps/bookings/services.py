from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from datetime import datetime

from apps.bookings.models import Booking, PaymentStatus
from apps.bookings.schemas import BookingCreate, BookingUpdate, AdminSettingsUpdate
from apps.core.models import AdminSettings
from apps.accounts.models import User


class BookingService:
    def __init__(self, db: Session):
        self.db = db

    def list_bookings(self, user_id: Optional[int] = None, listing_id: Optional[int] = None) -> List[Booking]:
        """List all bookings with user details, optionally filtered by user or listing"""
        query = select(Booking).options(joinedload(Booking.user))
        
        if user_id:
            query = query.where(Booking.user_id == user_id)
        if listing_id:
            query = query.where(Booking.listing_id == listing_id)
        
        result = self.db.execute(query)
        return list(result.scalars().all())

    def list_bookings_with_details(self) -> List[dict]:
        """List all bookings with detailed user and listing information"""
        query = select(Booking).options(
            joinedload(Booking.user),
            joinedload(Booking.listing)
        )
        
        result = self.db.execute(query)
        bookings = result.scalars().all()
        
        # Transform to dict with all required details
        detailed_bookings = []
        for booking in bookings:
            detailed_bookings.append({
                "id": booking.id,
                "listing_id": booking.listing_id,
                "listing_name": booking.listing.name if booking.listing else "Unknown",
                "listing_type": booking.listing.type if booking.listing else "Unknown",
                "user_id": booking.user_id,
                "user_email": booking.user.email if booking.user else "Unknown",
                "user_name": f"{booking.user.first_name or ''} {booking.user.last_name or ''}".strip() if booking.user else "Unknown",
                "status": booking.status,
                "amount": float(booking.amount),
                "quantity": booking.quantity,
                "payment_id": booking.payment_id,
                "payment_screenshot": booking.payment_screenshot,
                "payment_verified": booking.payment_verified,
                "payment_status": booking.payment_status.value if booking.payment_status else "pending",
                "payment_verified_at": booking.payment_verified_at.isoformat() if booking.payment_verified_at else None,
                "created_at": booking.created_at.isoformat() if booking.created_at else None,
                "updated_at": booking.updated_at.isoformat() if booking.updated_at else None,
            })
        
        return detailed_bookings

    def get_booking(self, booking_id: int) -> Optional[Booking]:
        """Get a single booking by ID"""
        return self.db.get(Booking, booking_id)

    def create_booking(self, data: BookingCreate, user_id: int, payment_id: Optional[str] = None, payment_screenshot: Optional[str] = None) -> Booking:
        """Create a new booking with quantity and payment proof"""
        # Get listing to calculate amount based on quantity
        from apps.listings.services import ListingService
        listing_service = ListingService(self.db)
        listing = listing_service.get_listing(data.listing_id)
        
        if not listing:
            raise ValueError("Listing not found")
        
        # Calculate amount: listing price * quantity
        calculated_amount = listing.price * data.quantity
        
        booking = Booking(
            user_id=user_id,
            listing_id=data.listing_id,
            amount=calculated_amount,
            quantity=data.quantity,
            status="pending",
            payment_id=payment_id,
            payment_screenshot=payment_screenshot,
            payment_verified=False,
        )
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def update_booking(self, booking_id: int, data: BookingUpdate) -> Optional[Booking]:
        """Update an existing booking"""
        booking = self.get_booking(booking_id)
        if not booking:
            return None

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(booking, field, value)

        self.db.commit()
        self.db.refresh(booking)
        return booking

    def delete_booking(self, booking_id: int) -> bool:
        """Delete a booking"""
        booking = self.get_booking(booking_id)
        if not booking:
            return False

        self.db.delete(booking)
        self.db.commit()
        return True

    def upload_payment_proof(self, booking_id: int, payment_id: str, payment_screenshot: str) -> Optional[Booking]:
        """Upload payment proof for a booking"""
        booking = self.get_booking(booking_id)
        if not booking:
            return None
        
        booking.payment_id = payment_id
        booking.payment_screenshot = payment_screenshot
        
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def update_booking_status(self, booking_id: int, status: str) -> Optional[Booking]:
        """Update booking status (accept/reject/waitlist by lister)"""
        booking = self.get_booking(booking_id)
        if not booking:
            return None
        
        booking.status = status
        
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def verify_payment(self, booking_id: int, payment_status: str) -> Optional[Booking]:
        """Admin verifies payment for a booking. If marked as fake, cancels the booking."""
        booking = self.get_booking(booking_id)
        if not booking:
            return None
        
        # Update payment_status enum
        booking.payment_status = PaymentStatus(payment_status)
        
        # Update legacy payment_verified field for backward compatibility
        booking.payment_verified = (payment_status == PaymentStatus.verified.value)
        
        if payment_status == PaymentStatus.verified.value:
            booking.payment_verified_at = datetime.utcnow()
        elif payment_status == PaymentStatus.fake.value:
            # Cancel the booking if payment is fake
            booking.status = "cancelled"
            booking.payment_verified_at = None
        else:
            # Pending - reset verification timestamp
            booking.payment_verified_at = None
        
        self.db.commit()
        self.db.refresh(booking)
        return booking


class AdminSettingsService:
    """Service for managing admin payment settings"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_settings(self) -> Optional[AdminSettings]:
        """Get the admin settings (there should only be one row)"""
        result = self.db.execute(select(AdminSettings))
        return result.scalars().first()
    
    def update_settings(self, data: AdminSettingsUpdate, admin_id: int) -> AdminSettings:
        """Update or create admin settings"""
        settings = self.get_settings()
        
        if not settings:
            # Create new settings
            settings = AdminSettings(
                payment_qr_code=data.payment_qr_code,
                payment_upi_id=data.payment_upi_id,
                updated_by=admin_id,
            )
            self.db.add(settings)
        else:
            # Update existing settings
            if data.payment_qr_code is not None:
                settings.payment_qr_code = data.payment_qr_code
            if data.payment_upi_id is not None:
                settings.payment_upi_id = data.payment_upi_id
            settings.updated_by = admin_id
            settings.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(settings)
        return settings
