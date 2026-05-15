from sqlalchemy import Float, Integer, String, Boolean, JSON, DateTime, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    category: Mapped[str | None] = mapped_column(String(255), nullable=True)
    brand: Mapped[str | None] = mapped_column(String(255), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    discountPrice: Mapped[float | None] = mapped_column(Float, nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    images: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, default=0.0)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    specifications: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    createdAt: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
