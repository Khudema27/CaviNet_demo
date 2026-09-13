from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PatientIn(BaseModel):
    name: str
    email: str
    age: int
    gender: str
    phone: str | None = None
    address: str | None = None
    notes: str | None = None

# Simple in-memory store for development
DB: list[dict] = []
NEXT_ID = 1

@router.get("/patients")
def list_patients():
    return DB

@router.post("/patients", status_code=201)
def create_patient(payload: PatientIn):
    global NEXT_ID
    obj = payload.dict()
    obj["id"] = NEXT_ID
    NEXT_ID += 1
    DB.append(obj)
    return obj
