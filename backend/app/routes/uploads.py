# app/routes/uploads.py
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from typing import List, Optional
import os
import uuid
import shutil
import json
from PIL import Image
import pydicom

# Import the Celery task (task must be defined in app/tasks.py)
from app.tasks import enqueue_process

router = APIRouter()

# Upload root (load from env if present)
UPLOAD_ROOT = os.getenv('UPLOAD_ROOT', os.path.join(os.getcwd(), 'data', 'uploads'))
os.makedirs(UPLOAD_ROOT, exist_ok=True)

MAX_FILE_SIZE = 200 * 1024 * 1024  # 200 MB

def save_file_stream(upload_file: UploadFile, dest_path: str):
    with open(dest_path, 'wb') as out:
        shutil.copyfileobj(upload_file.file, out)

def is_image_file(filename: str) -> bool:
    return filename.lower().endswith(('.png', '.jpg', '.jpeg'))

def is_dicom_file(filename: str) -> bool:
    return filename.lower().endswith(('.dcm', '.dicom'))

@router.post("/uploads")
async def upload_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    current_user: str = Depends(lambda: "dev_user")  # replace with real auth dependency
):
    """
    Accept multiple files (PNG/JPG/DICOM/ZIP), validate basic integrity,
    save to UPLOAD_ROOT/<job_id>/ and enqueue a Celery task for processing.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    job_id = str(uuid.uuid4())
    job_folder = os.path.join(UPLOAD_ROOT, job_id)
    os.makedirs(job_folder, exist_ok=True)

    saved_paths = []
    for f in files:
        # sanitize filename if needed (basic)
        filename = os.path.basename(f.filename)
        if not filename:
            raise HTTPException(status_code=400, detail="Invalid filename")

        dest = os.path.join(job_folder, filename)
        save_file_stream(f, dest)

        size = os.path.getsize(dest)
        if size > MAX_FILE_SIZE:
            # cleanup and return error
            shutil.rmtree(job_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail=f"{filename} exceeds max size")

        # basic format validation
        if is_image_file(filename):
            try:
                Image.open(dest).verify()
            except Exception:
                shutil.rmtree(job_folder, ignore_errors=True)
                raise HTTPException(status_code=400, detail=f"{filename} is not a valid image")
        elif is_dicom_file(filename) or filename.lower().endswith('.zip'):
            try:
                if is_dicom_file(filename):
                    # read header only
                    pydicom.dcmread(dest, stop_before_pixels=True)
            except Exception:
                # allow but mark for deeper validation in worker
                pass
        else:
            shutil.rmtree(job_folder, ignore_errors=True)
            raise HTTPException(status_code=400, detail=f"{filename} unsupported format")

        saved_paths.append(dest)

    # write manifest for worker
    manifest = {
        "job_id": job_id,
        "user": current_user,
        "files": [os.path.basename(p) for p in saved_paths]
    }
    with open(os.path.join(job_folder, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh)

    # enqueue Celery task (non-blocking)
    try:
        enqueue_process.delay(job_id, job_folder)
    except Exception:
        # if enqueue fails, keep manifest but return error
        raise HTTPException(status_code=500, detail="Failed to enqueue processing task")

    return {"job_id": job_id, "status": "queued"}

@router.get("/uploads/{job_id}")
def get_job_status(job_id: str):
    """
    Return basic job status by reading manifest/result files from disk.
    """
    job_folder = os.path.join(UPLOAD_ROOT, job_id)
    if not os.path.exists(job_folder):
        raise HTTPException(status_code=404, detail="Job not found")

    manifest = {}
    result = {}
    try:
        with open(os.path.join(job_folder, "manifest.json"), "r", encoding="utf-8") as fh:
            manifest = json.load(fh)
    except Exception:
        manifest = {}

    try:
        with open(os.path.join(job_folder, "result.json"), "r", encoding="utf-8") as fh:
            result = json.load(fh)
    except Exception:
        result = {}

    status = "queued"
    if result:
        status = "processed"
    return {"job_id": job_id, "status": status, "manifest": manifest, "result": result}
