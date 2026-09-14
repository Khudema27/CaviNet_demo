from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from app.utils.database import Base
import enum


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    patient_code = Column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )

    full_name = Column(
        String(255),
        nullable=False
    )

    email = Column(
        String(255),
        nullable=False
    )

    age = Column(
        Integer,
        nullable=True
    )

    gender = Column(
        Enum(Gender),
        nullable=True
    )

    phone = Column(
        String(50),
        nullable=True
    )

    address = Column(
        String(500),
        nullable=True
    )

    notes = Column(
        String(2000),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    def __repr__(self):
        return f"<Patient {self.patient_code} ({self.full_name})>"