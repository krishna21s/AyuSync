"""APScheduler background jobs — daily log generation, missed dose marking, WhatsApp alerts."""

import logging
from datetime import datetime, date, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Medicine, DoseLog, RoutineTask, RoutineLog, WaterLog, MealLog, ExerciseLog, User
from app.services import whatsapp

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

        medicines = db.query(Medicine).filter(Medicine.is_active == True).all()
        for med in medicines:
            existing = db.query(DoseLog).filter(
                DoseLog.medicine_id == med.id, DoseLog.date == today
            ).first()
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
                reminder_sent=False,
            ))

        tasks = db.query(RoutineTask).filter(RoutineTask.is_active == True).all()
        for task in tasks:
            existing = db.query(RoutineLog).filter(
                RoutineLog.task_id == task.id, RoutineLog.date == today
            ).first()
            if existing:
                continue
            db.add(RoutineLog(task_id=task.id, user_id=task.user_id, date=today, is_completed=False))

        users = db.query(User).all()
        for user in users:
            existing = db.query(WaterLog).filter(
                WaterLog.user_id == user.id, WaterLog.date == today
            ).first()
            if existing:
                continue
            db.add(WaterLog(user_id=user.id, date=today, glasses_count=0, daily_goal=8))

        db.commit()
        logger.info("Daily logs generated successfully.")
    except Exception:
        db.rollback()
        logger.exception("Failed to generate daily logs")
    finally:
        db.close()


# ── Job 2: mark missed doses + alert caretaker (every 15 min) ───────────────

def mark_missed_doses() -> None:
    """Mark overdue doses as missed and send caretaker WhatsApp alerts."""
    db = _get_db()
    try:
        now = datetime.now()
        cutoff = now - timedelta(minutes=15)
        today = date.today()

        overdue = db.query(DoseLog).filter(
            DoseLog.status == "upcoming",
            DoseLog.scheduled_for < cutoff,
        ).all()

        for dose in overdue:
            dose.status = "missed"
            med = db.query(Medicine).filter(Medicine.id == dose.medicine_id).first()
            if med:
                med.missed_count = (med.missed_count or 0) + 1

                # ── WhatsApp alert to caretaker ──────────────────────────────
                user = db.query(User).filter(User.id == dose.user_id).first()
                if user and user.caretaker_phone:
                    # Build snapshot
                    all_doses = db.query(DoseLog).filter(
                        DoseLog.user_id == user.id, DoseLog.date == today
                    ).all()
                    taken = sum(1 for d in all_doses if d.status == "taken")
                    total = len(all_doses)

                    all_routine = db.query(RoutineLog).filter(
                        RoutineLog.user_id == user.id, RoutineLog.date == today
                    ).all()
                    r_done = sum(1 for r in all_routine if r.is_completed)
                    r_total = len(all_routine)

                    water_log = db.query(WaterLog).filter(
                        WaterLog.user_id == user.id, WaterLog.date == today
                    ).first()
                    water = water_log.glasses_count if water_log else 0
                    goal = water_log.daily_goal if water_log else 8

                    sched_time = dose.scheduled_for.strftime("%I:%M %p")
                    whatsapp.send_caretaker_alert(
                        caretaker_phone=user.caretaker_phone,
                        user_name=user.name,
                        event_type="medicine_missed",
                        event_detail=f"{med.name} {med.dosage} (scheduled {sched_time})",
                        snapshot={
                            "medicines": f"{taken}/{total}",
                            "routine": f"{r_done}/{r_total}",
                            "water": f"{water}/{goal} glasses",
                        },
                    )

                # ── WhatsApp reminder to user (for missed, send urgent note) ─
                if user and user.phone and user.phone_verified:
                    sched_time = dose.scheduled_for.strftime("%I:%M %p")
                    whatsapp.send_message(
                        user.phone,
                        f"⚠️ *Missed Medication Alert*\n\n"
                        f"You missed your *{med.name} {med.dosage}* (scheduled {sched_time}).\n"
                        f"Please take it now if still appropriate, or consult your doctor. 🩺"
                    )

        db.commit()
        if overdue:
            logger.info("Marked %d doses as missed.", len(overdue))
    except Exception:
        db.rollback()
        logger.exception("Failed to mark missed doses")
    finally:
        db.close()


# ── Job 3: send medicine reminders 1 min before (every 1 min) ───────────────

