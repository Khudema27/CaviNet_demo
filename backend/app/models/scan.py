from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Enum,
    Boolean,
    Float,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base
import enum


class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    PREPROCESSING = "preprocessing"
    ANALYZING = "analyzing"
    COMPLETE = "complete"
    FAILED = "failed"


class Scan(Base):
    __tablename__ = "scans"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True
    )

    doctor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    job_id = Column(
        String(100),
        unique=True,
        index=True,
        nullable=True
    )

    filename = Column(
        String(255),
        nullable=False
    )

    status = Column(
        Enum(ScanStatus),
        default=ScanStatus.PENDING,
        nullable=False
    )

    cavity_detected = Column(
        Boolean,
        nullable=True
    )

    confidence_score = Column(
        Float,
        nullable=True
    )

    affected_lung_region = Column(
        String(100),
        nullable=True
    )

    decision_summary = Column(
        String(1000),
        nullable=True
    )

    heatmap_url = Column(
        String(500),
        nullable=True
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    patient = relationship(
        "Patient",
        backref="scans"
    )

    doctor = relationship(
        "User",
        backref="ordered_scans"
    )

    def __repr__(self):
        return (
            f"<Scan {self.id} "
            f"patient={self.patient_id} "
            f"status={self.status}>"
        )