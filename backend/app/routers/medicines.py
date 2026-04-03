"""Medicine CRUD + dose-log management."""

from datetime import datetime, date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Medicine, DoseLog, User
from app.schemas import (
    ApiResponse, MedicineCreate, MedicineUpdate, MedicineOut,
    MedicineSummary, MedicineListResponse, MedicineTodayResponse,
    MedicineTodayItem, DoseLogOut, NextMedicine,
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])


# ── helpers ──────────────────────────────────────────────────────────────────

def _ensure_today_dose(db: Session, med: Medicine) -> DoseLog | None:
    """Return (or create) today's DoseLog for a medicine."""
    today = date.today()
    dose = (
        db.query(DoseLog)
        .filter(DoseLog.medicine_id == med.id, DoseLog.date == today)
        .first()
    )
    if dose is None:
        hour, minute = map(int, med.scheduled_time.split(":"))
        scheduled_dt = datetime(today.year, today.month, today.day, hour, minute)
        dose = DoseLog(
            medicine_id=med.id,
            user_id=med.user_id,
            scheduled_for=scheduled_dt,
            status="upcoming",
            date=today,
        )
        db.add(dose)
        db.commit()
        db.refresh(dose)
    return dose


def _medicine_out(med: Medicine, dose: DoseLog | None) -> MedicineOut:
    out = MedicineOut.model_validate(med)
    out.today_status = dose.status if dose else None
    return out


# ── GET /api/medicines ───────────────────────────────────────────────────────

@router.get("", response_model=ApiResponse)
def list_medicines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meds = (
        db.query(Medicine)
        .filter(Medicine.user_id == current_user.id, Medicine.is_active == True)
        .order_by(Medicine.scheduled_time)
        .all()
    )

    today = date.today()
    taken = pending = missed = 0
    items: list[MedicineOut] = []

    for med in meds:
        dose = (
            db.query(DoseLog)
            .filter(DoseLog.medicine_id == med.id, DoseLog.date == today)
            .first()
        )
        out = _medicine_out(med, dose)
        items.append(out)

        if dose:
            if dose.status in ("taken", "done"):
                taken += 1
            elif dose.status == "missed":
                missed += 1
            else:
                pending += 1
        else:
            pending += 1

    payload = MedicineListResponse(
        medicines=items,
        summary=MedicineSummary(taken=taken, pending=pending, missed=missed),
    )
    return ApiResponse(data=payload.model_dump())


# ── GET /api/medicines/today ─────────────────────────────────────────────────

@router.get("/today", response_model=ApiResponse)
def today_doses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    meds = (
        db.query(Medicine)
        .filter(Medicine.user_id == current_user.id, Medicine.is_active == True)
        .order_by(Medicine.scheduled_time)
        .all()
    )

    doses_list: list[MedicineTodayItem] = []
    taken_count = 0
    next_med: NextMedicine | None = None
    now = datetime.now()

    for med in meds:
        dose = _ensure_today_dose(db, med)
        med_out = _medicine_out(med, dose)
        dose_out = DoseLogOut.model_validate(dose) if dose else None
        doses_list.append(MedicineTodayItem(medicine=med_out, dose_log=dose_out))

        if dose and dose.status in ("taken", "done"):
            taken_count += 1

        # pick next upcoming
        if dose and dose.status == "upcoming" and dose.scheduled_for >= now and next_med is None:
            next_med = NextMedicine(name=med.name, dosage=med.dosage, time=med.scheduled_time)

    payload = MedicineTodayResponse(
        doses=doses_list,
        taken=taken_count,
        total=len(meds),
        next_medicine=next_med,
    )
    return ApiResponse(data=payload.model_dump())


# ── POST /api/medicines ──────────────────────────────────────────────────────

@router.post("", response_model=ApiResponse, status_code=201)
def create_medicine(
    body: MedicineCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    med = Medicine(
        user_id=current_user.id,
        name=body.name,
        dosage=body.dosage,
        scheduled_time=body.scheduled_time,
        category=body.category,
        frequency=body.frequency,
    )
    db.add(med)
    db.commit()
    db.refresh(med)

    # generate today's dose log immediately
    _ensure_today_dose(db, med)

    out = _medicine_out(med, None)
    return ApiResponse(data=out.model_dump())


# ── PATCH /api/medicines/{id} ────────────────────────────────────────────────

@router.patch("/{med_id}", response_model=ApiResponse)
def update_medicine(
    med_id: int,
    body: MedicineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    med = (
        db.query(Medicine)
        .filter(Medicine.id == med_id, Medicine.user_id == current_user.id)
        .first()
    )
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    time_changed = False
    if body.name is not None:
        med.name = body.name
    if body.dosage is not None:
        med.dosage = body.dosage
    if body.scheduled_time is not None and body.scheduled_time != med.scheduled_time:
        med.scheduled_time = body.scheduled_time
        time_changed = True
    if body.category is not None:
        med.category = body.category
    if body.frequency is not None:
        med.frequency = body.frequency

    db.commit()
    db.refresh(med)

    # if time changed, regenerate upcoming dose log for today
    if time_changed:
        today = date.today()
        upcoming_dose = (
            db.query(DoseLog)
            .filter(
                DoseLog.medicine_id == med.id,
                DoseLog.date == today,
                DoseLog.status == "upcoming",
            )
            .first()
        )
        if upcoming_dose:
            hour, minute = map(int, med.scheduled_time.split(":"))
            upcoming_dose.scheduled_for = datetime(today.year, today.month, today.day, hour, minute)
            db.commit()

    dose = (
        db.query(DoseLog)
        .filter(DoseLog.medicine_id == med.id, DoseLog.date == date.today())
        .first()
    )
    return ApiResponse(data=_medicine_out(med, dose).model_dump())


# ── DELETE /api/medicines/{id} ───────────────────────────────────────────────

@router.delete("/{med_id}", response_model=ApiResponse)
def delete_medicine(
    med_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    med = (
        db.query(Medicine)
        .filter(Medicine.id == med_id, Medicine.user_id == current_user.id)
        .first()
    )
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    med.is_active = False
    db.commit()
    return ApiResponse(data={"message": "Medicine deleted"})


# ── PATCH /api/medicines/{id}/dose/{dose_log_id}/take ────────────────────────

@router.patch("/{med_id}/dose/{dose_log_id}/take", response_model=ApiResponse)
def take_dose(
    med_id: int,
    dose_log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dose = (
        db.query(DoseLog)
        .filter(
            DoseLog.id == dose_log_id,
            DoseLog.medicine_id == med_id,
            DoseLog.user_id == current_user.id,
        )
        .first()
    )
    if not dose:
        raise HTTPException(status_code=404, detail="Dose log not found")

    dose.status = "taken"
    dose.taken_at = datetime.now()
    db.commit()
    db.refresh(dose)

    return ApiResponse(data=DoseLogOut.model_validate(dose).model_dump())
