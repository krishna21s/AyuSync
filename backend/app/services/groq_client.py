"""Lightweight async Groq HTTP client — no SDK required."""

from __future__ import annotations

import logging

import httpx

logger = logging.getLogger("healthai.groq")

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "llama-3.1-8b-instant"


class GroqRateLimitError(Exception):
    """Raised when Groq returns 429 (rate-limited / token quota exceeded)."""


class GroqAuthError(Exception):
    """Raised when Groq returns 401 (invalid API key)."""


async def chat_completion(
    api_key: str,
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    max_tokens: int = 2048,
    temperature: float = 0.7,
    response_format: dict | None = None,
) -> str:
    """Make a single Groq chat completion call.

    Returns the assistant message content string.
    Raises GroqRateLimitError on 429, GroqAuthError on 401.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if response_format:
            payload["response_format"] = response_format

        response = await client.post(
            GROQ_CHAT_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code == 429:
        logger.warning("Groq rate-limit hit (429) for key …%s", api_key[-6:])
        raise GroqRateLimitError(f"Rate-limited: {response.text[:200]}")

    if response.status_code in (401, 403):
        logger.error("Groq auth error (%s) for key …%s", response.status_code, api_key[-6:])
        raise GroqAuthError(f"Auth failed: {response.status_code}")

    response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"]
