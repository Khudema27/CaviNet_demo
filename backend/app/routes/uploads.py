from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
    Form,
)
from typing import List
import os
import uuid
import shutil
import json

from PIL import Image
import pydicom
from sqlalchemy.orm import Session

from app.tasks import enqueue_process
from app.utils.database import get_db
from app.middleware.auth import get_current_user
from app.models.patient import Patient
from app.models.scan import Scan, ScanStatus


router = APIRouter(tags=["Uploads"])

UPLOAD_ROOT = os.getenv(
    "UPLOAD_ROOT",
    os.path.join(os.getcwd(), "data", "uploads")
)
os.makedirs(UPLOAD_ROOT, exist_ok=True)

MAX_FILE_SIZE = 200 * 1024 * 1024


def save_file_stream(upload_file: UploadFile, dest_path: str):
    with open(dest_path, "wb") as out:
        shutil.copyfileobj(upload_file.file, out)


def is_image_file(filename: str) -> bool:
    return filename.lower().endswith((".png", ".jpg", ".jpeg"))


def is_dicom_file(filename: str) -> bool:
    return filename.lower().endswith((".dcm", ".dicom"))


@router.post("/uploads")
async def upload_files(
    files: List[UploadFile] = File(...),
    patient_id: int | None = Form(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    doctor_id = current_user.get("user_id")
    if not doctor_id:
        raise HTTPException(status_code=401, detail="Invalid authenticated user")

    # Verify patient if supplied
    patient = None
    if patient_id is not None:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

    # Create job
    job_id = str(uuid.uuid4())
    job_folder = os.path.join(UPLOAD_ROOT, job_id)
    os.makedirs(job_folder, exist_ok=True)

    saved_paths = []

    # Save and validate files
    for upload_file in files:
        filename = os.path.basename(upload_file.filename or "")
        if not filename:
            shutil.rmtree(job_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail="Invalid filename")

        destination = os.path.join(job_folder, filename)
        save_file_stream(upload_file, destination)

        size = os.path.getsize(destination)
        if size > MAX_FILE_SIZE:
            shutil.rmtree(job_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail=f"{filename} exceeds max size")

        if is_image_file(filename):
            try:
                Image.open(destination).verify()
            except Exception:
                shutil.rmtree(job_folder, ignore_errors=True)
                raise HTTPException(status_code=400, detail=f"{filename} is not a valid image")

        elif is_dicom_file(filename):
            try:
                pydicom.dcmread(destination, stop_before_pixels=True)
            except Exception:
                shutil.rmtree(job_folder, ignore_errors=True)
                raise HTTPException(status_code=400, detail=f"{filename} is not a valid DICOM file")

        elif filename.lower().endswith(".zip"):
            pass
        else:
            shutil.rmtree(job_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail=f"{filename} unsupported format")

        saved_paths.append(destination)

    # Manifest
    manifest = {
        "job_id": job_id,
        "user_id": doctor_id,
        "patient_id": patient_id,
        "files": [os.path.basename(path) for path in saved_paths],
    }
    with open(os.path.join(job_folder, "manifest.json"), "w", encoding="utf-8") as file:
        json.dump(manifest, file)

    # Create Scan DB record if patient was selected
    scan = None
    if patient:
        scan = Scan(
            patient_id=patient_id,
            doctor_id=doctor_id,
            job_id=job_id,
            filename=os.path.basename(saved_paths[0]),
            status=ScanStatus.PENDING,
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

    # Enqueue processing
    try:
        enqueue_process.delay(job_id, job_folder)
    except Exception:
        if scan:
            scan.status = ScanStatus.FAILED
            db.commit()
        raise HTTPException(status_code=500, detail="Failed to enqueue processing task")

    return {
        "job_id": job_id,
        "scan_id": scan.id if scan else None,
        "patient_id": patient.id if patient else None,
        "status": "queued",
    }


@router.get("/uploads/{job_id}")
def get_job_status(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    job_folder = os.path.join(UPLOAD_ROOT, job_id)
    if not os.path.exists(job_folder):
        raise HTTPException(status_code=404, detail="Job not found")

    manifest = {}
    result = {}

    try:
        with open(os.path.join(job_folder, "manifest.json"), "r", encoding="utf-8") as file:
            manifest = json.load(file)
    except Exception:
        manifest = {}

    try:
        with open(os.path.join(job_folder, "result.json"), "r", encoding="utf-8") as file:
            result = json.load(file)
    except Exception:
        result = {}

    status = "queued"
    if result:
        status = "processed"

    return {
        "job_id": job_id,
        "status": status,
        "manifest": manifest,
        "result": result,
    }
