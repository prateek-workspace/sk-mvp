from sqlalchemy.orm import Session
from app.models.listings import Listing, Faculty
from app.schemas.listing import ListingCreate


def get_all_listings(db: Session):
    return db.query(Listing).all()


def create_listing(db: Session, listing_data: ListingCreate, owner_id: str):
    new_listing = Listing(
        title=listing_data.title,
        description=listing_data.description,
        category=listing_data.category,
        image_url=listing_data.image_url,
        owner_id=owner_id
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    # If category is 'coaching', add faculty
    if listing_data.category.lower() == "coaching" and listing_data.faculty:
        for faculty_member in listing_data.faculty:
            faculty = Faculty(
                listing_id=new_listing.id,
                name=faculty_member.name,
                description=faculty_member.description,
                image_url=faculty_member.image_url,
            )
            db.add(faculty)
        db.commit()

    db.refresh(new_listing)
    return new_listing
