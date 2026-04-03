"""Meals catalog + daily meal logging."""

import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Meal, MealLog, Medicine, User
from app.schemas import (
    ApiResponse, MealCreate, MealOut, MealLogCreate, MealLogOut,
)
from app.auth import get_current_user
from app.services.ai_tips import get_ai_tips

router = APIRouter(prefix="/api/meals", tags=["Meals"])


# ── GET /api/meals ───────────────────────────────────────────────────────────

@router.get("", response_model=ApiResponse)
async def list_meals(
    period: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    q = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.generated_date == today,
        Meal.is_active == True
    )
    if period:
        q = q.filter(Meal.meal_period == period)
    meals = q.order_by(Meal.meal_period, Meal.name).all()

    # If no meals exist for today, generate them using AI
    if not meals and not period:
        # Get patient's medicines context
        meds = db.query(Medicine).filter(
            Medicine.user_id == current_user.id, Medicine.is_active == True
        ).all()
        med_dicts = [{"name": m.name, "category": m.category} for m in meds]

        from app.services.ai_generator import generate_meals_for_user
        generated_dicts = await generate_meals_for_user(current_user.name, med_dicts)
        
        for m_dict in generated_dicts:
            db_meal = Meal(
                user_id=current_user.id,
                generated_date=today,
                name=m_dict.get("name", "AI Meal"),
                description=m_dict.get("description", ""),
                meal_period=m_dict.get("meal_period", "snacks"),
                kcal=m_dict.get("kcal", 0),
                protein_g=m_dict.get("protein_g", 0),
                carbs_g=m_dict.get("carbs_g", 0),
                fiber_g=m_dict.get("fiber_g", 0),
                image_url=m_dict.get("image_url", "/meals/placeholder.png"),
                tags=json.dumps(m_dict.get("tags", [])) if isinstance(m_dict.get("tags"), list) else m_dict.get("tags", "[]")
            )
            db.add(db_meal)
            meals.append(db_meal)
        
        if generated_dicts:
            db.commit()
            for m in meals:
                db.refresh(m)

    items = [MealOut.model_validate(m).model_dump() for m in meals]

    total_kcal = sum(m.kcal for m in meals)
    total_protein = sum(m.protein_g for m in meals)
    total_carbs = sum(m.carbs_g for m in meals)
    total_fiber = sum(m.fiber_g for m in meals)

    return ApiResponse(data={
        "meals": items,
        "nutrition_summary": {
            "total_kcal": total_kcal,
            "protein_g": total_protein,
            "carbs_g": total_carbs,
            "fiber_g": total_fiber,
        },
    })


# ── GET /api/meals/ai-suggest ────────────────────────────────────────────────

@router.get("/ai-suggest", response_model=ApiResponse)
async def ai_suggest_meals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get AI-personalized meal suggestions based on user's medicines."""
    meds = (
        db.query(Medicine)
        .filter(Medicine.user_id == current_user.id, Medicine.is_active == True)
        .all()
    )
    med_dicts = [{"name": m.name, "category": m.category} for m in meds]
    tips = await get_ai_tips(med_dicts)
    return ApiResponse(data={"suggestions": tips})


# ── POST /api/meals ──────────────────────────────────────────────────────────

@router.post("", response_model=ApiResponse, status_code=201)
def create_meal(
    body: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal = Meal(
        name=body.name,
        description=body.description,
        meal_period=body.meal_period,
        kcal=body.kcal,
        protein_g=body.protein_g,
        carbs_g=body.carbs_g,
        fiber_g=body.fiber_g,
        image_url=body.image_url,
        tags=body.tags,
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return ApiResponse(data=MealOut.model_validate(meal).model_dump())


# ── GET /api/meals/log/today ─────────────────────────────────────────────────

@router.get("/log/today", response_model=ApiResponse)
def meal_log_today(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    logs = (
        db.query(MealLog)
        .options(joinedload(MealLog.meal))
        .filter(MealLog.user_id == current_user.id, MealLog.date == today)
        .order_by(MealLog.logged_at)
        .all()
    )
    items = [MealLogOut.model_validate(log).model_dump() for log in logs]
    total_kcal = sum(log.meal.kcal for log in logs if log.meal)
    return ApiResponse(data={"logs": items, "total_kcal": total_kcal})


# ── POST /api/meals/log ──────────────────────────────────────────────────────

@router.post("/log", response_model=ApiResponse, status_code=201)
def log_meal(
    body: MealLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal = db.query(Meal).filter(Meal.id == body.meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    log = MealLog(
        user_id=current_user.id,
        meal_id=body.meal_id,
        date=date.today(),
        notes=body.notes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return ApiResponse(data=MealLogOut.model_validate(log).model_dump())


# ── DELETE /api/meals/log/{log_id} ───────────────────────────────────────────

@router.delete("/log/{log_id}", response_model=ApiResponse)
def delete_meal_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = (
        db.query(MealLog)
        .filter(MealLog.id == log_id, MealLog.user_id == current_user.id)
        .first()
    )
    if not log:
        raise HTTPException(status_code=404, detail="Meal log not found")

    db.delete(log)
    db.commit()
    return ApiResponse(data={"message": "Meal log deleted"})
