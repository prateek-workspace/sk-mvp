from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session

from apps.faculty.schemas import FacultyCreate, FacultyUpdate, FacultyOut, FacultyListOut
from apps.faculty.services import FacultyService
from apps.accounts.services.authenticate import AccountService
from apps.core.services.cloudinary_service import CloudinaryService
from config.database import get_db

router = APIRouter(prefix="/faculty", tags=["Faculty"])


def get_faculty_service(db: Session = Depends(get_db)) -> FacultyService:
    return FacultyService(db)


@router.get("/", response_model=FacultyListOut)
def list_faculty(
    listing_id: int = Query(None),
    service: FacultyService = Depends(get_faculty_service),
):
    """List all faculty members, optionally filtered by listing"""
    faculty = service.list_faculty(listing_id=listing_id)
    return {"faculty": faculty, "total": len(faculty)}


@router.get("/{faculty_id}", response_model=FacultyOut)
def get_faculty(
    faculty_id: int,
    service: FacultyService = Depends(get_faculty_service),
):
    """Get a single faculty member by ID"""
    faculty = service.get_faculty(faculty_id)
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    return faculty


@router.post("/", response_model=FacultyOut, status_code=status.HTTP_201_CREATED)
def create_faculty(
    data: FacultyCreate,
    current_user: dict = Depends(AccountService.current_user),
    service: FacultyService = Depends(get_faculty_service),
):
    """Create a new faculty member"""
    return service.create_faculty(data)


@router.post("/bulk", response_model=List[FacultyOut], status_code=status.HTTP_201_CREATED)
def create_bulk_faculty(
    data: List[FacultyCreate],
    current_user: dict = Depends(AccountService.current_user),
    service: FacultyService = Depends(get_faculty_service),
):
    """Create multiple faculty members at once"""
    return service.create_bulk_faculty(data)


@router.put("/{faculty_id}", response_model=FacultyOut)
def update_faculty(
    faculty_id: int,
    data: FacultyUpdate,
    current_user: dict = Depends(AccountService.current_user),
    service: FacultyService = Depends(get_faculty_service),
):
    """Update an existing faculty member"""
    updated_faculty = service.update_faculty(faculty_id, data)
    if not updated_faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    return updated_faculty


@router.delete("/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faculty(
    faculty_id: int,
    current_user: dict = Depends(AccountService.current_user),
    service: FacultyService = Depends(get_faculty_service),
):
    """Delete a faculty member"""
    success = service.delete_faculty(faculty_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    return None


@router.post("/{faculty_id}/media", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_faculty_image(
    faculty_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(AccountService.current_user),
    service: FacultyService = Depends(get_faculty_service),
):
    """Upload an image for a faculty member"""
    faculty = service.get_faculty(faculty_id)
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found")
    
    # Upload to Cloudinary (synchronous call)
    result = CloudinaryService.upload_image(
        file=file, 
        folder=f"prephub/faculty/{faculty.listing_id}/{faculty_id}"
    )
    image_url = result["url"]
    
    # Update faculty with image URL
    service.update_faculty(faculty_id, FacultyUpdate(image_url=image_url))
    
    return {"image_url": image_url}
