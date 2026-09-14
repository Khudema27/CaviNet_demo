from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.utils.database import get_db
from app.middleware.auth import get_current_user
from app.models.patient import Patient, Gender
from app.models.scan import Scan


router = APIRouter(
    tags=["Patients"]
)


class PatientIn(BaseModel):
    name: str
    email: str
    age: int
    gender: str
    phone: str | None = None
    address: str | None = None
    notes: str | None = None


class PatientResponse(BaseModel):
    id: int
    patient_code: str
    name: str
    email: str
    age: int | None
    gender: str | None
    phone: str | None
    address: str | None
    notes: str | None

    model_config = ConfigDict(from_attributes=True)


def serialize_patient(patient: Patient):
    return {
        "id": patient.id,
        "patient_code": patient.patient_code,
        "name": patient.full_name,
        "email": patient.email,
        "age": patient.age,
        "gender": patient.gender.value if patient.gender else None,
        "phone": patient.phone,
        "address": patient.address,
        "notes": patient.notes,
        "created_at": patient.created_at,
    }


def generate_patient_code(db: Session) -> str:
    """
    Generates patient IDs such as PT-001, PT-002, etc.
    """

    last_patient = (
        db.query(Patient)
        .order_by(Patient.id.desc())
        .first()
    )

    next_number = (last_patient.id + 1) if last_patient else 1

    return f"PT-{next_number:03d}"


@router.get(
    "/patients",
    response_model=list[PatientResponse]
)
def list_patients(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patients = (
        db.query(Patient)
        .order_by(Patient.created_at.desc())
        .all()
    )

    return [
        serialize_patient(patient)
        for patient in patients
    ]


@router.post(
    "/patients",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED
)
def create_patient(
    payload: PatientIn,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = Patient(
        patient_code=generate_patient_code(db),
        full_name=payload.name.strip(),
        email=payload.email.strip(),
        age=payload.age,
        gender=Gender(payload.gender),
        phone=payload.phone,
        address=payload.address,
        notes=payload.notes,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return serialize_patient(patient)


@router.get(
    "/patients/{patient_id}",
    response_model=PatientResponse
)
def get_patient(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return serialize_patient(patient)


@router.put(
    "/patients/{patient_id}",
    response_model=PatientResponse
)
def update_patient(
    patient_id: int,
    payload: PatientIn,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    patient.full_name = payload.name.strip()
    patient.email = payload.email.strip()
    patient.age = payload.age
    patient.gender = Gender(payload.gender)
    patient.phone = payload.phone
    patient.address = payload.address
    patient.notes = payload.notes

    db.commit()
    db.refresh(patient)

    return serialize_patient(patient)


@router.get("/patients/{patient_id}/scans")
def get_patient_scans(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    scans = (
        db.query(Scan)
        .filter(Scan.patient_id == patient_id)
        .order_by(Scan.uploaded_at.desc())
        .all()
    )

    return [
        {
            "id": scan.id,
            "patient_id": scan.patient_id,
            "doctor_id": scan.doctor_id,
            "job_id": scan.job_id,
            "filename": scan.filename,
            "status": scan.status.value if scan.status else None,
            "cavity_detected": scan.cavity_detected,
            "confidence_score": scan.confidence_score,
            "affected_lung_region": scan.affected_lung_region,
            "decision_summary": scan.decision_summary,
            "heatmap_url": scan.heatmap_url,
            "uploaded_at": scan.uploaded_at,
            "completed_at": scan.completed_at,
        }
        for scan in scans
    ]