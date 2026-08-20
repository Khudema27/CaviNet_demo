from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from app.utils.database import Base
import enum


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class Patient(Base):
    """
    Minimal patient record — just enough to anchor a Scan and render the
    Doctor Dashboard (M-02) before M-03 (Patient Profile Management) exists.
    Ahmed's M-03 is the source of truth for full demographic data and CRUD;
    when it lands, this table gets extended/migrated rather than replaced,
    so existing Scan.patient_id linkage doesn't break.
    """
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String(50), unique=True, index=True, nullable=False)  # e.g. PT-041
    full_name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(Enum(Gender), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Patient {self.patient_code} ({self.full_name})>"