"""APScheduler background jobs — daily log generation & missed dose marking."""

import logging
from datetime import datetime, date, timedelta, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Medicine, DoseLog, RoutineTask, RoutineLog, WaterLog, User

logger = logging.getLogger("healthai.scheduler")


def _get_db() -> Session:
    return SessionLocal()


# ── Job 1: generate daily logs at 00:01 ─────────────────────────────────────

def generate_daily_logs() -> None:
    """Create today's DoseLog, RoutineLog, and WaterLog for every active entity."""
    db = _get_db()
    try:
        today = date.today()
        logger.info("Generating daily logs for %s", today)

        # --- dose logs for active medicines ---
        medicines = db.query(Medicine).filter(Medicine.is_active == True).all()
        for med in medicines:
            existing = (
                db.query(DoseLog)
                .filter(
                    DoseLog.medicine_id == med.id,
                    DoseLog.date == today,
                )
                .first()
            )
            if existing:
                continue

            hour, minute = map(int, med.scheduled_time.split(":"))
            scheduled_dt = datetime(today.year, today.month, today.day, hour, minute)

            db.add(DoseLog(
                medicine_id=med.id,
                user_id=med.user_id,
                scheduled_for=scheduled_dt,
                status="upcoming",
                date=today,
            ))

        # --- routine logs ---
        tasks = db.query(RoutineTask).filter(RoutineTask.is_active == True).all()
        for task in tasks:
            existing = (
                db.query(RoutineLog)
                .filter(
                    RoutineLog.task_id == task.id,
                    RoutineLog.date == today,
                )
                .first()
            )
            if existing:
                continue

            db.add(RoutineLog(
                task_id=task.id,
                user_id=task.user_id,
                date=today,
                is_completed=False,
            ))

        # --- water logs ---
        users = db.query(User).all()
        for user in users:
            existing = (
                db.query(WaterLog)
                .filter(
                    WaterLog.user_id == user.id,
                    WaterLog.date == today,
                )
                .first()
            )
            if existing:
                continue

            db.add(WaterLog(
                user_id=user.id,
                date=today,
                glasses_count=0,
                daily_goal=8,
            ))

        db.commit()
        logger.info("Daily logs generated successfully.")
    except Exception:
        db.rollback()
        logger.exception("Failed to generate daily logs")
    finally:
        db.close()


# ── Job 2: mark missed doses every 15 min ───────────────────────────────────

def mark_missed_doses() -> None:
    """Mark upcoming doses whose scheduled time passed >15 minutes ago as missed."""
    db = _get_db()
    try:
        now = datetime.now()
        cutoff = now - timedelta(minutes=15)

        overdue = (
            db.query(DoseLog)
            .filter(
                DoseLog.status == "upcoming",
                DoseLog.scheduled_for < cutoff,
            )
            .all()
        )
        for dose in overdue:
            dose.status = "missed"
            med = db.query(Medicine).filter(Medicine.id == dose.medicine_id).first()
            if med:
                med.missed_count = (med.missed_count or 0) + 1

        db.commit()
        if overdue:
            logger.info("Marked %d doses as missed.", len(overdue))
    except Exception:
        db.rollback()
        logger.exception("Failed to mark missed doses")
    finally:
        db.close()


# ── Scheduler setup ──────────────────────────────────────────────────────────

scheduler = BackgroundScheduler()


def start_scheduler() -> None:
    scheduler.add_job(generate_daily_logs, "cron", hour=0, minute=1, id="daily_logs", replace_existing=True)
    scheduler.add_job(mark_missed_doses, "interval", minutes=15, id="missed_doses", replace_existing=True)
    scheduler.start()
    logger.info("APScheduler started.")

    # Run daily log generation on startup to ensure today's logs exist
    generate_daily_logs()


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("APScheduler stopped.")
