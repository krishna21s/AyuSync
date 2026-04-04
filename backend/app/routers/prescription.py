"""Prescription OCR endpoint — POST /api/prescription/scan"""

import base64

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.schemas import ApiResponse
from app.services.prescription_ocr import extract_medicines_from_image

router = APIRouter(prefix="/api/prescription", tags=["Prescription"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_BYTES = 4 * 1024 * 1024  # 4 MB (Groq base64 limit)


@router.post("/scan", response_model=ApiResponse)
async def scan_prescription(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept an image upload, run Groq vision OCR, return extracted medicines.

    Response data:
    {
        "medicines": [
            { "name": "PAN 40", "dosage": "40mg", "frequency": "daily",
              "timing": "morning", "category": "Gastric", "duration": "15 days" }
        ]
    }
    """
    # Validate MIME type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {content_type}. Upload JPG, PNG, or WebP."
        )

    # Read and size-check
    raw = await file.read()
    if len(raw) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image too large. Maximum size is 4 MB."
        )

    # Base64 encode for Groq
    image_b64 = base64.b64encode(raw).decode("utf-8")

    # Run OCR
    medicines = await extract_medicines_from_image(image_b64, content_type)

    return ApiResponse(data={"medicines": medicines, "count": len(medicines)})
