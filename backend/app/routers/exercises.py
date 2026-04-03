"""Exercises catalog + daily exercise logging."""

import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Exercise, ExerciseLog, User
from app.schemas import (
    ApiResponse, ExerciseCreate, ExerciseOut,
    ExerciseLogCreate, ExerciseLogOut, ExerciseProgressResponse,
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/exercises", tags=["Exercises"])


# ── GET /api/exercises ───────────────────────────────────────────────────────

@router.get("", response_model=ApiResponse)
async def list_exercises(
    category: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    q = db.query(Exercise).filter(
        Exercise.user_id == current_user.id,
        Exercise.generated_date == today,
        Exercise.is_active == True
    )
    if category and category != "all":
        q = q.filter(Exercise.category == category)
    exercises = q.order_by(Exercise.phase, Exercise.name).all()

    # If no exercises exist for today, generate them using AI
    if not exercises and (not category or category == "all"):
        # Get patient's medicines context
        from app.models import Medicine
        meds = db.query(Medicine).filter(
            Medicine.user_id == current_user.id, Medicine.is_active == True
        ).all()
        med_dicts = [{"name": m.name, "category": m.category} for m in meds]

        from app.services.ai_generator import generate_exercises_for_user
        import json
        generated_dicts = await generate_exercises_for_user(current_user.name, med_dicts)
        
        for e_dict in generated_dicts:
            db_exercise = Exercise(
                user_id=current_user.id,
                generated_date=today,
                name=e_dict.get("name", "AI Exercise"),
                description=e_dict.get("description", ""),
                category=e_dict.get("category", "stretching"),
                phase=e_dict.get("phase", "main"),
                duration_seconds=e_dict.get("duration_seconds", 30),
                reps=e_dict.get("reps"),
                difficulty=e_dict.get("difficulty", "easy"),
                muscle_group=e_dict.get("muscle_group", ""),
                image_url=e_dict.get("image_url", "/exercises/placeholder.png"),
                steps=json.dumps(e_dict.get("steps", [])) if isinstance(e_dict.get("steps"), list) else e_dict.get("steps", "[]")
            )
            db.add(db_exercise)
            exercises.append(db_exercise)
        
        if generated_dicts:
            db.commit()
            for e in exercises:
                db.refresh(e)

    items = [ExerciseOut.model_validate(e).model_dump() for e in exercises]
    return ApiResponse(data={"exercises": items})


# ── POST /api/exercises ──────────────────────────────────────────────────────

@router.post("", response_model=ApiResponse, status_code=201)
def create_exercise(
    body: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exercise = Exercise(
        name=body.name,
        description=body.description,
        category=body.category,
        phase=body.phase,
        duration_seconds=body.duration_seconds,
        reps=body.reps,
        difficulty=body.difficulty,
        muscle_group=body.muscle_group,
        image_url=body.image_url,
        steps=body.steps,
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return ApiResponse(data=ExerciseOut.model_validate(exercise).model_dump())


# ── GET /api/exercises/log/today ─────────────────────────────────────────────

@router.get("/log/today", response_model=ApiResponse)
def exercise_log_today(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    logs = (
        db.query(ExerciseLog)
        .options(joinedload(ExerciseLog.exercise))
        .filter(ExerciseLog.user_id == current_user.id, ExerciseLog.date == today)
        .order_by(ExerciseLog.completed_at)
        .all()
    )
    items = [ExerciseLogOut.model_validate(log).model_dump() for log in logs]
    return ApiResponse(data={"logs": items})


# ── POST /api/exercises/log ──────────────────────────────────────────────────

@router.post("/log", response_model=ApiResponse, status_code=201)
def log_exercise(
    body: ExerciseLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exercise = db.query(Exercise).filter(Exercise.id == body.exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    log = ExerciseLog(
        user_id=current_user.id,
        exercise_id=body.exercise_id,
        date=date.today(),
        duration_seconds=body.duration_seconds or exercise.duration_seconds,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return ApiResponse(data=ExerciseLogOut.model_validate(log).model_dump())


# ── DELETE /api/exercises/log/{log_id} ───────────────────────────────────────

@router.delete("/log/{log_id}", response_model=ApiResponse)
def delete_exercise_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = (
        db.query(ExerciseLog)
        .filter(ExerciseLog.id == log_id, ExerciseLog.user_id == current_user.id)
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="Exercise log not found")

    db.delete(log)
    db.commit()
    return ApiResponse(data={"message": "Exercise log deleted"})


# ── GET /api/exercises/progress ──────────────────────────────────────────────

@router.get("/progress", response_model=ApiResponse)
def exercise_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    total_exercises = db.query(Exercise).filter(Exercise.is_active == True).count()
    completed_logs = (
        db.query(ExerciseLog)
        .filter(ExerciseLog.user_id == current_user.id, ExerciseLog.date == today)
        .all()
    )
    completed = len(completed_logs)
    duration_done = sum(log.duration_seconds for log in completed_logs)

    all_exercises = db.query(Exercise).filter(Exercise.is_active == True).all()
    duration_total = sum(e.duration_seconds for e in all_exercises)

    progress_pct = int((completed / total_exercises) * 100) if total_exercises > 0 else 0

    payload = ExerciseProgressResponse(
        completed=completed,
        total=total_exercises,
        progress_pct=progress_pct,
        duration_done=duration_done,
        duration_total=duration_total,
    )
    return ApiResponse(data=payload.model_dump())
