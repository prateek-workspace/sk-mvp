# apps/accounts/services/user.py

from fastapi import HTTPException
from starlette import status

from sqlalchemy.orm import Session

from config.database import SessionLocal
from apps.accounts.models import User
from apps.accounts.services.password import PasswordManager
from apps.core.date_time import DateTime


class UserManager:

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------
    @classmethod
    def create_user(
        cls,
        email: str,
        password: str,
        first_name: str | None = None,
        last_name: str | None = None,
        is_verified_email: bool = False,
        is_active: bool = False,
        is_superuser: bool = False,
        role: str = "user",
        updated_at: DateTime = None,
        last_login: DateTime = None,
    ) -> User:

        db: Session = SessionLocal()

        try:
            user = User(
                email=email,
                password=PasswordManager.hash_password(password),
                first_name=first_name,
                last_name=last_name,
                is_verified_email=is_verified_email,
                is_active=is_active,
                is_superuser=is_superuser,
                role=role,
                updated_at=updated_at,
                last_login=last_login,
            )

            db.add(user)
            db.commit()
            db.refresh(user)
            return user

        finally:
            db.close()

    # --------------------------------------------------------
    # GET USER (BY ID OR EMAIL)
    # --------------------------------------------------------
    @staticmethod
    def get_user(user_id: int | None = None, email: str | None = None) -> User | None:
        db: Session = SessionLocal()

        try:
            query = db.query(User)

            if user_id:
                return query.filter(User.id == user_id).first()

            if email:
                return query.filter(User.email == email).first()

            return None

        finally:
            db.close()

    @staticmethod
    def get_user_by_id(user_id: int) -> User | None:
        """Retrieve a user by ID"""
        return UserManager.get_user(user_id=user_id)

    @staticmethod
    def list_users(skip: int = 0, limit: int = 100) -> list[User]:
        """List all users with pagination"""
        db: Session = SessionLocal()
        try:
            users = db.query(User).offset(skip).limit(limit).all()
            return users
        finally:
            db.close()

    # --------------------------------------------------------
    # GET USER OR RAISE 404
    # --------------------------------------------------------
    @staticmethod
    def get_user_or_404(user_id: int | None = None, email: str | None = None) -> User:
        db: Session = SessionLocal()

        try:
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
            elif email:
                user = db.query(User).filter(User.email == email).first()
            else:
                raise HTTPException(404, "User not found.")

            if not user:
                raise HTTPException(404, "User not found.")

            return user

        finally:
            db.close()

    # --------------------------------------------------------
    # UPDATE USER
    # --------------------------------------------------------
    @classmethod
    def update_user(
        cls,
        user_id: int,
        email: str | None = None,
        password: str | None = None,
        first_name: str | None = None,
        last_name: str | None = None,
        phone_number: str | None = None,
        address: str | None = None,
        city: str | None = None,
        state: str | None = None,
        pincode: str | None = None,
        is_verified_email: bool | None = None,
        is_active: bool | None = None,
        is_superuser: bool | None = None,
        role: str | None = None,
        is_approved_lister: bool | None = None,
        last_login: DateTime | None = None,
    ) -> User:

        db: Session = SessionLocal()

        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(404, "User not found.")

            if first_name is not None:
                user.first_name = first_name
            if last_name is not None:
                user.last_name = last_name
            if phone_number is not None:
                user.phone_number = phone_number
            if address is not None:
                user.address = address
            if city is not None:
                user.city = city
            if state is not None:
                user.state = state
            if pincode is not None:
                user.pincode = pincode
            if email is not None:
                user.email = email
            if password is not None:
                user.password = PasswordManager.hash_password(password)
            if is_verified_email is not None:
                user.is_verified_email = is_verified_email
            if is_active is not None:
                user.is_active = is_active
            if is_superuser is not None:
                user.is_superuser = is_superuser
            if role is not None:
                user.role = role
            if is_approved_lister is not None:
                user.is_approved_lister = is_approved_lister
            if last_login is not None:
                user.last_login = last_login

            user.updated_at = DateTime.now()

            db.commit()
            db.refresh(user)
            return user

        finally:
            db.close()

    # --------------------------------------------------------
    # UPDATE LAST LOGIN
    # --------------------------------------------------------
    @classmethod
    def update_last_login(cls, user_id: int):
        db: Session = SessionLocal()

        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return

            user.last_login = DateTime.now()

            db.commit()

        finally:
            db.close()

    # --------------------------------------------------------
    # CONVERT USER TO DICT
    # --------------------------------------------------------
    @staticmethod
    def to_dict(user: User):
        return {
            "user_id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_verified_email": user.is_verified_email,
            "date_joined": DateTime.string(user.date_joined),
            "updated_at": DateTime.string(user.updated_at),
            "last_login": DateTime.string(user.last_login),
        }

    # --------------------------------------------------------
    # NEW USER DIRECT INSERT
    # --------------------------------------------------------
    @classmethod
    def new_user(cls, **user_data):
        db: Session = SessionLocal()

        try:
            user = User(**user_data)
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        finally:
            db.close()

    # --------------------------------------------------------
    # STATUS CHECKS
    # --------------------------------------------------------
    @staticmethod
    def is_active(user: User):
        if not user.is_active:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "Inactive user."
            )

    @staticmethod
    def is_verified_email(user: User):
        if not user.is_verified_email:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Please verify your email address to continue.",
            )
