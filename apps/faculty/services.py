from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from apps.faculty.models import Faculty
from apps.faculty.schemas import FacultyCreate, FacultyUpdate


class FacultyService:
    def __init__(self, db: Session):
        self.db = db

    def list_faculty(self, listing_id: Optional[int] = None) -> List[Faculty]:
        """List faculty members, optionally filtered by listing"""
        query = select(Faculty)
        
        if listing_id:
            query = query.where(Faculty.listing_id == listing_id)
        
        result = self.db.execute(query)
        return list(result.scalars().all())

    def get_faculty(self, faculty_id: int) -> Optional[Faculty]:
        """Get a single faculty member by ID"""
        return self.db.get(Faculty, faculty_id)

    def create_faculty(self, data: FacultyCreate) -> Faculty:
        """Create a new faculty member"""
        faculty = Faculty(
            listing_id=data.listing_id,
            name=data.name,
            subject=data.subject,
            image_url=data.image_url,
        )
        self.db.add(faculty)
        self.db.commit()
        self.db.refresh(faculty)
        return faculty

    def create_bulk_faculty(self, faculty_list: List[FacultyCreate]) -> List[Faculty]:
        """Create multiple faculty members at once"""
        faculty_objs = [
            Faculty(
                listing_id=data.listing_id,
                name=data.name,
                subject=data.subject,
                image_url=data.image_url,
            )
            for data in faculty_list
        ]
        self.db.add_all(faculty_objs)
        self.db.commit()
        for obj in faculty_objs:
            self.db.refresh(obj)
        return faculty_objs

    def update_faculty(self, faculty_id: int, data: FacultyUpdate) -> Optional[Faculty]:
        """Update an existing faculty member"""
        faculty = self.get_faculty(faculty_id)
        if not faculty:
            return None

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(faculty, field, value)

        self.db.commit()
        self.db.refresh(faculty)
        return faculty

    def delete_faculty(self, faculty_id: int) -> bool:
        """Delete a faculty member"""
        faculty = self.get_faculty(faculty_id)
        if not faculty:
            return False

        self.db.delete(faculty)
        self.db.commit()
        return True

    def delete_faculty_by_listing(self, listing_id: int) -> int:
        """Delete all faculty members for a listing"""
        faculty_list = self.list_faculty(listing_id=listing_id)
        count = len(faculty_list)
        for faculty in faculty_list:
            self.db.delete(faculty)
        self.db.commit()
        return count
