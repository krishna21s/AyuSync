"""Auth + User profile endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    ApiResponse, RegisterRequest, LoginRequest, AuthResponse,
    UserOut, UserUpdate,
)
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

# ── Auth routes (/api/auth) ──────────────────────────────────────────────────

auth_router = APIRouter(prefix="/api/auth", tags=["Auth"])


@auth_router.post("/register", response_model=ApiResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return ApiResponse(data={
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user).model_dump(),
    })


@auth_router.post("/login", response_model=ApiResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

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

    db.commit()
    db.refresh(current_user)
    return ApiResponse(data=UserOut.model_validate(current_user).model_dump())
