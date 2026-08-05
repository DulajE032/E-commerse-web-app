# app/models/user.py
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user", server_default="user")
    google_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
