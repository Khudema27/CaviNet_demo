from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from reportlab.pdfgen import canvas

import os

from app.utils.database import get_db
from app.middleware.auth import get_current_user
from app.models.scan import Scan


router = APIRouter(
    tags=["Reports"]
)


@router.get("/reports/{job_id}")
def get_report(job_id: str):
    report_path = f"data/reports/{job_id}.pdf"
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(report_path, media_type="application/pdf", filename=f"{job_id}.pdf")
def generate_report(
    job_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    scan = (
        db.query(Scan)
        .filter(Scan.job_id == job_id)
        .first()
    )

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan report not found"
        )

    patient = scan.patient

    os.makedirs(
        "dummy_data",
        exist_ok=True
    )

    pdf_path = os.path.join(
        "dummy_data",
        f"{job_id}_report.pdf"
    )

    cavity = (
        "Yes"
        if scan.cavity_detected
        else "No"
        if scan.cavity_detected is False
        else "Pending"
    )

    confidence = (
        f"{scan.confidence_score * 100:.0f}%"
        if scan.confidence_score is not None
        else "—"
    )

    summary = (
        scan.decision_summary
        or "AI analysis result is not available yet."
    )

    pdf = canvas.Canvas(pdf_path)

    pdf.drawString(
        100,
        780,
        "CaviNet Diagnostic Report"
    )

    pdf.drawString(
        100,
        740,
        f"Patient: {patient.full_name}"
    )

    pdf.drawString(
        100,
        720,
        f"Patient ID: {patient.patient_code}"
    )

    pdf.drawString(
        100,
        700,
        f"Scan ID: {scan.id}"
    )

    pdf.drawString(
        100,
        680,
        f"Job ID: {job_id}"
    )

    pdf.drawString(
        100,
        640,
        f"Cavity Detected: {cavity}"
    )

    pdf.drawString(
        100,
        620,
        f"Confidence Score: {confidence}"
    )

    pdf.drawString(
        100,
        580,
        "Decision Summary:"
    )

    pdf.drawString(
        100,
        560,
        summary[:100]
    )

    heatmap_path = os.path.join(
        "dummy_data",
        "dummy_heatmap.png"
    )

    if os.path.exists(heatmap_path):
        pdf.drawImage(
            heatmap_path,
            100,
            230,
            width=300,
            height=300
        )

    pdf.save()

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"{patient.patient_code}_{job_id}_report.pdf"
    )