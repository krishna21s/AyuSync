"""AI Health Risk Predictor — API router."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Medicine, User
from app.schemas import ApiResponse
from app.services.health_risk import generate_health_risk_report, analyze_organ_impact
from app.services.whatsapp import send_message

logger = logging.getLogger("healthai.health_risk_router")

router = APIRouter(prefix="/api/health-risk", tags=["Health Risk Predictor"])


def _build_whatsapp_text(report: dict) -> str:
    """Compose a WhatsApp-friendly summary of the AI health risk report."""
    name = report.get("generated_for", "User")
    risks = report.get("risks", [])
    precautions = report.get("precautions", {})
    checkups = report.get("checkups", [])

    lines: list[str] = [
        "🧬 *AyuSync — AI Health Risk Report*",
        f"Patient: *{name}*\n",
    ]

    # Risks
    lines.append("⚠️ *Predicted Health Risks:*")
    for r in risks[:4]:
        sev = r.get("severity", "").upper()
        lines.append(f"  • {r.get('title', '')} [{sev}]")
        lines.append(f"    {r.get('description', '')}")

    # Food precautions
    food = precautions.get("food", [])
    if food:
        lines.append("\n🥗 *Dietary Guidance:*")
        for f in food[:4]:
            prefix = "❌ Avoid: " if f.get("avoid") else "✅ "
            lines.append(f"  {prefix}{f.get('title', '')}: {f.get('tip', '')}")

    # Checkups
    if checkups:
        lines.append("\n🔬 *Recommended Tests:*")
        for c in checkups[:4]:
            lines.append(f"  • {c.get('test', '')} — {c.get('frequency', '')}")

    lines.append("\n_Powered by AyuSync AI · Stay healthy! 🌿_")
    return "\n".join(lines)


@router.get("", response_model=ApiResponse)
async def get_health_risk(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a personalised AI health risk report from the user's medicine list."""
    meds = (
        db.query(Medicine)
        .filter(Medicine.user_id == current_user.id, Medicine.is_active)
        .all()
    )
    med_dicts = [
        {
            "name": m.name,
            "dosage": m.dosage,
            "category": m.category,
            "frequency": m.frequency,
        }
        for m in meds
    ]

    report = await generate_health_risk_report(current_user.name, med_dicts)
    return ApiResponse(data=report)


@router.post("/share-whatsapp", response_model=ApiResponse)
async def share_via_whatsapp(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate the health risk report and send it via WhatsApp to the user
    and optionally their caretaker.
    """
    if not current_user.phone:
        raise HTTPException(
            status_code=400,
            detail="No phone number registered. Please update your profile.",
        )

    meds = (
        db.query(Medicine)
        .filter(Medicine.user_id == current_user.id, Medicine.is_active)
        .all()
    )
    med_dicts = [
        {"name": m.name, "dosage": m.dosage, "category": m.category, "frequency": m.frequency}
        for m in meds
    ]

    report = await generate_health_risk_report(current_user.name, med_dicts)
    message_body = _build_whatsapp_text(report)

    sent_to: list[str] = []

    # Send to user
    if send_message(current_user.phone, message_body):
        sent_to.append("user")

    # Send to caretaker if configured
    if current_user.caretaker_phone:
        if send_message(current_user.caretaker_phone, message_body):
            sent_to.append("caretaker")

    return ApiResponse(
        data={
            "report": report,
            "whatsapp_sent_to": sent_to,
            "message": f"Report sent to: {', '.join(sent_to) if sent_to else 'none (WhatsApp not configured)'}",
        }
    )


@router.post("/organ-impact", response_model=ApiResponse)
async def get_organ_impact(
    body: dict,
    current_user: User = Depends(get_current_user),
):
    """
    Analyse a single medicine using AI and return which organs it targets vs puts at risk.
    Used by the 3D Drug Visualizer to intelligently highlight organ meshes.

    Request body: { name, dosage, category, frequency }
    Response data: { targetOrgans, riskOrgans, recommendedSystem, confidence, reasoning, mechanismSummary }
    """
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=422, detail="Medicine 'name' is required.")

    result = await analyze_organ_impact(
        medicine_name=name,
        dosage=body.get("dosage", ""),
        category=body.get("category", ""),
        frequency=body.get("frequency", ""),
    )
    return ApiResponse(data=result)
