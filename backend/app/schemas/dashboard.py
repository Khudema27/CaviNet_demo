from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.scan import ScanStatus


class DashboardStatsResponse(BaseModel):
    total_scans: int
    pending: int
    cavity_detected: int
    completed_today: int


class ScanSummaryResponse(BaseModel):
    id: int
    patient_name: str
    patient_code: str
    uploaded_at: datetime
    status: ScanStatus
    cavity_detected: Optional[bool] = None
    confidence_score: Optional[float] = None

    class Config:
        from_attributes = True