from contextlib import contextmanager
from typing import Generator

from app.db.base import SessionLocal


def get_db() -> Generator:
    """Simple DB dependency that yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
