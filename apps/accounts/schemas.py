from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator, model_validator, ConfigDict

from apps.accounts.services.password import PasswordManager


class ValidatePasswordInSchema(BaseModel):
    password: str
    password_confirm: str

    @field_validator("password")
    def validate_password(cls, password: str):
        return PasswordManager.validate_password_strength(password=password, has_special_char=False)

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail='Passwords do not match!')
        return self


# ------------------------
# --- Register Schemas ---
# ------------------------

class RegisterIn(ValidatePasswordInSchema):
    email: EmailStr

    @staticmethod
    def examples():
        examples = {
            'openapi_examples': {
                "default": {
                    "summary": "Default",
                    "value": {
                        "email": "user@example.com",
                        "password": "string",
                        "password_confirm": "string"
                    },
                },
                "with-email": {
                    "summary": "Register a new user with email verification (OTP)",
                    "description": """

> `email:"user@example.com"` The unique email address of the user. Attempting to assign the same email address to users
returns an error.
> 
>`password:"<Password1>"` The password.
> 
> `password:"<Password1>"` The password that's confirmed.  
    
For a valid password you should:
* Use numbers _**0-9**_ in the password.
* Use lowercase characters _**a-z**_ in the password.
* Use uppercase characters _**A-Z**_ in the password.
* **Optional:** Use special characters __!?@#$%^&*()+{}[]<>/__ in the password.""",
                    "value": {
                        "email": "user@example.com",
                        "password": "NewPassword123",
                        "password_confirm": "NewPassword123"
                    },
                }
            }
        }
        return examples


class RegisterOut(BaseModel):
    email: EmailStr
    message: str


class RegisterVerifyIn(BaseModel):
    email: EmailStr
    otp: str


class RegisterVerifyOut(BaseModel):
    access_token: str
    message: str


# --------------------
# --- Login Schemas ---
# --------------------
class UserOut(BaseModel):
    id: int
    email: str
    role: str
    name: str
    is_superuser: bool
    is_approved_lister: bool = False
    profile_image: str | None = None
    phone_number: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None


class LoginOut(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ------------------------
# --- Password Schemas ---
# ------------------------

class PasswordResetIn(BaseModel):
    email: EmailStr


class PasswordResetOut(BaseModel):
    message: str


class PasswordResetVerifyIn(ValidatePasswordInSchema):
    email: EmailStr
    otp: str


class PasswordResetVerifyOut(BaseModel):
    message: str


class PasswordChangeIn(ValidatePasswordInSchema):
    current_password: str

    @staticmethod
    def examples():
        examples = {
            'openapi_examples': {
                "valid": {
                    "summary": "Valid Password",
                    "description": """For a valid password you should:
* Use numbers _**0-9**_ in the password.
* Use lowercase characters _**a-z**_ in the password.
* Use uppercase characters _**A-Z**_ in the password.
* **Optional:** Use special characters __!?@#$%^&*()+{}[]<>/__ in the password.
                        """,
                    "value": {
                        "current_password": "Password123",
                        "password": "NewPassword123",
                        "password_confirm": "NewPassword123"
                    },
                }
            }}
        return examples


class PasswordChangeOut(BaseModel):
    message: str


# -------------------
# --- OTP Schemas ---
# -------------------

class OTPResendIn(BaseModel):
    request_type: str
    email: EmailStr

    @field_validator("request_type")
    def validate_request_type(cls, value):
        allowed_request_types = {"register", "reset-password", "change-email"}
        if value not in allowed_request_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request type. Allowed values are 'register', 'reset-password', 'change-email'.")
        return value

    @staticmethod
    def examples():
        examples = {
            'openapi_examples': {
                "default": {
                    "summary": "Default",
                    "description": """
- `request_type`: Specifies the purpose of the OTP request. Allowed values are "register", "reset-password", 
  or "change-email".
- `email`: The user's primary email address.
""",
                    "value": {
                        "request_type": "string",
                        "email": "user@example.com"
                    },
                },
                "register": {
                    "summary": "Resend OTP for User Registration",
                    "value": {
                        "request_type": "register",
                        "email": "user@example.com"
                    },
                },
                "reset-password": {
                    "summary": "Resend OTP for Password Reset",
                    "value": {
                        "request_type": "reset-password",
                        "email": "user@example.com"
                    },
                },
                "change-email": {
                    "summary": "Resend OTP for Email Change",
                    "value": {
                        "request_type": "change-email",
                        "email": "user@example.com"
                    },
                },
            }
        }
        return examples


# ----------------------------
# --- Change-Email Schemas ---
# ----------------------------

class EmailChangeIn(BaseModel):
    new_email: EmailStr


class EmailChangeOut(BaseModel):
    message: str


class EmailChangeVerifyIn(BaseModel):
    otp: str


class EmailChangeVerifyOut(BaseModel):
    message: str


# ----------------------
# --- Admin Schemas ---
# ----------------------

class UpdateUserRoleIn(BaseModel):
    role: str
    
    @field_validator("role")
    def validate_role(cls, role: str):
        allowed_roles = ["user", "admin", "hostel", "coaching", "library", "tiffin"]
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f'Invalid role. Must be one of: {", ".join(allowed_roles)}'
            )
        return role


