"""Water intake tracking."""

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WaterLog, User
from app.schemas import ApiResponse, WaterLogOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/water", tags=["Water"])


def _get_or_create_today(db: Session, user_id: int) -> WaterLog:
    today = date.today()
    log = (
        db.query(WaterLog)
        .filter(WaterLog.user_id == user_id, WaterLog.date == today)
        .first()
    )
    if not log:
        log = WaterLog(user_id=user_id, date=today, glasses_count=0, daily_goal=8)
        db.add(log)
        db.commit()
        db.refresh(log)
    return log


@router.get("/today", response_model=ApiResponse)
def water_today(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = _get_or_create_today(db, current_user.id)
    payload = WaterLogOut(
        glasses_count=log.glasses_count,
        daily_goal=log.daily_goal,
        remaining=max(log.daily_goal - log.glasses_count, 0),
    )
    return ApiResponse(data=payload.model_dump())


@router.post("/add", response_model=ApiResponse)
def add_water(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = _get_or_create_today(db, current_user.id)
    if log.glasses_count < log.daily_goal:
        log.glasses_count += 1
        db.commit()
        db.refresh(log)

    payload = WaterLogOut(
        glasses_count=log.glasses_count,
        daily_goal=log.daily_goal,
        remaining=max(log.daily_goal - log.glasses_count, 0),
    )
    return ApiResponse(data=payload.model_dump())
