from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List


# ---------- Faculty ----------
class FacultyBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class FacultyCreate(FacultyBase):
    pass


class FacultyResponse(FacultyBase):
    id: UUID4
    class Config:
        orm_mode = True


# ---------- Listing ----------
class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str  # e.g. "pg", "library", "tiffin", "coaching"
    image_url: Optional[str] = None  # cover image


class ListingCreate(ListingBase):
    faculty: Optional[List[FacultyCreate]] = []  # only for coaching


class ListingResponse(ListingBase):
    id: UUID4
    owner_id: UUID4
    created_at: datetime
    faculty: Optional[List[FacultyResponse]] = []

    class Config:
        orm_mode = True