class UpdateUserRoleOut(BaseModel):
    id: int
    email: str
    role: str
    message: str


class UserListItem(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    is_verified_email: bool
    is_approved_lister: bool
    date_joined: str
    
    model_config = ConfigDict(from_attributes=True)
    
    @classmethod
    def from_user(cls, user):
        from apps.core.date_time import DateTime
        return cls(
            id=user.id,
            email=user.email,
            name=f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email,
            role=user.role,
            is_active=user.is_active,
            is_verified_email=user.is_verified_email,
            is_approved_lister=getattr(user, 'is_approved_lister', False),
            date_joined=DateTime.string(user.date_joined)
        )


class UsersListOut(BaseModel):
    users: list[UserListItem]
    total: int


# --------------------
# --- User Schemas ---
# --------------------


class UserSchema(BaseModel):
    user_id: int
    email: EmailStr
    first_name: str | None
    last_name: str | None
    profile_image: str | None = None
    phone_number: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    is_verified_email: bool
    role: str
    is_superuser: bool
    is_approved_lister: bool
    date_joined: str
    updated_at: str
    last_login: str


class CurrentUserOut(BaseModel):
    user: UserSchema


class UpdateUserSchema(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None


class UpdateUserIn(BaseModel):
    user: UpdateUserSchema


# --------------------------
# --- Admin Action Schemas ---
# --------------------------

class ApproveListerIn(BaseModel):
    user_id: int
    approve: bool = True


class ApproveListerOut(BaseModel):
    message: str
    user: UserListItem


class DeleteUserOut(BaseModel):
    message: str


# ----------------------------
# --- Admin User Detail Schemas ---
# ----------------------------

class UserBookingInfo(BaseModel):
    id: int
    listing_id: int
    listing_name: str
    listing_type: str
    status: str
    amount: float
    payment_id: str | None
    enrolled_at: str
    
    model_config = ConfigDict(from_attributes=True)


class UserStats(BaseModel):
    total_bookings: int
    pending_bookings: int
    accepted_bookings: int
    rejected_bookings: int
    total_spent: float
    
    model_config = ConfigDict(from_attributes=True)


class UserDetailOut(BaseModel):
    id: int
    email: str
    first_name: str | None
    last_name: str | None
    phone_number: str | None
    address: str | None
    city: str | None
    state: str | None
    pincode: str | None
    role: str
    is_active: bool
    is_verified_email: bool
    is_superuser: bool
    is_approved_lister: bool
    date_joined: str
    last_login: str | None
    
    # User statistics
    stats: UserStats
    
    # Booking history
    bookings: list[UserBookingInfo]
    
    model_config = ConfigDict(from_attributes=True)
