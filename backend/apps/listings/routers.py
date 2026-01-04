from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session

from apps.listings.schemas import (
    ListingCreate, ListingUpdate, ListingOut, ListingListOut,
    AdminListingsOut, AdminListingItem, ListingDetailOut,
    OwnerInfo, BookingStats, EnrolledUserInfo, FacultyOut
)
from apps.listings.services import ListingService
from apps.accounts.services.authenticate import AccountService
from apps.accounts.models import User
from apps.core.services.cloudinary_service import CloudinaryService
from config.database import get_db

router = APIRouter(prefix="/listings", tags=["Listings"])


def get_listing_service(db: Session = Depends(get_db)) -> ListingService:
    return ListingService(db)


def get_account_service(db: Session = Depends(get_db)) -> AccountService:
    return AccountService(db)


@router.get("/", response_model=ListingListOut)
def list_listings(
    listing_type: str = Query(None, alias="type"),
    owner_id: int = Query(None),
    service: ListingService = Depends(get_listing_service),
):
    """List all listings, optionally filtered by type or owner"""
    listings = service.list_listings(listing_type=listing_type, owner_id=owner_id)
    return {"listings": listings, "total": len(listings)}


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(
    listing_id: int,
    service: ListingService = Depends(get_listing_service),
):
    """Get a single listing by ID"""
    listing = service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return listing


@router.post("/", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    data: ListingCreate,
    current_user: dict = Depends(AccountService.current_user),
    service: ListingService = Depends(get_listing_service),
):
    """Create a new listing (approved listing owners only)"""
    # Check if user has listing role
    if current_user.role not in ['hostel', 'coaching', 'library', 'tiffin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only users with listing roles can create listings"
        )
    
    # Check if user is approved
    if not current_user.is_approved_lister:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Your account must be approved by admin before creating listings"
        )
    
    return service.create_listing(data, owner_id=current_user.id)


@router.put("/{listing_id}", response_model=ListingOut)
def update_listing(
    listing_id: int,
    data: ListingUpdate,
    current_user: dict = Depends(AccountService.current_user),
    service: ListingService = Depends(get_listing_service),
):
    """Update an existing listing (owner only)"""
    listing = service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this listing")
    
    updated_listing = service.update_listing(listing_id, data)
    return updated_listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    current_user: dict = Depends(AccountService.current_user),
    service: ListingService = Depends(get_listing_service),
):
    """Delete a listing (owner only)"""
    listing = service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this listing")
    
    service.delete_listing(listing_id)
    return None


@router.post("/{listing_id}/media", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_listing_image(
    listing_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(AccountService.current_user),
    service: ListingService = Depends(get_listing_service),
):
    """Upload an image for a listing"""
    listing = service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload media for this listing")
    
    # Upload to Cloudinary (async call)
    result = await CloudinaryService.upload_image(
        file=file, 
        folder=f"prephub/listings/{listing_id}"
    )
    image_url = result["url"]
    
    # Update listing with image URL
    service.update_listing(listing_id, ListingUpdate(image_url=image_url))
    
    return {"image_url": image_url}


# Admin endpoints
@router.get("/admin/all", response_model=AdminListingsOut)
def admin_get_all_listings(
    current_user: User = Depends(AccountService.current_user),
    service: ListingService = Depends(get_listing_service),
):
    """Admin: Get all listings with booking stats"""
    # Check admin role
    if not isinstance(current_user, User):
        current_user = User(**current_user)
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin access required"
        )
    
    listings_data = service.get_all_listings_admin()
    listings = [AdminListingItem(**data) for data in listings_data]
    return AdminListingsOut(listings=listings, total=len(listings))


@router.get("/admin/{listing_id}/details", response_model=ListingDetailOut)
def admin_get_listing_details(
    listing_id: int,
    current_user: User = Depends(AccountService.current_user),
    service: ListingService = Depends(get_listing_service),
):
    """Admin: Get detailed listing information including enrolled users"""
    # Check admin role
    if not isinstance(current_user, User):
        current_user = User(**current_user)
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin access required"
        )
    
    detail_data = service.get_listing_detail_admin(listing_id)
    if not detail_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Listing not found"
        )
    
    listing = detail_data['listing']
    
    # Format the response
    return ListingDetailOut(
        id=listing.id,
        owner_id=listing.owner_id,
        type=listing.type,
        name=listing.name,
        description=listing.description,
        price=float(listing.price),
        location=listing.location,
        features=listing.features,
        image_url=listing.image_url,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        owner=OwnerInfo(
            id=listing.owner.id,
            email=listing.owner.email,
            first_name=listing.owner.first_name,
            last_name=listing.owner.last_name,
            phone_number=listing.owner.phone_number,
            role=listing.owner.role,
            is_approved_lister=listing.owner.is_approved_lister
        ),
        faculty=[FacultyOut.model_validate(f) for f in listing.faculty],
        stats=BookingStats(**detail_data['stats']),
        enrolled_users=[EnrolledUserInfo(**u) for u in detail_data['enrolled_users']]
    )


@router.put("/admin/{listing_id}", response_model=ListingOut)
def admin_update_listing(
    listing_id: int,
    data: ListingUpdate,
    current_user: User = Depends(AccountService.current_user),
    service: ListingService = Depends(get_listing_service),
):
    """Admin: Update any listing"""
    # Check admin role
    if not isinstance(current_user, User):
        current_user = User(**current_user)
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin access required"
        )
    
    listing = service.get_listing(listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Listing not found"
        )
    
    updated_listing = service.update_listing(listing_id, data)
    return updated_listing


@router.delete("/admin/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_listing(
    listing_id: int,
    current_user: User = Depends(AccountService.current_user),
    service: ListingService = Depends(get_listing_service),
):
    """Admin: Delete any listing"""
    # Check admin role
    if not isinstance(current_user, User):
        current_user = User(**current_user)
    
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Admin access required"
        )
    
    listing = service.get_listing(listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Listing not found"
        )
    
    service.delete_listing(listing_id)
    return None
