from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from datetime import datetime

from apps.bookings.models import Booking, PaymentStatus
from apps.bookings.schemas import BookingCreate, BookingUpdate, AdminSettingsUpdate
from apps.core.models import AdminSettings
from apps.accounts.models import User
from apps.core.logger import log


class BookingService:
    def __init__(self, db: Session):
        self.db = db

    def list_bookings(self, user_id: Optional[int] = None, listing_id: Optional[int] = None) -> List[Booking]:
        """List all bookings with user and listing details, optionally filtered by user or listing"""
        log.service("list_bookings called", user_id=user_id, listing_id=listing_id)
        
        query = select(Booking).options(
            joinedload(Booking.user),
            joinedload(Booking.listing)
        )
        
        if user_id:
            query = query.where(Booking.user_id == user_id)
        if listing_id:
            query = query.where(Booking.listing_id == listing_id)
        
        result = self.db.execute(query)
        bookings = list(result.scalars().all())
        
        log.service("list_bookings completed", count=len(bookings))
        return bookings

    def list_bookings_with_details(self) -> List[Booking]:
        """List all bookings with detailed user and listing information"""
        query = select(Booking).options(
            joinedload(Booking.user),
            joinedload(Booking.listing)
        )
        
        result = self.db.execute(query)
        bookings = result.scalars().all()
        
        return bookings

    def get_booking(self, booking_id: int) -> Optional[Booking]:
        """Get a single booking by ID with user and listing details"""
        query = select(Booking).options(
            joinedload(Booking.user),
            joinedload(Booking.listing)
        ).where(Booking.id == booking_id)
        
        result = self.db.execute(query)
        return result.scalars().first()

    def create_booking(self, data: BookingCreate, user_id: int, payment_id: Optional[str] = None, payment_screenshot: Optional[str] = None) -> Booking:
        """Create a new booking with quantity and payment proof"""
        log.service("create_booking called", user_id=user_id, listing_id=data.listing_id, quantity=data.quantity)
        
        # Get listing to calculate amount based on quantity
        from apps.listings.services import ListingService
        listing_service = ListingService(self.db)
        listing = listing_service.get_listing(data.listing_id)
        
        if not listing:
            log.error("Listing not found", listing_id=data.listing_id)
            raise ValueError("Listing not found")
        
        # Calculate amount: listing price * quantity
        calculated_amount = listing.price * data.quantity
        log.debug("Calculated booking amount", listing_price=float(listing.price), quantity=data.quantity, total=float(calculated_amount))
        
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
        
        log.service("create_booking completed", booking_id=booking.id, amount=float(booking.amount))
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
        booking.updated_at = datetime.utcnow()
        
        self.db.commit()
        # Re-fetch with relationships
        return self.get_booking(booking_id)

    def update_booking_status(self, booking_id: int, status: str) -> Optional[Booking]:
        """Update booking status (accept/reject/waitlist by lister). Allows any status transition."""
        log.service("update_booking_status called", booking_id=booking_id, new_status=status)
        
        booking = self.get_booking(booking_id)
        if not booking:
            log.warn("Booking not found for status update", booking_id=booking_id)
            return None
        
        old_status = booking.status
        booking.status = status
        booking.updated_at = datetime.utcnow()
        
        log.db("Updating booking status in database", booking_id=booking_id, old_status=old_status, new_status=status)
        
        self.db.commit()
        # Re-fetch with relationships to ensure frontend gets complete data
        updated = self.get_booking(booking_id)
        
        log.service("update_booking_status completed", booking_id=booking_id, status=status)
        return updated

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
            booking.status= "accepted"
        elif payment_status == PaymentStatus.fake.value:
            # Cancel the booking if payment is fake
            booking.status = "cancelled"
            booking.payment_verified_at = None
        else:
            # Pending - reset verification timestamp
            booking.payment_verified_at = None
            booking.status = "pending"
        
        booking.updated_at = datetime.utcnow()
        
        self.db.commit()
        # Re-fetch with relationships
        return self.get_booking(booking_id)


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
