from typing import List, Optional, Dict
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, func, case

from apps.listings.models import Listing
from apps.listings.schemas import ListingCreate, ListingUpdate
from apps.bookings.models import Booking
from apps.accounts.models import User


class ListingService:
    def __init__(self, db: Session):
        self.db = db

    def list_listings(self, listing_type: Optional[str] = None, owner_id: Optional[int] = None) -> List[Listing]:
        """List all listings, optionally filtered by type or owner"""
        query = select(Listing).options(selectinload(Listing.faculty))
        
        if listing_type:
            query = query.where(Listing.type == listing_type)
        if owner_id:
            query = query.where(Listing.owner_id == owner_id)
        
        result = self.db.execute(query)
        return list(result.scalars().all())

    def get_listing(self, listing_id: int) -> Optional[Listing]:
        """Get a single listing by ID"""
        query = select(Listing).options(selectinload(Listing.faculty)).where(Listing.id == listing_id)
        result = self.db.execute(query)
        return result.scalar_one_or_none()

    def create_listing(self, data: ListingCreate, owner_id: int) -> Listing:
        """Create a new listing"""
        listing = Listing(
            owner_id=owner_id,
            type=data.type,
            name=data.name,
            description=data.description,
            price=data.price,
            location=data.location,
            features=data.features,
        )
        self.db.add(listing)
        self.db.commit()
        self.db.refresh(listing)
        return listing

    def update_listing(self, listing_id: int, data: ListingUpdate) -> Optional[Listing]:
        """Update an existing listing"""
        listing = self.get_listing(listing_id)
        if not listing:
            return None

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(listing, field, value)

        self.db.commit()
        self.db.refresh(listing)
        return listing

    def delete_listing(self, listing_id: int) -> bool:
        """Delete a listing"""
        listing = self.get_listing(listing_id)
        if not listing:
            return False

        self.db.delete(listing)
        self.db.commit()
        return True

    # Admin methods
    def get_all_listings_admin(self) -> List[Dict]:
        """Get all listings with booking stats for admin"""
        query = (
            select(
                Listing.id,
                Listing.name,
                Listing.type,
                Listing.price,
                Listing.location,
                Listing.created_at,
                User.email.label('owner_email'),
                (User.first_name + ' ' + User.last_name).label('owner_name'),
                func.count(Booking.id).label('total_bookings'),
                func.sum(
                    case((Booking.status == 'pending', 1), else_=0)
                ).label('pending_bookings')
            )
            .join(User, Listing.owner_id == User.id)
            .outerjoin(Booking, Listing.id == Booking.listing_id)
            .group_by(
                Listing.id,
                Listing.name,
                Listing.type,
                Listing.price,
                Listing.location,
                Listing.created_at,
                User.email,
                User.first_name,
                User.last_name
            )
        )
        
        result = self.db.execute(query)
        return [dict(row._mapping) for row in result]

    def get_listing_detail_admin(self, listing_id: int) -> Optional[Dict]:
        """Get detailed listing information for admin including all enrolled users"""
        # Get the listing with owner and faculty
        query = (
            select(Listing)
            .options(
                selectinload(Listing.owner),
                selectinload(Listing.faculty),
                selectinload(Listing.bookings).selectinload(Booking.user)
            )
            .where(Listing.id == listing_id)
        )
        
        result = self.db.execute(query)
        listing = result.scalar_one_or_none()
        
        if not listing:
            return None
        
        # Calculate booking stats
        bookings = listing.bookings
        stats = {
            'total_bookings': len(bookings),
            'pending_bookings': sum(1 for b in bookings if b.status == 'pending'),
            'accepted_bookings': sum(1 for b in bookings if b.status == 'accepted'),
            'rejected_bookings': sum(1 for b in bookings if b.status == 'rejected'),
            'total_revenue': sum(float(b.amount) for b in bookings if b.status == 'accepted')
        }
        
        # Format enrolled users
        enrolled_users = []
        for booking in bookings:
            user = booking.user
            enrolled_users.append({
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'booking_id': booking.id,
                'booking_status': booking.status,
                'booking_amount': float(booking.amount),
                'enrolled_at': booking.created_at,
                'payment_id': booking.payment_id
            })
        
        return {
            'listing': listing,
            'stats': stats,
            'enrolled_users': enrolled_users
        }
