from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class FacultyBase(BaseModel):
    name: str
    subject: Optional[str] = None
    image_url: Optional[str] = None


class FacultyCreate(FacultyBase):
    listing_id: int


class FacultyUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    image_url: Optional[str] = None


class FacultyOut(FacultyBase):
    id: int
    listing_id: int
    
    model_config = ConfigDict(from_attributes=True)


class FacultyListOut(BaseModel):
    faculty: List[FacultyOut]
    total: int
