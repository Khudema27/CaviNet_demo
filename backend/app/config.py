from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # SQLite by default for local dev — swap to a Postgres URL for deployment, e.g.
    # "postgresql://user:password@localhost:5432/cavinet". Requires psycopg2-binary
    # (already in requirements.txt) and a running Postgres instance; no code changes
    # needed, SQLAlchemy handles both via this single setting.
    DATABASE_URL: str = "sqlite:///./cavinet.db"

    SECRET_KEY: str = "your-super-secret-key-change-in-production-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # How long a password-reset link stays valid.
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # Base URL of the frontend, used to build the password-reset link.
    FRONTEND_URL: str = "http://localhost:5173"

    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Seeded on startup if no user with this email exists yet — see main.py.
    ADMIN_EMAIL: str = "admin@cavinet.com"
    ADMIN_PASSWORD: str = "Admin@123"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()