"""Reports & analytics endpoints."""

from datetime import date, timedelta, datetime
import calendar

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc

from app.database import get_db
from app.models import Medicine, DoseLog, WaterLog, RoutineLog, User
from app.schemas import (
    ApiResponse, ReportSummary, WeeklyAdherenceDay, WaterTrendDay,
    MedicineCategoryItem, MonthlySummary, MonthlyProgressItem,
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

CATEGORY_COLORS = {
    "Diabetes": "#FF6B6B",
    "Blood Pressure": "#4ECDC4",
    "Supplement": "#FFD93D",
    "Antibiotic": "#6BCB77",
    "Painkiller": "#FF8C42",
    "Heart": "#EE4266",
    "Other": "#95AABE",
}


# ── GET /api/reports/summary ─────────────────────────────────────────────────

@router.get("/summary", response_model=ApiResponse)
def report_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()

    # adherence rate — all time
    taken = db.query(DoseLog).filter(
        DoseLog.user_id == current_user.id, DoseLog.status.in_(["taken", "done"])
    ).count()
    missed = db.query(DoseLog).filter(
        DoseLog.user_id == current_user.id, DoseLog.status == "missed"
    ).count()
    total_decided = taken + missed
    adherence = round((taken / total_decided) * 100, 1) if total_decided else 100.0

    # current streak — consecutive days where all doses were taken
    streak = 0
    d = today
    while True:
        day_total = db.query(DoseLog).filter(
            DoseLog.user_id == current_user.id, DoseLog.date == d,
        ).count()
        if day_total == 0:
            break
        day_missed = db.query(DoseLog).filter(
            DoseLog.user_id == current_user.id, DoseLog.date == d, DoseLog.status == "missed",
        ).count()
        if day_missed > 0:
            break
        streak += 1
        d -= timedelta(days=1)

    # medicines today
    today_total = db.query(DoseLog).filter(
        DoseLog.user_id == current_user.id, DoseLog.date == today,
    ).count()
    today_taken = db.query(DoseLog).filter(
        DoseLog.user_id == current_user.id, DoseLog.date == today,
        DoseLog.status.in_(["taken", "done"]),
    ).count()
    medicines_today = f"{today_taken}/{today_total}"

    # avg water last 7 days
    week_ago = today - timedelta(days=7)
    water_rows = (
        db.query(WaterLog.glasses_count)
        .filter(WaterLog.user_id == current_user.id, WaterLog.date >= week_ago)
        .all()
    )
    avg_water = round(sum(r[0] for r in water_rows) / len(water_rows), 1) if water_rows else 0.0

    payload = ReportSummary(
        adherence_rate=adherence,
        current_streak=streak,
        medicines_today=medicines_today,
        avg_water_per_day=avg_water,
    )
    return ApiResponse(data=payload.model_dump())


# ── GET /api/reports/weekly-adherence ────────────────────────────────────────

@router.get("/weekly-adherence", response_model=ApiResponse)
def weekly_adherence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    days: list[WeeklyAdherenceDay] = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_name = d.strftime("%a")  # Mon, Tue …
        t = db.query(DoseLog).filter(
            DoseLog.user_id == current_user.id, DoseLog.date == d, DoseLog.status.in_(["taken", "done"]),
        ).count()
        m = db.query(DoseLog).filter(
            DoseLog.user_id == current_user.id, DoseLog.date == d, DoseLog.status == "missed",
        ).count()
        days.append(WeeklyAdherenceDay(day=day_name, taken=t, missed=m))

    return ApiResponse(data=[d.model_dump() for d in days])


# ── GET /api/reports/water-trend ─────────────────────────────────────────────

@router.get("/water-trend", response_model=ApiResponse)
def water_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    days: list[WaterTrendDay] = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_name = d.strftime("%a")
        log = db.query(WaterLog).filter(
            WaterLog.user_id == current_user.id, WaterLog.date == d,
        ).first()
        glasses = log.glasses_count if log else 0
        days.append(WaterTrendDay(day=day_name, glasses=glasses))

    return ApiResponse(data=[d.model_dump() for d in days])


# ── GET /api/reports/medicine-categories ─────────────────────────────────────

@router.get("/medicine-categories", response_model=ApiResponse)
def medicine_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Medicine.category, sqlfunc.count(Medicine.id))
        .filter(Medicine.user_id == current_user.id, Medicine.is_active == True)
        .group_by(Medicine.category)
        .all()
    )
    items = [
        MedicineCategoryItem(
            category=cat,
            count=cnt,
            color=CATEGORY_COLORS.get(cat, "#95AABE"),
        ).model_dump()
        for cat, cnt in rows
    ]
    return ApiResponse(data=items)


# ── GET /api/reports/monthly-summary ─────────────────────────────────────────

@router.get("/monthly-summary", response_model=ApiResponse)
def monthly_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    first_of_month = today.replace(day=1)
    days_in_month = calendar.monthrange(today.year, today.month)[1]

    # medicines taken this month
    month_taken = db.query(DoseLog).filter(
        DoseLog.user_id == current_user.id,
        DoseLog.date >= first_of_month,
        DoseLog.status.in_(["taken", "done"]),
    ).count()
    month_total = db.query(DoseLog).filter(
        DoseLog.user_id == current_user.id,
        DoseLog.date >= first_of_month,
    ).count()

    # water goal met days
    water_met = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.date >= first_of_month,
        WaterLog.glasses_count >= WaterLog.daily_goal,
    ).count()

    # routine followed days (all tasks completed)
    routine_days = 0
    d = first_of_month
    while d <= today:
        total_tasks = db.query(RoutineLog).filter(
            RoutineLog.user_id == current_user.id, RoutineLog.date == d,
        ).count()
        completed_tasks = db.query(RoutineLog).filter(
            RoutineLog.user_id == current_user.id, RoutineLog.date == d,
            RoutineLog.is_completed == True,
        ).count()
        if total_tasks > 0 and total_tasks == completed_tasks:
            routine_days += 1
        d += timedelta(days=1)

    payload = MonthlySummary(
        medicines_taken=MonthlyProgressItem(value=month_taken, total=month_total),
        water_goal_met=MonthlyProgressItem(value=water_met, total=days_in_month),
        routine_followed=MonthlyProgressItem(value=routine_days, total=days_in_month),
        doctor_visits=MonthlyProgressItem(value=0, total=None),
    )
    return ApiResponse(data=payload.model_dump())
