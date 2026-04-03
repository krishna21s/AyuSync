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

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    avatar_url: Optional[str] = None


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


class DashboardResponse(BaseModel):
    user: UserOut
    next_medicine: Optional[NextMedicine] = None
    water_today: DashboardWater
    activity_today: str
    streak: DashboardStreak
    medicines_summary: DashboardMedicineSummary
    routine_timeline: list[DashboardRoutineItem]
    ai_tips: list[str]
