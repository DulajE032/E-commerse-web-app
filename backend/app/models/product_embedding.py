from sqlalchemy import Integer, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class ProductEmbedding(Base):
    __tablename__ = "product_embeddings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    image_url:Mapped[str] = mapped_column(String(500), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False, default="ViT-B-32")
    embedding: Mapped[list[float]] = mapped_column(ARRAY(Float), nullable=False)
 
