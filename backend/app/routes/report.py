from fastapi import APIRouter
from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
import os

router = APIRouter()

@router.get("/reports/{job_id}")
def generate_report(job_id: str):
    pdf_path = f"dummy_data/{job_id}_report.pdf"
    c = canvas.Canvas(pdf_path)
    c.drawString(100, 750, f"Diagnostic Report for Job {job_id}")
    c.drawString(100, 700, "Patient ID: PAT001")
    c.drawString(100, 650, "Cavity Detected: Yes")
    c.drawString(100, 600, "Confidence Score: 0.87")
    c.drawString(100, 550, "Decision Summary: Cavity detected in left lung region.")
    c.drawImage("dummy_data/dummy_heatmap.png", 100, 400, width=300, height=300)
    c.save()
    return FileResponse(pdf_path, media_type="application/pdf")
