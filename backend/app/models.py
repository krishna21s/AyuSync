from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Text,
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

    medicines = relationship("Medicine", back_populates="user")
    dose_logs = relationship("DoseLog", back_populates="user")
    routine_tasks = relationship("RoutineTask", back_populates="user")
    routine_logs = relationship("RoutineLog", back_populates="user")
    water_logs = relationship("WaterLog", back_populates="user")


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
    status = Column(String(20), default="upcoming")           # taken|missed|upcoming|done
    taken_at = Column(DateTime, nullable=True)
    date = Column(Date, nullable=False)

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
