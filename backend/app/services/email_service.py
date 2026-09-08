"""
Email service for sending OTP emails via SMTP.
Credentials are read from environment variables — never exposed to frontend.
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import HTTPException
from app.core.config import get_settings

settings = get_settings()


def _build_otp_html(otp: str, full_name: str) -> str:
    """Return a clean HTML email body for the OTP."""
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0"
               style="background:#1a1f2e;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:28px 32px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">
                &#128274; StatIQ Password Reset
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">
                Official Statistical System Capacity Building Portal
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="color:#cbd5e1;font-size:15px;margin:0 0 8px;">
                Hello, <strong style="color:#ffffff;">{full_name}</strong>
              </p>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 28px;">
                We received a request to reset your StatIQ password.
                Use the OTP below to continue. It is valid for <strong style="color:#f8fafc;">10 minutes</strong>
                and can only be used once.
              </p>

              <!-- OTP Box -->
              <div style="text-align:center;margin:0 0 28px;">
                <div style="display:inline-block;background:#0f1117;border:2px solid #3b82f6;
                            border-radius:12px;padding:20px 40px;">
                  <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:12px;
                             color:#60a5fa;font-family:monospace;">
                    {otp}
                  </p>
                </div>
              </div>

              <p style="color:#64748b;font-size:13px;margin:0 0 8px;">
                &#9888;&#65039; If you did not request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
              <p style="color:#64748b;font-size:13px;margin:0;">
                For security, never share this OTP with anyone.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.06);
                       padding:16px 32px;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                &copy; StatIQ &mdash; MoSPI Workforce Skill Analytics Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_otp_email(to_email: str, otp: str, full_name: str) -> None:
    """
    Send a password-reset OTP to the given email address.

    Raises:
        HTTPException(503): if SMTP is not configured or email fails to send.
    """
    # Guard: SMTP must be configured
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD or not settings.SMTP_FROM:
        if settings.ENVIRONMENT == "development":
            import logging
            logger = logging.getLogger("uvicorn")
            logger.warning(f"[DEV MODE] SMTP not configured. Password Reset OTP for {to_email}: {otp}")
            print(f"\n=======================================================\n"
                  f" [DEV MODE] Password Reset OTP for {to_email}: {otp}\n"
                  f"=======================================================\n")
            return

        raise HTTPException(
            status_code=503,
            detail="Email service is not configured. Please contact the administrator."
        )

    subject = "StatIQ — Your Password Reset OTP"
    html_body = _build_otp_html(otp, full_name)
    plain_body = (
        f"Hello {full_name},\n\n"
        f"Your StatIQ password reset OTP is: {otp}\n\n"
        f"This OTP is valid for 10 minutes and can only be used once.\n\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"— StatIQ Team"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, to_email, msg.as_string())
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=503,
            detail="Email authentication failed. Please contact the administrator."
        )
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Failed to send OTP email. Please try again later."
        )
