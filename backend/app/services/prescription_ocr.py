"""Prescription OCR via Groq vision model."""

from __future__ import annotations

import json
import logging
import re

import httpx

from app.config import settings

logger = logging.getLogger("healthai.ocr")

VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
VISION_MODEL_FALLBACK = "llama-3.2-11b-vision-preview"

SYSTEM_PROMPT = """You are a medical prescription OCR assistant.
Extract ALL medicines from the prescription image.
Return ONLY a valid JSON array, no markdown, no explanation.
Each element must have exactly these fields:
  name      (string)  - medicine/drug/brand name as written
  dosage    (string)  - strength e.g. "500mg", "10mg", "1000 IU"
  frequency (string)  - "daily", "twice_daily", "as_needed", "weekly"
  timing    (string)  - "morning", "afternoon", "evening", "night", "morning_evening"
  category  (string)  - e.g. "Diabetes", "Blood Pressure", "Supplement", "Pain Relief", "Antibiotic"
  duration  (string)  - e.g. "15 days", "1 month", or "" if not stated

If you cannot detect any medicines, return an empty array [].
Never include explanations outside the JSON array."""


async def _call_groq_vision(api_key: str, image_b64: str, mime: str = "image/jpeg", model: str = VISION_MODEL) -> str:
    """Post one vision request. Raises httpx.HTTPStatusError on failure."""
    # Vision models: instructions go inside user message, not system role
    payload = {
        "model": model,
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime};base64,{image_b64}"},
                    },
                    {
                        "type": "text",
                        "text": (
                            "You are a medical prescription OCR assistant. "
                            "Extract ALL medicines from this prescription image. "
                            "Return ONLY a valid JSON array with no markdown, no explanation. "
                            "Each element must have: name, dosage, frequency (daily/twice_daily/as_needed), "
                            "timing (morning/afternoon/evening/night), category, duration. "
                            "Example: [{\"name\":\"Metformin\",\"dosage\":\"500mg\",\"frequency\":\"daily\","
                            "\"timing\":\"morning\",\"category\":\"Diabetes\",\"duration\":\"30 days\"}] "
                            "If no medicines found, return []. Return JSON only."
                        ),
                    },
                ],
            },
        ],
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        )
        if not resp.is_success:
            logger.error("Groq vision %s error: %s", resp.status_code, resp.text[:300])
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


def _parse_medicines(raw: str) -> list[dict]:
    """Extract JSON array from LLM response."""
    # Strip any markdown code fences
    raw = re.sub(r"```(?:json)?", "", raw).strip()
    # Find first [...] block
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if not match:
        return []
    try:
        items = json.loads(match.group())
        if not isinstance(items, list):
            return []
        cleaned = []
        for item in items:
            if not isinstance(item, dict) or not item.get("name"):
                continue
            cleaned.append({
                "name": str(item.get("name", "")).strip(),
                "dosage": str(item.get("dosage", "")).strip(),
                "frequency": str(item.get("frequency", "daily")).strip().lower(),
                "timing": str(item.get("timing", "morning")).strip().lower(),
                "category": str(item.get("category", "General")).strip(),
                "duration": str(item.get("duration", "")).strip(),
            })
        return cleaned
    except (json.JSONDecodeError, TypeError):
        return []


async def extract_medicines_from_image(image_b64: str, mime: str = "image/jpeg") -> list[dict]:
    """Try each Groq key in order. Return [] on total failure."""
    keys = settings.groq_keys
    if not keys:
        logger.warning("No Groq keys configured — prescription OCR unavailable")
        return []

    for i, key in enumerate(keys, 1):
        # Try primary vision model first, then fallback
        for model in (VISION_MODEL, VISION_MODEL_FALLBACK):
            try:
                logger.info("Prescription OCR: key %d/%d model=%s", i, len(keys), model)
                raw = await _call_groq_vision(key, image_b64, mime, model)
                meds = _parse_medicines(raw)
                logger.info("OCR key %d model=%s: extracted %d medicines", i, model, len(meds))
                return meds
            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                if status == 429:
                    logger.warning("OCR key %d rate-limited, trying next key …", i)
                    break  # try next key
                if status in (401, 403):
                    logger.error("OCR key %d auth error", i)
                    break
                if status == 400:
                    logger.warning("OCR key %d model %s: 400, trying fallback model", i, model)
                    continue  # try fallback model
                logger.error("OCR key %d HTTP %s", i, status)
                break
            except Exception as exc:
                logger.error("OCR key %d unexpected: %s", i, exc)
                break

    return []
