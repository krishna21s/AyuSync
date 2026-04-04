"""Daily routine tasks + completion toggling."""

from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import RoutineTask, RoutineLog, User
from app.schemas import (
    ApiResponse, RoutineTaskCreate, RoutineTaskUpdate, RoutineTaskOut, RoutineTodayResponse,
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/routine", tags=["Routine"])

PERIOD_ORDER = ["morning", "afternoon", "evening", "night"]


# ── GET /api/routine/today ───────────────────────────────────────────────────

@router.get("/today", response_model=ApiResponse)
def routine_today(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    tasks = (
        db.query(RoutineTask)
        .filter(RoutineTask.user_id == current_user.id, RoutineTask.is_active == True)
        .order_by(RoutineTask.order)
        .all()
    )

    periods: dict[str, list[RoutineTaskOut]] = {p: [] for p in PERIOD_ORDER}
    total = 0
    completed = 0

    for task in tasks:
        log = (
            db.query(RoutineLog)
            .filter(RoutineLog.task_id == task.id, RoutineLog.date == today)
            .first()
        )
        is_done = log.is_completed if log else False

        out = RoutineTaskOut(
            id=task.id,
            name=task.name,
            scheduled_time=task.scheduled_time,
            period=task.period,
            is_active=task.is_active,
            order=task.order,
            is_completed=is_done,
        )
        period_key = task.period if task.period in periods else "morning"
        periods[period_key].append(out)
        total += 1
        if is_done:
            completed += 1

    progress = int((completed / total) * 100) if total > 0 else 0

    payload = RoutineTodayResponse(
        total_tasks=total,
        completed_tasks=completed,
        progress_percent=progress,
        periods=periods,
    )
    return ApiResponse(data=payload.model_dump())


# ── POST /api/routine/tasks ──────────────────────────────────────────────────

@router.post("/tasks", response_model=ApiResponse, status_code=201)
def create_task(
    body: RoutineTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = RoutineTask(
        user_id=current_user.id,
        name=body.name,
        scheduled_time=body.scheduled_time,
        period=body.period,
        order=body.order,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # create today's log
    today = date.today()
    log = RoutineLog(
        task_id=task.id,
        user_id=current_user.id,
        date=today,
        is_completed=False,
    )
    db.add(log)
    db.commit()

    out = RoutineTaskOut(
        id=task.id,
        name=task.name,
        scheduled_time=task.scheduled_time,
        period=task.period,
        is_active=task.is_active,
        order=task.order,
        is_completed=False,
    )
    return ApiResponse(data=out.model_dump())


# ── PATCH /api/routine/tasks/{task_id} ───────────────────────────────────────

@router.patch("/tasks/{task_id}", response_model=ApiResponse)
def update_task(
    task_id: int,
    body: RoutineTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = (
        db.query(RoutineTask)
        .filter(RoutineTask.id == task_id, RoutineTask.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if body.name is not None:
        task.name = body.name
    if body.scheduled_time is not None:
        task.scheduled_time = body.scheduled_time
    if body.period is not None:
        task.period = body.period
    if body.order is not None:
        task.order = body.order

    db.commit()
    db.refresh(task)

    today = date.today()
    log = (
        db.query(RoutineLog)
        .filter(RoutineLog.task_id == task.id, RoutineLog.date == today)
        .first()
    )

    out = RoutineTaskOut(
        id=task.id,
        name=task.name,
        scheduled_time=task.scheduled_time,
        period=task.period,
        is_active=task.is_active,
        order=task.order,
        is_completed=log.is_completed if log else False,
    )
    return ApiResponse(data=out.model_dump())


# ── DELETE /api/routine/tasks/{task_id} ──────────────────────────────────────

@router.delete("/tasks/{task_id}", response_model=ApiResponse)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = (
        db.query(RoutineTask)
        .filter(RoutineTask.id == task_id, RoutineTask.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_active = False
    db.commit()
    return ApiResponse(data={"message": "Task deleted"})


# ── PATCH /api/routine/tasks/{task_id}/complete ──────────────────────────────

@router.patch("/tasks/{task_id}/complete", response_model=ApiResponse)
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = (
        db.query(RoutineTask)
        .filter(RoutineTask.id == task_id, RoutineTask.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    today = date.today()
    log = (
        db.query(RoutineLog)
        .filter(RoutineLog.task_id == task_id, RoutineLog.date == today)
        .first()
    )
    if not log:
        log = RoutineLog(
            task_id=task_id,
            user_id=current_user.id,
            date=today,
            is_completed=True,
            completed_at=datetime.now(),
        )
        db.add(log)
    else:
        # toggle
        log.is_completed = not log.is_completed
        log.completed_at = datetime.now() if log.is_completed else None

    db.commit()
    db.refresh(log)

    out = RoutineTaskOut(
        id=task.id,
        name=task.name,
        scheduled_time=task.scheduled_time,
        period=task.period,
        is_active=task.is_active,
        order=task.order,
        is_completed=log.is_completed,
    )
    return ApiResponse(data=out.model_dump())