def send_medicine_reminders() -> None:
    """WhatsApp reminder to user ~1 min before scheduled dose."""
    db = _get_db()
    try:
        now = datetime.now()
        # Window: doses scheduled in next 2 minutes that haven't been reminded yet
        window_end = now + timedelta(minutes=2)

        upcoming = db.query(DoseLog).filter(
            DoseLog.status == "upcoming",
            DoseLog.scheduled_for >= now,
            DoseLog.scheduled_for <= window_end,
            DoseLog.reminder_sent == False,
        ).all()

        for dose in upcoming:
            user = db.query(User).filter(User.id == dose.user_id).first()
            med = db.query(Medicine).filter(Medicine.id == dose.medicine_id).first()

            if user and user.phone and user.phone_verified and med:
                sched_time = dose.scheduled_for.strftime("%I:%M %p")
                sent = whatsapp.send_medicine_reminder(
                    phone=user.phone,
                    med_name=med.name,
                    dosage=med.dosage,
                    scheduled_time=sched_time,
                )
                if sent:
                    dose.reminder_sent = True

        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to send medicine reminders")
    finally:
        db.close()


# ── Job 4: daily caretaker report (configurable per user, check every 5 min) ─

def send_daily_reports() -> None:
    """Check each user's report_time and send daily WhatsApp report to caretaker."""
    db = _get_db()
    try:
        now = datetime.now()
        today = date.today()
        current_time = now.strftime("%H:%M")

        # Find users whose report_time matches current HH:MM
        users = db.query(User).filter(
            User.caretaker_phone.isnot(None),
            User.report_time == current_time,
        ).all()

        for user in users:
            # Aggregate today's data
            doses = db.query(DoseLog).filter(
                DoseLog.user_id == user.id, DoseLog.date == today
            ).all()
            taken = sum(1 for d in doses if d.status == "taken")
            total_doses = len(doses)
            missed_meds = [
                f"{db.query(Medicine).get(d.medicine_id).name} ({d.scheduled_for.strftime('%I:%M %p')})"
                for d in doses if d.status == "missed"
                if db.query(Medicine).get(d.medicine_id)
            ]

            routine_logs = db.query(RoutineLog).filter(
                RoutineLog.user_id == user.id, RoutineLog.date == today
            ).all()
            r_done = sum(1 for r in routine_logs if r.is_completed)
            r_total = len(routine_logs)
            missed_tasks = []
            for rlog in routine_logs:
                if not rlog.is_completed:
                    task = db.query(RoutineTask).get(rlog.task_id)
                    if task:
                        missed_tasks.append(task.name)

            water_log = db.query(WaterLog).filter(
                WaterLog.user_id == user.id, WaterLog.date == today
            ).first()
            water = water_log.glasses_count if water_log else 0
            goal = water_log.daily_goal if water_log else 8

            meals = db.query(MealLog).filter(
                MealLog.user_id == user.id, MealLog.date == today
            ).count()

            missed_all = [f"💊 {m}" for m in missed_meds] + [f"🏃 {t}" for t in missed_tasks]

            whatsapp.send_daily_report(
                caretaker_phone=user.caretaker_phone,
                user_name=user.name,
                report={
                    "medicines_taken": taken,
                    "medicines_total": total_doses,
                    "routine_done": r_done,
                    "routine_total": r_total,
                    "water_glasses": water,
                    "water_goal": goal,
                    "meals_logged": meals,
                    "missed_items": missed_all,
                },
            )
            logger.info("Daily report sent to caretaker of %s", user.name)

    except Exception:
        db.rollback()
        logger.exception("Failed to send daily reports")
    finally:
        db.close()


# ── Scheduler setup ──────────────────────────────────────────────────────────

scheduler = BackgroundScheduler()


def start_scheduler() -> None:
    scheduler.add_job(generate_daily_logs, "cron", hour=0, minute=1, id="daily_logs", replace_existing=True)
    scheduler.add_job(mark_missed_doses, "interval", minutes=15, id="missed_doses", replace_existing=True)
    scheduler.add_job(send_medicine_reminders, "interval", minutes=1, id="med_reminders", replace_existing=True)
    scheduler.add_job(send_daily_reports, "interval", minutes=1, id="daily_reports", replace_existing=True)
    scheduler.start()
    logger.info("APScheduler started (4 jobs: daily_logs, missed_doses, med_reminders, daily_reports).")

    # Bootstrap today's logs immediately
    generate_daily_logs()


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("APScheduler stopped.")
