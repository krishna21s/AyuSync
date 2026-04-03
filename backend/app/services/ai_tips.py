"""Pure-Python contextual health tips — no external API required."""

from __future__ import annotations

from datetime import datetime


def get_tips(medicines: list[dict], hour: int | None = None) -> list[str]:
    """Return up to 3 contextual health tips.

    Args:
        medicines: list of dicts with at least a ``name`` key.
        hour: current hour (0-23). Defaults to now.
    """
    if hour is None:
        hour = datetime.now().hour

    tips: list[str] = []
    med_names_lower = [m.get("name", "").lower() for m in medicines]

    # Rule-based tips ─────────────────────────────────────────────────────────

    if any("metformin" in n for n in med_names_lower):
        tips.append("Take Metformin after food for better absorption 💊")

    if any("amlodipine" in n for n in med_names_lower):
        tips.append("Take Amlodipine at the same time daily for best results 💊")

    if any("vitamin d" in n for n in med_names_lower):
        tips.append("Take Vitamin D with a fatty meal to boost absorption ☀️")

    if any("calcium" in n for n in med_names_lower):
        tips.append("Space Calcium and Iron supplements 2 hours apart 🦴")

    # Time-based tips ─────────────────────────────────────────────────────────

    if 6 <= hour < 10:
        tips.append("Start your morning with a glass of warm water 🌅")

    if 18 <= hour < 22:
        tips.append("Go for a 10-min evening walk today 🚶")

    if hour >= 21 or hour < 5:
        tips.append("Avoid screens 30 minutes before bed for better sleep 🌙")

    # Always include a sleep / water tip
    sleep_water_tips = [
        "Drink warm water before bed for better sleep 💤",
        "Aim for 7-8 hours of sleep tonight 😴",
        "Stay hydrated — your body needs at least 8 glasses a day 💧",
    ]

    for tip in sleep_water_tips:
        if tip not in tips:
            tips.append(tip)
            break

    # Fallback defaults
    fallback = [
        "Remember to take deep breaths and stay calm today 🧘",
        "A balanced diet supports your health goals 🥗",
        "Small consistent habits lead to big health improvements 🌟",
    ]

    while len(tips) < 3:
        for fb in fallback:
            if fb not in tips:
                tips.append(fb)
                break
        else:
            break

    return tips[:3]
