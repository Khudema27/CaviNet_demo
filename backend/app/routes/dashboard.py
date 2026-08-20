from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.utils.database import get_db
from app.models.scan import Scan, ScanStatus
from app.models.patient import Patient
from app.schemas.dashboard import DashboardStatsResponse, ScanSummaryResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Doctor Dashboard"])


def _scan_scope(db: Session, current_user: dict):
    """
    Admins see every scan in the system; doctors only see scans ordered
    under their own account. Keeps M-02 aligned with the doctor/admin
    permission split established in M-01 without needing a separate
    admin-only dashboard yet.
    """
    query = db.query(Scan)
    if current_user.get("role") != "admin":
        query = query.filter(Scan.doctor_id == current_user.get("user_id"))
    return query


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scope = _scan_scope(db, current_user)

    total_scans = scope.count()

    pending = scope.filter(
        Scan.status.in_([ScanStatus.PENDING, ScanStatus.PREPROCESSING, ScanStatus.ANALYZING])
    ).count()

    cavity_detected = scope.filter(Scan.cavity_detected == True).count()  # noqa: E712

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    completed_today = scope.filter(
        Scan.status == ScanStatus.COMPLETE,
        Scan.completed_at.isnot(None),
        Scan.completed_at >= today_start,
    ).count()

    return DashboardStatsResponse(
        total_scans=total_scans,
        pending=pending,
        cavity_detected=cavity_detected,
        completed_today=completed_today,
    )


@router.get("/recent-scans", response_model=List[ScanSummaryResponse])
async def get_recent_scans(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scope = _scan_scope(db, current_user)

    scans = (
        scope.join(Patient, Scan.patient_id == Patient.id)
        .order_by(Scan.uploaded_at.desc())
        .limit(min(limit, 50))
        .all()
    )

    return [
        ScanSummaryResponse(
            id=s.id,
            patient_name=s.patient.full_name,
            patient_code=s.patient.patient_code,
            uploaded_at=s.uploaded_at,
            status=s.status,
            cavity_detected=s.cavity_detected,
            confidence_score=s.confidence_score,
        )
        for s in scans
    ]