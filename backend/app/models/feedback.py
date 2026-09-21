from sqlalchemy import Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 5
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False)  # "PENDING", "APPROVED", "RESPONDED"
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    order = relationship("Order")
    responses = relationship("FeedbackResponse", back_populates="feedback", cascade="all, delete-orphan")


class FeedbackResponse(Base):
    __tablename__ = "feedback_responses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    feedback_id: Mapped[int] = mapped_column(Integer, ForeignKey("feedbacks.id", ondelete="CASCADE"), nullable=False, index=True)
    admin_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    response: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    feedback = relationship("Feedback", back_populates="responses")
    admin = relationship("User")
