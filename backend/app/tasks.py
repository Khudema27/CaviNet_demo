# app/tasks.py
from celery import Celery
import os, json
import pydicom
from PIL import Image

REDIS_BROKER = os.getenv('REDIS_BROKER', 'redis://localhost:6379/0')
celery = Celery('app.tasks', broker=REDIS_BROKER)

@celery.task(bind=True)
def enqueue_process(self, job_id: str, job_folder: str):
    manifest_path = os.path.join(job_folder, 'manifest.json')
    try:
        with open(manifest_path, 'r') as fh:
            manifest = json.load(fh)
    except Exception:
        manifest = {"job_id": job_id, "files": []}

    results = []
    for fname in manifest.get('files', []):
        path = os.path.join(job_folder, fname)
        if path.lower().endswith(('.png', '.jpg', '.jpeg')):
            try:
                img = Image.open(path)
                img.verify()
                results.append({"file": fname, "type": "image", "status": "ok"})
            except Exception as e:
                results.append({"file": fname, "type": "image", "status": "invalid", "error": str(e)})
        elif path.lower().endswith(('.dcm', '.dicom')):
            try:
                ds = pydicom.dcmread(path, stop_before_pixels=True)
                sid = getattr(ds, 'SeriesInstanceUID', None)
                results.append({"file": fname, "type": "dicom", "series": sid, "status": "ok"})
            except Exception as e:
                results.append({"file": fname, "type": "dicom", "status": "invalid", "error": str(e)})
        else:
            results.append({"file": fname, "type": "unknown", "status": "skipped"})

    # write results file for downstream AI pipeline
    with open(os.path.join(job_folder, 'result.json'), 'w') as fh:
        json.dump({"job_id": job_id, "results": results}, fh)

    # Here call AI pipeline or notify it (e.g., HTTP webhook, message queue)
    # Example placeholder: notify_ai_pipeline(job_id, job_folder)

    return {"job_id": job_id, "status": "processed", "results": results}
