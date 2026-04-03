"""Dynamic generation of personalized Meals and Exercises using Groq LLM."""

import json
import logging
from datetime import date
from typing import Any

from app.config import settings
from app.services.groq_client import chat_completion

logger = logging.getLogger("healthai.ai_generator")


async def generate_meals_for_user(user_name: str, medicines: list[dict]) -> list[dict]:
    """
    Generate exactly 8 personalized meals for the user.
    Returns a list of dicts that match the Meal model/schema.
    """
    med_str = ", ".join(m.get("name", "") for m in medicines) or "None"
    categories = list({m.get("category", "") for m in medicines if m.get("category")})
    cat_str = ", ".join(categories) or "General Health"

    system_prompt = (
        "You are a clinical nutritionist for an elderly care application. "
        "Generate a JSON object containing EXACTLY 8 personalized meal recommendations based on the patient's conditions. "
        "You must provide exactly: 2 breakfast, 2 lunch, 2 snacks, 2 dinner.\n\n"
        "Return ONLY a valid JSON object with a single key 'meals' which is an array of these objects.\n"
        "Each object MUST have the following keys:\n"
        "- name (string)\n"
        "- description (string, short and practical)\n"
        "- meal_period (string: exactly one of 'breakfast', 'lunch', 'snacks', 'dinner')\n"
        "- kcal (integer)\n"
        "- protein_g (integer)\n"
        "- carbs_g (integer)\n"
        "- fiber_g (integer)\n"
        "- image_url (string, MUST be exactly one of: '/meals/idli-chutney.png', '/meals/oats-porridge.png', '/meals/rice-dal.png', '/meals/chapati-sabzi.png', '/meals/fruit-bowl.png', '/meals/dry-fruits.png', '/meals/khichdi.png', '/meals/warm-milk.png' based on best fit)\n"
        "- tags (array of strings, up to 2 items. Allowed tags: diabetes, heart, bp, bone, digestion, immunity, energy, sleep)\n"
    )

    user_prompt = (
        f"Patient: {user_name}. "
        f"Current Medicines: {med_str}. "
        f"Health Conditions: {cat_str}."
    )

    try:
        keys = settings.groq_keys
        if not keys:
            logger.warning("No Groq keys found for meal generation. Returning empty array.")
            return []

        # Try first available key (simple failover)
        for key in keys:
            try:
                raw_response = await chat_completion(
                    api_key=key,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    model="llama-3.1-8b-instant",
                    max_tokens=2048,
                    response_format={"type": "json_object"}
                )
                
                # Clean markdown formatting if model didn't listen
                clean_json = raw_response.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                    
                data = json.loads(clean_json.strip())
                meals = data.get("meals", [])
                if isinstance(meals, list) and len(meals) > 0:
                    return meals
            except Exception as e:
                logger.error("Meal Generation Error with key: %s \nRaw output: %s", e, raw_response)
                continue
                
        return []
    except Exception as e:
        logger.exception("Catastrophic failure in generate_meals_for_user")
        return []


async def generate_exercises_for_user(user_name: str, medicines: list[dict]) -> list[dict]:
    """
    Generate exactly 6 personalized exercises for the user.
    Returns a list of dicts that match the Exercise model/schema.
    """
    med_str = ", ".join(m.get("name", "") for m in medicines) or "None"
    categories = list({m.get("category", "") for m in medicines if m.get("category")})
    cat_str = ", ".join(categories) or "General Health"

    system_prompt = (
        "You are a geriatric physiotherapist for an elderly care application. "
        "Generate a JSON object containing EXACTLY 6 functional exercise recommendations. "
        "Include exactly: 2 warmup, 2 main, 2 cooldown.\n\n"
        "Return ONLY a valid JSON object with a single key 'exercises' which is an array of these objects.\n"
        "Each object MUST have the following keys:\n"
        "- name (string)\n"
        "- description (string, 1 sentence)\n"
        "- category (string: exactly one of 'yoga', 'walking', 'stretching')\n"
        "- phase (string: exactly one of 'warmup', 'main', 'cooldown')\n"
        "- duration_seconds (integer, 30 to 120)\n"
        "- reps (integer or null)\n"
        "- difficulty (string: 'easy' or 'medium')\n"
        "- muscle_group (string)\n"
        "- image_url (string, MUST be exactly one of: '/exercises/ankle-rotation.png', '/exercises/deep-breathing.png', '/exercises/neck-rotation.png', '/exercises/seated-bend.png', '/exercises/shoulder-stretch.png', '/exercises/side-stretch.png' based on best fit)\n"
        "- steps (array of exactly 4 strings explaining the execution steps)\n"
    )

    user_prompt = (
        f"Patient: {user_name}. "
        f"Current Medicines: {med_str}. "
        f"Health Conditions: {cat_str}. Provide safe, elderly-friendly movements."
    )

    try:
        keys = settings.groq_keys
        if not keys:
            return []

        for key in keys:
            try:
                raw_response = await chat_completion(
                    api_key=key,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    model="llama-3.1-8b-instant",
                    max_tokens=2048,
                    response_format={"type": "json_object"}
                )
                
                clean_json = raw_response.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                    
                data = json.loads(clean_json.strip())
                exercises = data.get("exercises", [])
                if isinstance(exercises, list) and len(exercises) > 0:
                    return exercises
            except Exception as e:
                logger.error("Exercise Generation Error with key: %s \nRaw output: %s", e, raw_response)
                continue
                
        return []
    except Exception as e:
        logger.exception("Catastrophic failure in generate_exercises_for_user")
        return []
