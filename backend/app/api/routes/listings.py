from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.schemas.listing import ListingCreate, ListingResponse
from app.services.listing_service import create_listing, get_all_listings

router = APIRouter(prefix="/listings", tags=["Listings"])


# Public endpoint
@router.get("/", response_model=list[ListingResponse])
def list_listings(db: Session = Depends(get_db)):
    return get_all_listings(db)


# Authenticated - anyone except student
@router.post("/", response_model=ListingResponse)
def create_new_listing(
    listing: ListingCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.role == "student":
        raise HTTPException(status_code=403, detail="Students cannot create listings")

    # Only coaching can send faculty info
    if listing.category.lower() != "coaching" and listing.faculty:
        raise HTTPException(status_code=400, detail="Only coaching can have faculty data")

    new_listing = create_listing(db, listing, current_user.id)
    return new_listing
