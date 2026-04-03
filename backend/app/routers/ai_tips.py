"""Standalone AI health tips endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Medicine, User
from app.schemas import ApiResponse
from app.auth import get_current_user
from app.services.ai_tips import get_ai_tips

router = APIRouter(prefix="/api/ai-tips", tags=["AI Tips"])


@router.get("", response_model=ApiResponse)
async def ai_tips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return 3 personalized health tips using Groq (with rule-based fallback)."""
    meds = (
        db.query(Medicine)
        .filter(Medicine.user_id == current_user.id, Medicine.is_active == True)
        .all()
    )
    med_dicts = [{"name": m.name, "category": m.category} for m in meds]
    tips = await get_ai_tips(med_dicts)
    return ApiResponse(data={"tips": tips})
