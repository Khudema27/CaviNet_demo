from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, dashboard
from app.utils.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient  # noqa: F401 — imported so create_all sees the table
from app.models.scan import Scan, ScanStatus  # noqa: F401 — imported so create_all sees the table
from app.utils.auth import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)


def seed_admin_account():
    """
    Ensures a working admin account exists on startup, using the credentials
    from settings.ADMIN_EMAIL / settings.ADMIN_PASSWORD. Without this, there
    was no way to reach an admin account except registering one by hand.
    Safe to run on every startup — it's a no-op once the account exists.
    """
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL.lower()).first()
        if existing:
            return

        admin = User(
            email=settings.ADMIN_EMAIL.lower(),
            username="admin",
            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
            full_name="System Admin",
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        db.commit()
        print(f"[CaviNet] Seeded default admin account: {settings.ADMIN_EMAIL}")
    finally:
        db.close()


seed_admin_account()

# Initialize FastAPI
app = FastAPI(
    title="CaviNet API",
    description="AI-based TB Cavity Detection System",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {
        "message": "CaviNet API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)