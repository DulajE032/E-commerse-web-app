from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Payment info
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False)  # "card", "paypal", "cod"
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")  # "pending", "paid", "failed", "refunded"
    
    # Order info
    status: Mapped[str] = mapped_column(String(50), default="pending")  # "pending", "confirmed", "shipped", "delivered", "cancelled"
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    shipping_cost: Mapped[float] = mapped_column(Float, default=0.0)
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Shipping address (stored as JSON)
    shipping_address: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Contact
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Items snapshot (JSON array of {product_id, name, price, quantity, image})
    items: Mapped[list | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


