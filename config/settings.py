import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr

# Load .env from project root
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path)


class AppConfig:
    class _AppConfig(BaseModel):
        # --- App ---
        app_name: str | None = None
        project_name: str | None = None

        # --- Security ---
        secret_key: str | None = None
        access_token_expire_minutes: int = 30

        # --- OTP ---
        otp_secret_key: str | None = None
        otp_expire_seconds: int = 360

        # --- Resend (optional / legacy) ---
        resend_api_key: str | None = None
        resend_from_email: EmailStr | None = None

        # --- SMTP (Hostinger) ---
        smtp_server: str | None = None
        smtp_port: int = 587
        smtp_username: EmailStr | None = None
        smtp_password: str | None = None
        smtp_from_email: EmailStr | None = None
        use_local_fallback: bool = False

    config = _AppConfig(
        # App
        app_name=os.getenv("APP_NAME"),
        project_name=os.getenv("PROJECT_NAME"),

        # Security
        secret_key=os.getenv("SECRET_KEY"),
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 30),

        # OTP
        otp_secret_key=os.getenv("OTP_SECRET_KEY"),
        otp_expire_seconds=int(os.getenv("OTP_EXPIRE_SECONDS") or 360),

        # Resend
        resend_api_key=os.getenv("RESEND_API_KEY"),
        resend_from_email=os.getenv("RESEND_FROM_EMAIL"),

        # SMTP
        smtp_server=os.getenv("SMTP_SERVER"),
        smtp_port=int(os.getenv("SMTP_PORT") or 587),
        smtp_username=os.getenv("SMTP_USERNAME"),
        smtp_password=os.getenv("SMTP_PASSWORD"),
        smtp_from_email=os.getenv("SMTP_FROM_EMAIL"),
        use_local_fallback=os.getenv("USE_LOCAL_FALLBACK", "false").lower() == "true",
    )

    @classmethod
    def get_config(cls) -> _AppConfig:
        return cls.config


# --- Database ---
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL not set. Please set it in your .env or environment before starting the app."
    )


# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")


# --- App limits ---
MAX_FILE_SIZE = 5
products_list_limit = 12


# --- Payments ---
PAYMENT_MODE: str = "mock"  # "mock" | "razorpay"
RAZORPAY_KEY_ID: str | None = None
RAZORPAY_KEY_SECRET: str | None = None
