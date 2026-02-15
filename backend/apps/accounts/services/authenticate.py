from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from apps.accounts.models import User
from apps.accounts.services.password import PasswordManager
from apps.accounts.services.token import TokenService
from apps.accounts.services.user import UserManager
from apps.core.date_time import DateTime
from apps.core.services.email_manager import EmailService


class AccountService:

    @classmethod
    async def current_user(cls, token: str = Depends(OAuth2PasswordBearer(tokenUrl="accounts/login"))) -> User:
        user = await TokenService.fetch_user(token)
        return user

    # ----------------
    # --- Register ---
    # ----------------

    @classmethod
    def register(cls, email: str, password: str):
        if UserManager.get_user(email=email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email has already been taken."
            )

        new_user = UserManager.create_user(email=email, password=password)
        TokenService(new_user.id).request_is_register()
        EmailService.register_send_verification_email(new_user.email)

        return {
            'email': new_user.email,
            'message': 'Please check your email for an OTP code to confirm your email address.'
        }

    @classmethod
    def verify_registration(cls, email: str, otp: str):
        user = UserManager.get_user(email=email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        if user.is_verified_email:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="This email is already verified."
            )

        token = TokenService(user=user)
        if not token.validate_otp_token(otp):
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Invalid OTP code. Please double-check and try again."
            )

        UserManager.update_user(
            user.id,
            is_verified_email=True,
            is_active=True,
            last_login=DateTime.now()
        )

        token.reset_otp_token_type()

        return {
            'access_token': token.create_access_token(),
            'message': 'Your email address has been confirmed. Account activated successfully.'
        }

    # -------------
    # --- Login ---
    # -------------

    @classmethod
    def login(cls, email: str, password: str):
        user = cls.authenticate_user(email, password)
        token = TokenService(user)

        if not user:
            raise HTTPException(status_code=401, detail="Incorrect username or password.")

        if not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive account.")

        if not user.is_verified_email:
            raise HTTPException(status_code=403, detail="Unverified email address.")

        UserManager.update_last_login(user.id)

        return {
            "access_token": token.create_access_token(),
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email,
                "is_superuser": bool(user.is_superuser),
                "is_approved_lister": getattr(user, 'is_approved_lister', False),
                "profile_image": user.profile_image,
                "phone_number": user.phone_number,
                "address": user.address,
                "city": user.city,
                "state": user.state,
                "pincode": user.pincode
            }
        }

    @classmethod
    def authenticate_user(cls, email: str, password: str):
        user = UserManager.get_user(email=email)
        if not user:
            return False
        if not PasswordManager.verify_password(password, user.password):
            return False
        return user

    # --------------
    # --- Logout ---
    # --------------

    @classmethod
    def logout(cls, user: User):
        token = TokenService(user)
        token.revoke_access_token()

    # ----------------------
    # --- Reset Password ---
    # ----------------------

    @classmethod
    def reset_password(cls, email: str):
        user = UserManager.get_user(email=email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address."
            )
        
        if not user.is_verified_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not verified. Please verify your email first."
            )

        TokenService(user.id).request_is_reset_password()
        EmailService.reset_password_send_verification_email(user.email)

        return {
            'message': 'Password reset OTP has been sent to your email address.'
        }

    @classmethod
    def verify_reset_password(cls, email: str, otp: str, password: str):
        user = UserManager.get_user(email=email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )

        token = TokenService(user=user)
        if not token.validate_otp_token(otp):
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Invalid OTP code. Please double-check and try again."
            )

        # Update password (update_user handles hashing)
        UserManager.update_user(user.id, password=password)

        token.reset_otp_token_type()

        return {
            'message': 'Your password has been reset successfully. Please login with your new password.'
        }

    # -----------------------
    # --- Change Password ---
    # -----------------------

    @classmethod
    def change_password(cls, user: User, current_password: str, password: str):
        if not PasswordManager.verify_password(current_password, user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect."
            )

        # Update password (update_user handles hashing)
        UserManager.update_user(user.id, password=password)

        # Revoke current token so user needs to login again
        token = TokenService(user)
        token.revoke_access_token()

        return {
            'message': 'Password changed successfully. Please login with your new password.'
        }

    # --------------------
    # --- Change Email ---
    # --------------------

    @classmethod
    def change_email(cls, user: User, new_email: str):
        if UserManager.get_user(email=new_email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email is already in use."
            )

        TokenService(user.id).request_is_change_email(new_email)
        EmailService.change_email_send_verification_email(new_email)

        return {
            'message': 'Verification OTP has been sent to your new email address.'
        }

    @classmethod
    def verify_change_email(cls, user: User, otp: str):
        token = TokenService(user=user)
        if not token.validate_otp_token(otp):
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Invalid OTP code. Please double-check and try again."
            )

        new_email = token.get_new_email()
        if not new_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email change request found."
            )

        UserManager.update_user(user.id, email=new_email)
        token.reset_otp_token_type()

        return {
            'message': 'Email address updated successfully.'
        }

    # -----------------
    # --- Resend OTP ---
    # -----------------

    @classmethod
    def resend_otp(cls, request_type: str, email: str):
        user = UserManager.get_user(email=email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address."
            )

        if request_type == "register":
            if user.is_verified_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is already verified."
                )
            TokenService(user.id).request_is_register()
            EmailService.register_send_verification_email(user.email)
        elif request_type == "reset-password":
            TokenService(user.id).request_is_reset_password()
            EmailService.reset_password_send_verification_email(user.email)
        elif request_type == "change-email":
            token = TokenService(user=user)
            new_email = token.get_new_email()
            if not new_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No email change request found."
                )
            EmailService.change_email_send_verification_email(new_email)
