from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base
import enum


class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    PREPROCESSING = "preprocessing"
    ANALYZING = "analyzing"
    COMPLETE = "complete"


class Scan(Base):
    """
    Minimal scan record standing in for M-04 (CT Scan Upload) and M-05/M-07
    (AI pipeline + decision support) output, so the Doctor Dashboard (M-02)
    has real data to render before those modules exist. The status values
    mirror the M-10 workflow (pending -> preprocessing -> analyzing ->
    complete); cavity_detected / confidence_score mirror the shape M-05
    is expected to produce, so wiring the real pipeline in later should
    mean filling these fields rather than reshaping the table.
    """
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    filename = Column(String(255), nullable=False)
    status = Column(Enum(ScanStatus), default=ScanStatus.PENDING, nullable=False)

    cavity_detected = Column(Boolean, nullable=True)      # null until analysis completes
    confidence_score = Column(Float, nullable=True)        # 0.0 - 1.0
    affected_lung_region = Column(String(100), nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    patient = relationship("Patient", backref="scans")
    doctor = relationship("User", backref="ordered_scans")

    def __repr__(self):
        return f"<Scan {self.id} patient={self.patient_id} status={self.status}>"