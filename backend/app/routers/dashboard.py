"""Dashboard — single aggregation endpoint for the home screen."""

from datetime import datetime, date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Medicine, DoseLog, WaterLog, RoutineTask, RoutineLog,
    MealLog, Exercise, ExerciseLog, User,
)
from app.schemas import (
    ApiResponse, DashboardResponse, DashboardWater, DashboardStreak,
    DashboardMedicineSummary, DashboardRoutineItem, MedicineTodayItem,
    MedicineOut, DoseLogOut, NextMedicine, UserOut,
    DashboardMealsToday, DashboardExercisesToday,
)
from app.auth import get_current_user
from app.services.ai_tips import get_ai_tips

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=ApiResponse)
async def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    now = datetime.now()

    # ── user ──
    user_out = UserOut.model_validate(current_user)

    # ── medicines today ──
    meds = (
        db.query(Medicine)
        .filter(Medicine.user_id == current_user.id, Medicine.is_active == True)
        .order_by(Medicine.scheduled_time)
        .all()
    )

    med_items: list[MedicineTodayItem] = []
    taken_count = 0
    next_med: NextMedicine | None = None

    for med in meds:
        dose = (
            db.query(DoseLog)
            .filter(DoseLog.medicine_id == med.id, DoseLog.date == today)
            .first()
        )
        med_out = MedicineOut.model_validate(med)
        med_out.today_status = dose.status if dose else None
        dose_out = DoseLogOut.model_validate(dose) if dose else None
        med_items.append(MedicineTodayItem(medicine=med_out, dose_log=dose_out))

        if dose and dose.status in ("taken", "done"):
            taken_count += 1
        if dose and dose.status == "upcoming" and dose.scheduled_for >= now and next_med is None:
            next_med = NextMedicine(name=med.name, dosage=med.dosage, time=med.scheduled_time)

    medicines_summary = DashboardMedicineSummary(
        taken=taken_count,
        total=len(meds),
        list=med_items,
    )

    # ── water ──
    water_log = (
        db.query(WaterLog)
        .filter(WaterLog.user_id == current_user.id, WaterLog.date == today)
        .first()
    )
    water_today = DashboardWater(
        glasses_count=water_log.glasses_count if water_log else 0,
        daily_goal=water_log.daily_goal if water_log else 8,
    )

    # ── streak ──
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

    streak_data = DashboardStreak(days=streak, goal=30)

    # ── activity today ──
    walk_task = (
        db.query(RoutineTask)
        .filter(
            RoutineTask.user_id == current_user.id,
            RoutineTask.is_active == True,
            RoutineTask.name.ilike("%walk%"),
        )
        .first()
    )
    activity_today = walk_task.name if walk_task else "Stay active today"

    # ── routine timeline ──
    tasks = (
        db.query(RoutineTask)
        .filter(RoutineTask.user_id == current_user.id, RoutineTask.is_active == True)
        .order_by(RoutineTask.order)
        .all()
    )
    timeline: list[DashboardRoutineItem] = []
    for task in tasks:
        log = (
            db.query(RoutineLog)
            .filter(RoutineLog.task_id == task.id, RoutineLog.date == today)
            .first()
        )
        timeline.append(DashboardRoutineItem(
            name=task.name,
            scheduled_time=task.scheduled_time,
            is_completed=log.is_completed if log else False,
        ))

    # ── meals today ──
    meal_logs = (
        db.query(MealLog)
        .filter(MealLog.user_id == current_user.id, MealLog.date == today)
        .all()
    )
    meals_kcal = 0
    for ml in meal_logs:
        if ml.meal:
            meals_kcal += ml.meal.kcal
    meals_today = DashboardMealsToday(
        logged_count=len(meal_logs),
        total_kcal=meals_kcal,
    )

    # ── exercises today ──
    total_exercises = db.query(Exercise).filter(Exercise.is_active == True).count()
    completed_exercises = (
        db.query(ExerciseLog)
        .filter(ExerciseLog.user_id == current_user.id, ExerciseLog.date == today)
        .count()
    )
    ex_pct = int((completed_exercises / total_exercises) * 100) if total_exercises > 0 else 0
    exercises_today = DashboardExercisesToday(
        completed=completed_exercises,
        total=total_exercises,
        progress_pct=ex_pct,
    )

    # ── AI tips (Groq with fallback) ──
    med_dicts = [{"name": m.name, "category": m.category} for m in meds]
    ai_tips = await get_ai_tips(med_dicts, now.hour)

    payload = DashboardResponse(
        user=user_out,
        next_medicine=next_med,
        water_today=water_today,
        activity_today=activity_today,
        streak=streak_data,
        medicines_summary=medicines_summary,
        routine_timeline=timeline,
        ai_tips=ai_tips,
        meals_today=meals_today,
        exercises_today=exercises_today,
    )
    return ApiResponse(data=payload.model_dump())
