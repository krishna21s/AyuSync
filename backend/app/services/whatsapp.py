"""
Twilio WhatsApp messaging service.

NOTE (Sandbox): Both sender and recipient must have opted into the Twilio
WhatsApp sandbox by sending "join route-fresh" to +1 415 523 8886 before
messages can be delivered. This restriction is lifted on a production
WhatsApp Business account.
"""

from __future__ import annotations

import logging
from typing import Optional

from app.config import settings

logger = logging.getLogger("healthai.whatsapp")


def _get_client():
    """Lazy-import Twilio so the app starts even if twilio is not installed."""
    if not settings.twilio_configured:
        return None
    try:
        from twilio.rest import Client  # type: ignore
        return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    except ImportError:
        logger.error("Twilio library not installed. Run: pip install twilio")
        return None


def _fmt_phone(phone: str) -> str:
    """Ensure WhatsApp prefix."""
    if not phone.startswith("whatsapp:"):
        return f"whatsapp:{phone}"
    return phone


def send_message(to: str, body: str) -> bool:
    """
    Send a WhatsApp message via Twilio.
    Returns True on success, False on failure (never raises).
    """
    client = _get_client()
    if not client:
        logger.warning("Twilio not configured — skipping WhatsApp to %s", to)
        return False
    try:
        msg = client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=_fmt_phone(to),
            body=body,
        )
        logger.info("WhatsApp sent to %s — SID %s", to, msg.sid)
        return True
    except Exception as exc:
        logger.error("WhatsApp send failed to %s: %s", to, exc)
        return False


# ── Typed convenience senders ────────────────────────────────────────────────

def send_otp(phone: str, code: str) -> bool:
    body = (
        f"🔐 *AyuSync Login Verification*\n\n"
        f"Your OTP is: *{code}*\n"
        f"Valid for 10 minutes. Do not share this with anyone.\n\n"
        f"_If you did not request this, please ignore._"
    )
    return send_message(phone, body)


def send_medicine_reminder(phone: str, med_name: str, dosage: str, scheduled_time: str) -> bool:
    body = (
        f"💊 *AyuSync Medication Reminder*\n\n"
        f"Time to take your medicine!\n"
        f"• Medicine: *{med_name} {dosage}*\n"
        f"• Scheduled: {scheduled_time}\n\n"
        f"Please take it now and stay healthy! 🌿"
    )
    return send_message(phone, body)


def send_caretaker_alert(
    caretaker_phone: str,
    user_name: str,
    event_type: str,          # "medicine_missed" | "routine_missed"
    event_detail: str,        # e.g. "Metformin 500mg (8:00 AM)"
    snapshot: dict,           # {"medicines": "2/3", "routine": "4/6", ...}
) -> bool:
    icon = "💊" if event_type == "medicine_missed" else "🏃"
    label = "Missed tablet" if event_type == "medicine_missed" else "Missed routine task"

    med_status = snapshot.get("medicines", "N/A")
    routine_status = snapshot.get("routine", "N/A")
    water_status = snapshot.get("water", "N/A")

    body = (
        f"⚠️ *AyuSync Alert — {user_name}*\n\n"
        f"{icon} *{label}:* {event_detail}\n\n"
        f"📊 *Today's Snapshot:*\n"
        f"💊 Tablets: {med_status}\n"
        f"✅ Routine: {routine_status} tasks\n"
        f"💧 Water: {water_status}\n\n"
        f"_Please check on {user_name}._"
    )
    return send_message(caretaker_phone, body)


def send_daily_report(
    caretaker_phone: str,
    user_name: str,
    report: dict,
) -> bool:
    """
    report keys: medicines_taken, medicines_total, routine_done, routine_total,
                 water_glasses, water_goal, meals_logged, missed_items (list[str])
    """
    taken = report.get("medicines_taken", 0)
    total = report.get("medicines_total", 0)
    r_done = report.get("routine_done", 0)
    r_total = report.get("routine_total", 0)
    water = report.get("water_glasses", 0)
    goal = report.get("water_goal", 8)
    meals = report.get("meals_logged", 0)
    missed = report.get("missed_items", [])

    med_icon = "✔️" if taken == total else "⚠️"
    routine_icon = "✔️" if r_done == r_total else "⚠️"
    water_icon = "✔️" if water >= goal else "⚠️"

    missed_text = ""
    if missed:
        missed_text = "\n⚠️ *Missed:*\n" + "\n".join(f"  ✘ {m}" for m in missed)

    from datetime import date
    today_str = date.today().strftime("%d %b %Y")

    body = (
        f"📋 *AyuSync Daily Report — {user_name}*\n"
        f"📅 {today_str}\n\n"
        f"💊 Tablets: {taken}/{total} {med_icon}\n"
        f"🏃 Routine: {r_done}/{r_total} tasks {routine_icon}\n"
        f"💧 Water: {water}/{goal} glasses {water_icon}\n"
        f"🍽️ Meals logged: {meals}"
        f"{missed_text}\n\n"
        f"_Powered by AyuSync Health Assistant_"
    )
    return send_message(caretaker_phone, body)
