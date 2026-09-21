from sqlalchemy import Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    payment_method: Mapped[str] = mapped_column(String(30), nullable=False)  # "COD", "BANK_TRANSFER"
    reference_number: Mapped[str | None] = mapped_column(String(50), unique=True, index=True, nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    
    bank_slip_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    payment_instructions_pdf: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False)  # "PENDING", "SUBMITTED", "VERIFIED", "REJECTED"
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    verified_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    order = relationship("Order", back_populates="payment")
    user = relationship("User")
