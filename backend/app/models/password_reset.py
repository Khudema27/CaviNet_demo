from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.utils.database import Base


class PasswordResetToken(Base):
    """
    One row per issued reset link. A token is single-use (flagged via `used`)
    and time-boxed (`expires_at`, set from settings.RESET_TOKEN_EXPIRE_MINUTES).
    """
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<PasswordResetToken user_id={self.user_id} used={self.used}>"