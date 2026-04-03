from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Text, Float,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    language = Column(String(10), default="en")
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Mobile & caretaker
    phone = Column(String(20), unique=True, index=True, nullable=True)      # +91XXXXXXXXXX
    phone_verified = Column(Boolean, default=False)
    caretaker_phone = Column(String(20), nullable=True)                      # caretaker WhatsApp
    report_time = Column(String(5), default="21:00")                         # HH:MM for daily report

    medicines = relationship("Medicine", back_populates="user")
    dose_logs = relationship("DoseLog", back_populates="user")
    routine_tasks = relationship("RoutineTask", back_populates="user")
    routine_logs = relationship("RoutineLog", back_populates="user")
    water_logs = relationship("WaterLog", back_populates="user")
    meal_logs = relationship("MealLog", back_populates="user")
    exercise_logs = relationship("ExerciseLog", back_populates="user")
    meals = relationship("Meal", back_populates="user")
    exercises = relationship("Exercise", back_populates="user")


class OTPRecord(Base):
    """Stores OTP codes for phone-based login verification."""
    __tablename__ = "otp_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone = Column(String(20), nullable=False, index=True)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)
    scheduled_time = Column(String(10), nullable=False)      # "08:00"
    category = Column(String(100), nullable=False)            # "Diabetes", etc.
    frequency = Column(String(50), nullable=False)            # once/twice/thrice_daily
    is_active = Column(Boolean, default=True)
    missed_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="medicines")
    dose_logs = relationship("DoseLog", back_populates="medicine")


class DoseLog(Base):
    __tablename__ = "dose_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheduled_for = Column(DateTime, nullable=False)
    status = Column(String(20), default="upcoming")           # taken|missed|upcoming
    taken_at = Column(DateTime, nullable=True)
    date = Column(Date, nullable=False)
    reminder_sent = Column(Boolean, default=False)            # WhatsApp reminder flag

    medicine = relationship("Medicine", back_populates="dose_logs")
    user = relationship("User", back_populates="dose_logs")


class RoutineTask(Base):
    __tablename__ = "routine_tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    scheduled_time = Column(String(10), nullable=False)       # "06:00"
    period = Column(String(20), nullable=False)               # morning|afternoon|evening|night
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)

    user = relationship("User", back_populates="routine_tasks")
    routine_logs = relationship("RoutineLog", back_populates="task")


class RoutineLog(Base):
    __tablename__ = "routine_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("routine_tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    task = relationship("RoutineTask", back_populates="routine_logs")
    user = relationship("User", back_populates="routine_logs")


class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    glasses_count = Column(Integer, default=0)
    daily_goal = Column(Integer, default=8)

    user = relationship("User", back_populates="water_logs")


# ── Meals ────────────────────────────────────────────────────────────────────

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    generated_date = Column(Date, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    meal_period = Column(String(20), nullable=False)          # breakfast|lunch|snacks|dinner
    kcal = Column(Integer, default=0)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    fiber_g = Column(Float, default=0.0)
    image_url = Column(String(500), nullable=True)
    tags = Column(Text, nullable=True)                        # JSON string: '["diabetes","heart"]'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="meals")
    meal_logs = relationship("MealLog", back_populates="meal")


class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=False)
    date = Column(Date, nullable=False)
    logged_at = Column(DateTime, default=func.now())
    notes = Column(String(500), nullable=True)

    user = relationship("User", back_populates="meal_logs")
    meal = relationship("Meal", back_populates="meal_logs")


# ── Exercises ────────────────────────────────────────────────────────────────

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    generated_date = Column(Date, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    category = Column(String(50), nullable=False)             # yoga|walking|stretching
    phase = Column(String(20), nullable=False)                # warmup|main|cooldown
    duration_seconds = Column(Integer, default=30)
    reps = Column(Integer, nullable=True)
    difficulty = Column(String(20), default="easy")           # easy|medium
    muscle_group = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    steps = Column(Text, nullable=True)                       # JSON string
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="exercises")
    exercise_logs = relationship("ExerciseLog", back_populates="exercise")


class ExerciseLog(Base):
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    date = Column(Date, nullable=False)
    completed_at = Column(DateTime, default=func.now())
    duration_seconds = Column(Integer, default=0)

    user = relationship("User", back_populates="exercise_logs")
    exercise = relationship("Exercise", back_populates="exercise_logs")
