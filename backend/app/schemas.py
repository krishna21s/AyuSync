"""Pydantic v2 request / response schemas for every endpoint."""

from __future__ import annotations

from datetime import datetime, date
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


# ── Generic response wrapper ─────────────────────────────────────────────────

class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None


# ── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None    # +91XXXXXXXXXX — enables WhatsApp features


class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="Phone with country code, e.g. +919876543210")


class VerifyOTPRequest(BaseModel):
    phone: str
    code: str = Field(..., min_length=6, max_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

    class Config:
        from_attributes = True


# ── User ─────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    language: str
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    phone_verified: bool = False
    caretaker_phone: Optional[str] = None
    report_time: str = "21:00"

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    caretaker_phone: Optional[str] = None
    report_time: Optional[str] = None    # HH:MM


# rebuild forward ref used in AuthResponse
AuthResponse.model_rebuild()


# ── Medicine ─────────────────────────────────────────────────────────────────

class MedicineCreate(BaseModel):
    name: str
    dosage: str
    scheduled_time: str          # "08:00"
    category: str
    frequency: str               # once_daily | twice_daily | thrice_daily
    notes: Optional[str] = None


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    scheduled_time: Optional[str] = None
    category: Optional[str] = None
    frequency: Optional[str] = None


class MedicineOut(BaseModel):
    id: int
    name: str
    dosage: str
    scheduled_time: str
    category: str
    frequency: str
    is_active: bool
    missed_count: int
    created_at: datetime
    today_status: Optional[str] = None   # injected at query time

    class Config:
        from_attributes = True


class MedicineSummary(BaseModel):
    taken: int
    pending: int
    missed: int


class MedicineListResponse(BaseModel):
    medicines: list[MedicineOut]
    summary: MedicineSummary


class NextMedicine(BaseModel):
    name: str
    dosage: str
    time: str


class DoseLogOut(BaseModel):
    id: int
    medicine_id: int
    status: str
    scheduled_for: datetime
    taken_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MedicineTodayItem(BaseModel):
    medicine: MedicineOut
    dose_log: Optional[DoseLogOut] = None


class MedicineTodayResponse(BaseModel):
    doses: list[MedicineTodayItem]
    taken: int
    total: int
    next_medicine: Optional[NextMedicine] = None


# ── Routine ──────────────────────────────────────────────────────────────────

class RoutineTaskCreate(BaseModel):
    name: str
    scheduled_time: str
    period: str                  # morning | afternoon | evening | night
    order: int = 0


class RoutineTaskUpdate(BaseModel):
    name: Optional[str] = None
    scheduled_time: Optional[str] = None
    period: Optional[str] = None
    order: Optional[int] = None


class RoutineTaskOut(BaseModel):
    id: int
    name: str
    scheduled_time: str
    period: str
    is_active: bool
    order: int
    is_completed: bool = False   # injected from RoutineLog

    class Config:
        from_attributes = True


class RoutineTodayResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    progress_percent: int
    periods: dict[str, list[RoutineTaskOut]]


# ── Water ────────────────────────────────────────────────────────────────────

class WaterLogOut(BaseModel):
    glasses_count: int
    daily_goal: int
    remaining: int

    class Config:
        from_attributes = True


class WaterGoalUpdate(BaseModel):
    daily_goal: int = Field(..., ge=1, le=20)


# ── Meals ────────────────────────────────────────────────────────────────────

class MealCreate(BaseModel):
    name: str
    description: Optional[str] = None
    meal_period: str             # breakfast|lunch|snacks|dinner
    kcal: int = 0
    protein_g: float = 0.0
    carbs_g: float = 0.0
    fiber_g: float = 0.0
    image_url: Optional[str] = None
    tags: Optional[str] = None   # JSON string


class MealOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    meal_period: str
    kcal: int
    protein_g: float
    carbs_g: float
    fiber_g: float
    image_url: Optional[str] = None
    tags: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class MealLogCreate(BaseModel):
    meal_id: int
    notes: Optional[str] = None


class MealLogOut(BaseModel):
    id: int
    meal_id: int
    date: date
    logged_at: datetime
    notes: Optional[str] = None
    meal: Optional[MealOut] = None

    class Config:
        from_attributes = True


class MealsByPeriodResponse(BaseModel):
    meals: list[MealOut]
    nutrition_summary: dict       # {total_kcal, protein_g, carbs_g, fiber_g}


# ── Exercises ────────────────────────────────────────────────────────────────

class ExerciseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str                # yoga|walking|stretching
    phase: str                   # warmup|main|cooldown
    duration_seconds: int = 30
    reps: Optional[int] = None
    difficulty: str = "easy"
    muscle_group: Optional[str] = None
    image_url: Optional[str] = None
    steps: Optional[str] = None  # JSON string


class ExerciseOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: str
    phase: str
    duration_seconds: int
    reps: Optional[int] = None
    difficulty: str
    muscle_group: Optional[str] = None
    image_url: Optional[str] = None
    steps: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class ExerciseLogCreate(BaseModel):
    exercise_id: int
    duration_seconds: int = 0


class ExerciseLogOut(BaseModel):
    id: int
    exercise_id: int
    date: date
    completed_at: datetime
    duration_seconds: int
    exercise: Optional[ExerciseOut] = None

    class Config:
        from_attributes = True


class ExerciseProgressResponse(BaseModel):
    completed: int
    total: int
    progress_pct: int
    duration_done: int
    duration_total: int


# ── AI Tips ──────────────────────────────────────────────────────────────────

class AITipsResponse(BaseModel):
    tips: list[str]


# ── Reports ──────────────────────────────────────────────────────────────────

class ReportSummary(BaseModel):
    adherence_rate: float
    current_streak: int
    medicines_today: str         # "4/6"
    avg_water_per_day: float


class WeeklyAdherenceDay(BaseModel):
    day: str
    taken: int
    missed: int


class WaterTrendDay(BaseModel):
    day: str
    glasses: int


class MedicineCategoryItem(BaseModel):
    category: str
    count: int
    color: str


class MonthlyProgressItem(BaseModel):
    value: int
    total: Optional[int] = None


class MonthlySummary(BaseModel):
    medicines_taken: MonthlyProgressItem
    water_goal_met: MonthlyProgressItem
    routine_followed: MonthlyProgressItem
    doctor_visits: MonthlyProgressItem


# ── Dashboard ────────────────────────────────────────────────────────────────

class DashboardWater(BaseModel):
    glasses_count: int
    daily_goal: int


class DashboardStreak(BaseModel):
    days: int
    goal: int


class DashboardMedicineSummary(BaseModel):
    taken: int
    total: int
    list: list[MedicineTodayItem]


class DashboardRoutineItem(BaseModel):
    name: str
    scheduled_time: str
    is_completed: bool


class DashboardMealsToday(BaseModel):
    logged_count: int
    total_kcal: int


class DashboardExercisesToday(BaseModel):
    completed: int
    total: int
    progress_pct: int


class DashboardResponse(BaseModel):
    user: UserOut
    next_medicine: Optional[NextMedicine] = None
    water_today: DashboardWater
    activity_today: str
    streak: DashboardStreak
    medicines_summary: DashboardMedicineSummary
    routine_timeline: list[DashboardRoutineItem]
    ai_tips: list[str]
    meals_today: DashboardMealsToday
    exercises_today: DashboardExercisesToday
