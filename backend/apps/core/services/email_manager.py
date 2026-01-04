import resend
from apps.accounts.services.token import TokenService
from config.settings import AppConfig

class EmailService:
    """
    Handles all OTP and transactional emails using Resend API.
    """

    app = AppConfig.get_config()

    resend.api_key = app.resend_api_key

    @classmethod
    def send(cls, subject: str, html: str, to: str):
        """
        Generic email sender via Resend.
        """
        try:
            resend.Emails.send({
                "from": f"{cls.app.project_name} <{cls.app.resend_from_email}>",
                "to": [to],
                "subject": subject,
                "html": html
            })
        except Exception as e:
            print("❌ Error sending email:", e)
            raise

    @classmethod
    def register_send_verification_email(cls, to_address: str):
        otp = TokenService.create_otp_token()
        subject = "Email Verification"
        html = f"""
        <p>Thank you for registering!</p>
        <p>Your OTP: <strong>{otp}</strong></p>
        <p>This code expires in 5 minutes.</p>
        """
        cls.send(subject, html, to_address)

    @classmethod
    def reset_password_send_verification_email(cls, to_address: str):
        otp = TokenService.create_otp_token()
        subject = "Password Reset Verification"
        html = f"""
        <p>Use the OTP below to reset your password:</p>
        <p><strong>{otp}</strong></p>
        """
        cls.send(subject, html, to_address)

    @classmethod
    def change_email_send_verification_email(cls, new_email: str):
        otp = TokenService.create_otp_token()
        subject = "Email Change Verification"
        html = f"""
        <p>Use the OTP below to verify your new email address:</p>
        <p><strong>{otp}</strong></p>
        """
        cls.send(subject, html, new_email)
