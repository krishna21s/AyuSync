"""AI Health Risk Predictor — powered by Groq LLM.

Three modular sub-functions:
  1. predict_health_risks      — maps medicines → future risks
  2. suggest_precautions       — food, exercise, yoga advice
  3. recommend_checkups        — medical tests / screenings

All three are bundled into a single `generate_health_risk_report` call
that returns a structured dict the router serialises as JSON.
"""

from __future__ import annotations

import json
import logging

from app.config import settings
from app.services.groq_client import chat_completion

logger = logging.getLogger("healthai.health_risk")

MODEL = "llama-3.1-8b-instant"


# ── helpers ──────────────────────────────────────────────────────────────────

def _clean_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON, returning {} on failure."""
    text = raw.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError as exc:
        logger.error("JSON parse failed: %s | raw=%s", exc, text[:300])
        return {}


async def _call_groq(system_prompt: str, user_prompt: str) -> dict:
    """Try each configured Groq key; return parsed JSON or {}."""
    keys = settings.groq_keys
    if not keys:
        logger.warning("No Groq keys configured for health-risk predictor.")
        return {}

    for key in keys:
        try:
            raw = await chat_completion(
                api_key=key,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                model=MODEL,
                max_tokens=2048,
                response_format={"type": "json_object"},
            )
            result = _clean_json(raw)
            if result:
                return result
        except Exception as exc:
            logger.error("Groq call failed for key …%s: %s", key[-6:], exc)
            continue

    return {}


# ── Module 1: Risk Prediction ─────────────────────────────────────────────────

async def predict_health_risks(user_name: str, medicines: list[dict]) -> list[dict]:
    """
    Input : list of {name, category, dosage, frequency}
    Output: list of {title, severity, description, icon}
    """
    med_str = "; ".join(
        f"{m.get('name', '')} ({m.get('category', '')})" for m in medicines
    ) or "No medicines recorded"

    system_prompt = (
        "You are a clinical pharmacovigilance expert for an elderly care platform. "
        "Analyse the patient's medicine list and identify probable long-term health risks. "
        "Return ONLY a valid JSON object with key 'risks' containing an array. "
        "Each element must have exactly: "
        "title (string, ≤8 words), "
        "severity (string: 'low' | 'medium' | 'high'), "
        "description (string, 1–2 sentences, plain language), "
        "icon (string: one of 'heart', 'brain', 'kidney', 'liver', 'bone', 'eye', 'stomach', 'lung', 'blood', 'nerve'). "
        "Return 3–5 risks. Be specific to the medicines listed."
    )
    user_prompt = (
        f"Patient name: {user_name}. "
        f"Current medications: {med_str}. "
        "Identify the most likely long-term health risks from prolonged use of these medicines."
    )

    data = await _call_groq(system_prompt, user_prompt)
    risks = data.get("risks", [])
    if isinstance(risks, list) and risks:
        return risks
    # rule-based fallback
    return [
        {
            "title": "General Cardiovascular Monitoring Advised",
            "severity": "medium",
            "description": "Long-term medication use may impact heart health. Regular monitoring is recommended.",
            "icon": "heart",
        }
    ]


# ── Module 2: Precaution Suggestions ─────────────────────────────────────────

async def suggest_precautions(user_name: str, medicines: list[dict]) -> dict:
    """
    Output: {
        food: [{title, tip, avoid (bool)}],
        exercise: [{name, duration, frequency, benefit}],
        yoga: [{name, duration, benefit}]
    }
    """
    med_str = "; ".join(
        f"{m.get('name', '')} ({m.get('category', '')})" for m in medicines
    ) or "No medicines recorded"

    system_prompt = (
        "You are an integrative health coach advising elderly patients. "
        "Based on the patient's medications, return personalised precautionary suggestions as a JSON object with exactly three keys: "
        "'food', 'exercise', 'yoga'. "
        "'food' is an array of objects: {title (string), tip (string, 1 sentence), avoid (boolean)}. 4–6 items. "
        "'exercise' is an array of objects: {name (string), duration (string, e.g. '20 min'), frequency (string, e.g. 'daily'), benefit (string, 1 sentence)}. 3–4 items. "
        "'yoga' is an array of objects: {name (string), duration (string), benefit (string, 1 sentence)}. 3–4 items. "
        "Return ONLY valid JSON."
    )
    user_prompt = (
        f"Patient: {user_name}. Medicines: {med_str}. "
        "Provide practical food guidance, exercise recommendations, and yoga practices."
    )

    data = await _call_groq(system_prompt, user_prompt)
    if data and all(k in data for k in ("food", "exercise", "yoga")):
        return data

    # fallback
    return {
        "food": [
            {"title": "Stay Hydrated", "tip": "Drink at least 8 glasses of water daily to support kidney health.", "avoid": False},
            {"title": "Avoid Grapefruit", "tip": "Grapefruit can interact with many medications.", "avoid": True},
            {"title": "Low-Sodium Diet", "tip": "Reduce sodium intake to maintain healthy blood pressure.", "avoid": False},
        ],
        "exercise": [
            {"name": "Walking", "duration": "30 min", "frequency": "daily", "benefit": "Improves cardiovascular health and mood."},
            {"name": "Light Stretching", "duration": "15 min", "frequency": "daily", "benefit": "Maintains joint flexibility and reduces stiffness."},
        ],
        "yoga": [
            {"name": "Pranayama (Deep Breathing)", "duration": "10 min", "benefit": "Reduces stress and improves oxygen circulation."},
            {"name": "Viparita Karani (Legs-Up-the-Wall)", "duration": "5 min", "benefit": "Eases fatigue and promotes venous return."},
        ],
    }


# ── Module 3: Checkup Recommendations ───────────────────────────────────────

async def recommend_checkups(user_name: str, medicines: list[dict]) -> list[dict]:
    """
    Output: list of {test, reason, frequency, urgency ('routine'|'soon'|'urgent'), icon}
    """
    med_str = "; ".join(
        f"{m.get('name', '')} ({m.get('category', '')})" for m in medicines
    ) or "No medicines recorded"

    system_prompt = (
        "You are a preventive medicine specialist for elderly patients. "
        "Based on the patient's medication list, recommend essential medical checkups and laboratory tests. "
        "Return ONLY valid JSON with key 'checkups' as an array. "
        "Each element: "
        "test (string, test/checkup name), "
        "reason (string, 1 sentence why it's needed), "
        "frequency (string, e.g. 'Every 3 months'), "
        "urgency (string: 'routine' | 'soon' | 'urgent'), "
        "icon (string: one of 'flask', 'heart', 'scan', 'eye', 'bone', 'blood', 'kidney', 'liver'). "
        "Return 4–6 checkups."
    )
    user_prompt = (
        f"Patient: {user_name}. Medicines: {med_str}. "
        "List the most important medical tests and screenings for early detection of side effects and disease progression."
    )

    data = await _call_groq(system_prompt, user_prompt)
    checkups = data.get("checkups", [])
    if isinstance(checkups, list) and checkups:
        return checkups

    return [
        {"test": "Complete Blood Count (CBC)", "reason": "Monitor overall blood health and detect anaemia.", "frequency": "Every 6 months", "urgency": "routine", "icon": "blood"},
        {"test": "Kidney Function Test (KFT)", "reason": "Many medications are processed by the kidneys.", "frequency": "Every 3 months", "urgency": "soon", "icon": "kidney"},
        {"test": "Liver Function Test (LFT)", "reason": "Assess liver health for patients on long-term medications.", "frequency": "Every 6 months", "urgency": "routine", "icon": "liver"},
    ]


# ── Unified entry point ───────────────────────────────────────────────────────

async def generate_health_risk_report(user_name: str, medicines: list[dict]) -> dict:
    """
    Run all three modules in sequence (sequential to respect rate limits).
    Returns {risks, precautions, checkups, generated_for, medicine_count}.
    """
    risks = await predict_health_risks(user_name, medicines)
    precautions = await suggest_precautions(user_name, medicines)
    checkups = await recommend_checkups(user_name, medicines)

    return {
        "generated_for": user_name,
        "medicine_count": len(medicines),
        "risks": risks,
        "precautions": precautions,
        "checkups": checkups,
    }
