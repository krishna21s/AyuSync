"""AI health tips — Groq multi-key failover + rule-based fallback."""

from __future__ import annotations

import logging
import re
from datetime import datetime

from app.config import settings
from app.services.groq_client import (
    chat_completion,
    GroqRateLimitError,
    GroqAuthError,
)

logger = logging.getLogger("healthai.tips")


# ── Groq-powered tips (primary) ─────────────────────────────────────────────

def _build_prompt(medicines: list[dict], hour: int) -> list[dict]:
    med_str = ", ".join(m.get("name", "") for m in medicines) or "no medicines"
    categories = list({m.get("category", "") for m in medicines if m.get("category")})
    cat_str = ", ".join(categories) or "general health"

    return [
        {
            "role": "system",
            "content": (
                "You are a concise health assistant for elderly patients. "
                "Give exactly 3 short, practical health tips (1 sentence each). "
                "Use emojis. Respond ONLY with numbered tips like:\n"
                "1. Tip one 💊\n2. Tip two 🥗\n3. Tip three 🚶"
            ),
        },
        {
            "role": "user",
            "content": (
                f"Patient's medicines: {med_str}. "
                f"Health categories: {cat_str}. "
                f"Current hour: {hour}. "
                f"Give 3 personalized health tips for right now."
            ),
        },
    ]


def _parse_tips(raw: str) -> list[str]:
    """Extract numbered tips from LLM response."""
    lines = [line.strip() for line in raw.strip().split("\n") if line.strip()]
    tips = []
    for line in lines:
        cleaned = re.sub(r"^\d+[\.\)]\s*", "", line).strip()
        if cleaned and len(cleaned) > 5:
            tips.append(cleaned)
    return tips[:3]


async def get_ai_tips(medicines: list[dict], hour: int | None = None) -> list[str]:
    """Try Groq keys in order. Fall back to rule-based on all failures."""
    if hour is None:
        hour = datetime.now().hour

    keys = settings.groq_keys
    if not keys:
        logger.info("No Groq keys configured — using rule-based tips")
        return get_tips(medicines, hour)

    prompt = _build_prompt(medicines, hour)

    for i, key in enumerate(keys, 1):
        try:
            logger.info("Trying Groq key %d/%d …", i, len(keys))
            raw = await chat_completion(key, prompt)
            tips = _parse_tips(raw)
            if tips:
                logger.info("Got %d tips from Groq key %d", len(tips), i)
                return tips
        except GroqRateLimitError:
            logger.warning("Key %d rate-limited, trying next …", i)
            continue
        except GroqAuthError:
            logger.error("Key %d auth failed, skipping to fallback", i)
            break
        except Exception as exc:
            logger.error("Groq key %d unexpected error: %s", i, exc)
            break

    logger.info("All Groq keys exhausted — falling back to rule-based tips")
    return get_tips(medicines, hour)


# ── Rule-based tips (fallback — always succeeds) ────────────────────────────

def get_tips(medicines: list[dict], hour: int | None = None) -> list[str]:
    """Return up to 3 contextual health tips (no external API)."""
    if hour is None:
        hour = datetime.now().hour

    tips: list[str] = []
    med_names_lower = [m.get("name", "").lower() for m in medicines]

    if any("metformin" in n for n in med_names_lower):
        tips.append("Take Metformin after food for better absorption 💊")

    if any("amlodipine" in n for n in med_names_lower):
        tips.append("Take Amlodipine at the same time daily for best results 💊")

    if any("vitamin d" in n for n in med_names_lower):
        tips.append("Take Vitamin D with a fatty meal to boost absorption ☀️")

    if any("calcium" in n for n in med_names_lower):
        tips.append("Space Calcium and Iron supplements 2 hours apart 🦴")

    if 6 <= hour < 10:
        tips.append("Start your morning with a glass of warm water 🌅")

    if 18 <= hour < 22:
        tips.append("Go for a 10-min evening walk today 🚶")

    if hour >= 21 or hour < 5:
        tips.append("Avoid screens 30 minutes before bed for better sleep 🌙")

    sleep_water_tips = [
        "Drink warm water before bed for better sleep 💤",
        "Aim for 7-8 hours of sleep tonight 😴",
        "Stay hydrated — your body needs at least 8 glasses a day 💧",
    ]

    for tip in sleep_water_tips:
        if tip not in tips:
            tips.append(tip)
            break

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
