import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, ValidationError

# -------------------------------------------------
# Load .env ONLY for local development
# -------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path)


# -------------------------------------------------
# App Configuration
# -------------------------------------------------
class AppConfig:
    class _AppConfig(BaseModel):
        # ------------------
        # App
        # ------------------
        app_name: str = "sk-mvp"
        project_name: str = "SK Student Path"

        # ------------------
        # Security
        # ------------------
        secret_key: str
        access_token_expire_minutes: int = 30

        # ------------------
        # OTP
        # ------------------
        otp_secret_key: str
        otp_expire_seconds: int = 360

        # ------------------
        # Resend Email
        # ------------------
        resend_api_key: str
        resend_from_email: EmailStr

        # ------------------
        # Fallback / Flags
        # ------------------
        use_local_fallback: bool = False

    try:
        config = _AppConfig(
            # App
            app_name=os.getenv("APP_NAME", "sk-mvp"),
            project_name=os.getenv("PROJECT_NAME", "SK Student Path"),

            # Security
            secret_key=os.getenv("SECRET_KEY") or "",
            access_token_expire_minutes=int(
                os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 30
            ),

            # OTP
            otp_secret_key=os.getenv("OTP_SECRET_KEY") or "",
            otp_expire_seconds=int(os.getenv("OTP_EXPIRE_SECONDS") or 360),

            # Resend
            resend_api_key=os.getenv("RESEND_API_KEY") or "",
            resend_from_email=os.getenv("RESEND_FROM_EMAIL") or "",

            # Flags
            use_local_fallback=os.getenv(
                "USE_LOCAL_FALLBACK", "false"
            ).lower() == "true",
        )
    except ValidationError as e:
        raise RuntimeError(
            f"❌ Invalid or missing environment variables:\n{e}"
        ) from e

    @classmethod
    def get_config(cls) -> _AppConfig:
        return cls.config


# -------------------------------------------------
# Database (REQUIRED)
# -------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "❌ DATABASE_URL not set. "
        "Set it in Render environment variables."
    )


# -------------------------------------------------
# Cloudinary (Optional but Recommended)
# -------------------------------------------------
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")


# -------------------------------------------------
# App Limits
# -------------------------------------------------
MAX_FILE_SIZE_MB = 5
PRODUCTS_LIST_LIMIT = 12


