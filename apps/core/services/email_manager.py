import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from apps.accounts.services.token import TokenService
from config.settings import AppConfig


class EmailService:
    """
    Handles all OTP and transactional emails using SMTP (Hostinger).
    """

    app = AppConfig.get_config()

    @classmethod
    def send(cls, subject: str, html: str, to: str):
        """
        Generic email sender via SMTP.
        """
        if cls.app.use_local_fallback:
            print("📧 [LOCAL EMAIL FALLBACK]")
            print("To:", to)
            print("Subject:", subject)
            print("Body:", html)
            return

        if not all([
            cls.app.smtp_server,
            cls.app.smtp_username,
            cls.app.smtp_password,
            cls.app.smtp_from_email
        ]):
            print("❌ SMTP Configuration Check:")
            print(f"  smtp_server: {cls.app.smtp_server}")
            print(f"  smtp_port: {cls.app.smtp_port}")
            print(f"  smtp_username: {cls.app.smtp_username}")
            print(f"  smtp_password: {'SET' if cls.app.smtp_password else 'NOT SET'}")
            print(f"  smtp_from_email: {cls.app.smtp_from_email}")
            raise RuntimeError("SMTP is not properly configured")

        # Debug: Show config (without full password)
        print(f"📧 SMTP Config: server={cls.app.smtp_server}, port={cls.app.smtp_port}, username={cls.app.smtp_username}, from={cls.app.smtp_from_email}")
        print(f"📧 Password length: {len(cls.app.smtp_password) if cls.app.smtp_password else 0} chars")

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{cls.app.project_name} <{cls.app.smtp_from_email}>"
            msg["To"] = to

            msg.attach(MIMEText(html, "html"))

            # Try SMTP with STARTTLS (port 587) or SSL (port 465)
            if cls.app.smtp_port == 465:
                # Use SMTP_SSL for port 465
                with smtplib.SMTP_SSL(cls.app.smtp_server, cls.app.smtp_port) as server:
                    server.login(
                        cls.app.smtp_username,
                        cls.app.smtp_password
                    )
                    server.sendmail(
                        cls.app.smtp_from_email,
                        to,
                        msg.as_string()
                    )
            else:
                # Use STARTTLS for port 587
                with smtplib.SMTP(cls.app.smtp_server, cls.app.smtp_port, timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(
                        cls.app.smtp_username,
                        cls.app.smtp_password
                    )
                    server.sendmail(
                        cls.app.smtp_from_email,
                        to,
                        msg.as_string()
                    )

        except Exception as e:
            print("❌ Error sending email:", e)
            raise

    # ---------------- OTP Emails ---------------- #

    @classmethod
    def register_send_verification_email(cls, to_address: str):
        otp = TokenService.create_otp_token()

        subject = "Email Verification"
        html = f"""
        <p>Thank you for registering!</p>
        <p>Your OTP to signup on skstudentpath is:</p>
        <h2>{otp}</h2>
        <p>This code expires in 5 minutes.</p>
        """

        cls.send(subject, html, to_address)

    @classmethod
    def reset_password_send_verification_email(cls, to_address: str):
        otp = TokenService.create_otp_token()

        subject = "Password Reset Verification"
        html = f"""
        <p>You requested a password reset.</p>
        <p>Your OTP is:</p>
        <h2>{otp}</h2>
        <p>This code expires in 5 minutes.</p>
        """

        cls.send(subject, html, to_address)

    @classmethod
    def change_email_send_verification_email(cls, new_email: str):
        otp = TokenService.create_otp_token()

        subject = "Email Change Verification"
        html = f"""
        <p>You requested to change your email address.</p>
        <p>Your OTP is:</p>
        <h2>{otp}</h2>
        <p>This code expires in 5 minutes.</p>
        """

        cls.send(subject, html, new_email)
