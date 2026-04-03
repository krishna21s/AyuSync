"""Auth + User profile endpoints."""

import random
import string
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, OTPRecord
from app.schemas import (
    ApiResponse, RegisterRequest, SendOTPRequest, VerifyOTPRequest,
    LoginRequest, UserOut, UserUpdate,
)
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.services import whatsapp

router = APIRouter()

# ── Helpers ──────────────────────────────────────────────────────────────────

OTP_EXPIRY_MINUTES = 10


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def _create_and_send_otp(phone: str, db: Session) -> None:
    """Invalidate old OTPs, create a new one, send via WhatsApp."""
    # Expire previous unused OTPs for this phone
    db.query(OTPRecord).filter(
        OTPRecord.phone == phone,
        OTPRecord.used == False,
    ).update({"used": True})

    code = _generate_otp()
    record = OTPRecord(
        phone=phone,
        code=code,
        expires_at=datetime.now() + timedelta(minutes=OTP_EXPIRY_MINUTES),
        used=False,
    )
    db.add(record)
    db.commit()

    sent = whatsapp.send_otp(phone, code)
    if not sent:
        raise HTTPException(
            status_code=503,
            detail="Could not send OTP via WhatsApp. Ensure Twilio is configured and your number has joined the sandbox.",
        )


def _verify_otp_code(phone: str, code: str, db: Session) -> bool:
    """Returns True and marks OTP used if valid, else False."""
    record = (
        db.query(OTPRecord)
        .filter(
            OTPRecord.phone == phone,
            OTPRecord.code == code,
            OTPRecord.used == False,
            OTPRecord.expires_at > datetime.now(),
        )
        .order_by(OTPRecord.created_at.desc())
        .first()
    )
    if not record:
        return False
    record.used = True
    db.commit()
    return True


# ── Auth routes (/api/auth) ──────────────────────────────────────────────────

auth_router = APIRouter(prefix="/api/auth", tags=["Auth"])


@auth_router.post("/register", response_model=ApiResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Step 1 of registration.
    - Creates account with email + password.
    - If phone provided, sends OTP to WhatsApp → must call /verify-otp to activate phone.
    - Returns JWT immediately so the user can use the app right away.
    """
    existing_email = db.query(User).filter(User.email == body.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    if body.phone:
        existing_phone = db.query(User).filter(User.phone == body.phone).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already registered")

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        phone=body.phone,
        phone_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If phone provided, send OTP for verification
    otp_sent = False
    if body.phone:
        try:
            _create_and_send_otp(body.phone, db)
            otp_sent = True
        except HTTPException:
            pass  # OTP send failed — app still usable, just without WhatsApp

    token = create_access_token(user.id)
    return ApiResponse(data={
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user).model_dump(),
        "otp_sent": otp_sent,
        "otp_required": otp_sent,  # frontend should show OTP step
    })


@auth_router.post("/login", response_model=ApiResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Step 1 of login (email + password).
    - Validates credentials.
    - If user has a verified phone → sends OTP → returns otp_required: true (no JWT yet).
    - If no phone → returns JWT directly (fallback for users without phone).
    """
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Mobile-first: if user has a verified phone, require OTP
    if user.phone and user.phone_verified:
        try:
            _create_and_send_otp(user.phone, db)
        except HTTPException as exc:
            raise exc

        return ApiResponse(data={
            "otp_required": True,
            "phone": user.phone,
            "message": f"OTP sent to WhatsApp on {user.phone[-4:].rjust(len(user.phone), '*')}",
        })

    # Fallback: no phone or unverified → issue JWT directly
    token = create_access_token(user.id)
    return ApiResponse(data={
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user).model_dump(),
        "otp_required": False,
    })


@auth_router.post("/send-otp", response_model=ApiResponse)
def send_otp(body: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Send/resend OTP to a phone number.
    Used after registration (to verify phone) or standalone (if user asks to resend).
    """
    user = db.query(User).filter(User.phone == body.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account with that phone number")

    _create_and_send_otp(body.phone, db)
    return ApiResponse(data={"message": "OTP sent via WhatsApp"})


@auth_router.post("/verify-otp", response_model=ApiResponse)
def verify_otp(body: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verify OTP and return JWT.
    Used both after login (primary auth) and after registration (phone verification).
    """
    user = db.query(User).filter(User.phone == body.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account with that phone number")

    valid = _verify_otp_code(body.phone, body.code, db)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Mark phone as verified
    if not user.phone_verified:
        user.phone_verified = True
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id)
    return ApiResponse(data={
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user).model_dump(),
    })


# ── User profile routes (/api/users) ────────────────────────────────────────

user_router = APIRouter(prefix="/api/users", tags=["Users"])


@user_router.get("/me", response_model=ApiResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return ApiResponse(data=UserOut.model_validate(current_user).model_dump())


@user_router.patch("/me", response_model=ApiResponse)
def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.name is not None:
        current_user.name = body.name
    if body.language is not None:
        current_user.language = body.language
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url
    if body.phone is not None:
        # New phone → must re-verify
        existing = db.query(User).filter(
            User.phone == body.phone, User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone already in use")
        current_user.phone = body.phone
        current_user.phone_verified = False
    if body.caretaker_phone is not None:
        current_user.caretaker_phone = body.caretaker_phone if body.caretaker_phone else None
    if body.report_time is not None:
        current_user.report_time = body.report_time

    db.commit()
    db.refresh(current_user)
    return ApiResponse(data=UserOut.model_validate(current_user).model_dump())
