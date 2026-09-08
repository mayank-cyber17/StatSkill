import secrets
import string
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User
from app.models.password_reset import PasswordResetOTP
from app.schemas.auth import (
    UserCreate, UserLogin, Token, UserResponse,
    ForgotPasswordRequest, ResendOTPRequest,
    VerifyOTPRequest, ResetPasswordRequest,
)
from app.services.email_service import send_otp_email
import bcrypt

router = APIRouter()

# ── Constants ──────────────────────────────────────────────────────────────────
OTP_EXPIRE_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_MAX_ATTEMPTS = 5


def _generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP."""
    return "".join(secrets.choice(string.digits) for _ in range(6))


def _hash_otp(otp: str) -> str:
    """bcrypt-hash an OTP for safe storage."""
    return bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()


def _verify_otp(plain: str, hashed: str) -> bool:
    """Verify a plain OTP against its stored hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── Existing endpoints ─────────────────────────────────────────────────────────

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "LEARNER"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    access_token = create_access_token(data={"sub": str(current_user.id), "role": current_user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": current_user}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


# ── Forgot Password / OTP endpoints ───────────────────────────────────────────

@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Step 1 — Request a password reset OTP.
    Always returns 200 (no user enumeration — never tell the caller if the
    email exists or not).
    """
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user:
        # Invalidate any previous unused OTPs for this email
        prev_result = await db.execute(
            select(PasswordResetOTP).where(
                PasswordResetOTP.email == body.email,
                PasswordResetOTP.is_used == False,
            )
        )
        for old_otp in prev_result.scalars().all():
            old_otp.is_used = True

        otp = _generate_otp()
        otp_record = PasswordResetOTP(
            user_id=user.id,
            email=body.email,
            otp_hash=_hash_otp(otp),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES),
        )
        db.add(otp_record)
        await db.commit()

        # Send email (raises HTTP 503 if SMTP is misconfigured)
        send_otp_email(to_email=user.email, otp=otp, full_name=user.full_name)

    return {"message": "If this email is registered, an OTP has been sent."}


@router.post("/resend-otp")
async def resend_otp(
    body: ResendOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Resend a fresh OTP for an email address.
    Enforces a 60-second cooldown to prevent abuse.
    """
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        # No user — return generic message to avoid enumeration
        return {"message": "If this email is registered, a new OTP has been sent."}

    # Check cooldown: find most recent OTP for this email
    recent_result = await db.execute(
        select(PasswordResetOTP)
        .where(PasswordResetOTP.email == body.email)
        .order_by(PasswordResetOTP.created_at.desc())
        .limit(1)
    )
    last_otp = recent_result.scalar_one_or_none()
    if last_otp:
        elapsed = (datetime.now(timezone.utc) - last_otp.created_at.replace(tzinfo=timezone.utc)).total_seconds()
        if elapsed < OTP_RESEND_COOLDOWN_SECONDS:
            remaining = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining} seconds before requesting a new OTP."
            )
        # Invalidate old unused OTPs
        if not last_otp.is_used:
            last_otp.is_used = True

    # Issue a fresh OTP
    otp = _generate_otp()
    otp_record = PasswordResetOTP(
        user_id=user.id,
        email=body.email,
        otp_hash=_hash_otp(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES),
    )
    db.add(otp_record)
    await db.commit()

    send_otp_email(to_email=user.email, otp=otp, full_name=user.full_name)
    return {"message": "A new OTP has been sent to your email."}


@router.post("/verify-otp")
async def verify_otp(
    body: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Step 2 — Verify the OTP entered by the user.
    Does NOT consume the OTP (it is consumed in /reset-password).
    """
    otp_record = await _get_valid_otp(body.email, body.otp, db)
    return {"message": "OTP verified successfully."}


@router.post("/reset-password")
async def reset_password(
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Step 3 — Verify OTP + update hashed password.
    Marks the OTP as used after a successful reset.
    """
    otp_record = await _get_valid_otp(body.email, body.otp, db)

    # Update the user's password
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = hash_password(body.new_password)
    otp_record.is_used = True

    await db.commit()
    return {"message": "Password reset successfully. You can now log in with your new password."}


# ── Helper ─────────────────────────────────────────────────────────────────────

async def _get_valid_otp(
    email: str,
    plain_otp: str,
    db: AsyncSession,
) -> PasswordResetOTP:
    """
    Find the most-recent unused, non-expired OTP for the given email and
    verify the plain OTP against its hash.  Tracks attempt_count and locks
    the OTP after OTP_MAX_ATTEMPTS wrong guesses.

    Returns the OTP record on success; raises HTTPException on any failure.
    """
    result = await db.execute(
        select(PasswordResetOTP)
        .where(
            PasswordResetOTP.email == email,
            PasswordResetOTP.is_used == False,
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .limit(1)
    )
    otp_record = result.scalar_one_or_none()

    if not otp_record:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request a new one.")

    # Check expiry
    now = datetime.now(timezone.utc)
    expires = otp_record.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        otp_record.is_used = True
        await db.commit()
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # Check attempt limit
    if otp_record.attempt_count >= OTP_MAX_ATTEMPTS:
        otp_record.is_used = True
        await db.commit()
        raise HTTPException(
            status_code=400,
            detail="Too many incorrect attempts. Please request a new OTP."
        )

    # Verify hash
    if not _verify_otp(plain_otp, otp_record.otp_hash):
        otp_record.attempt_count += 1
        remaining = OTP_MAX_ATTEMPTS - otp_record.attempt_count
        await db.commit()
        raise HTTPException(
            status_code=400,
            detail=f"Incorrect OTP. {remaining} attempt(s) remaining."
        )

    return otp_record
