from sqlalchemy.orm import Session
from typing import Optional

from app.models.product import Product
from app.schemas.product import ProductCreate


def get_products(db: Session, skip: int = 0, limit: int = 20, category: Optional[str] = None) -> list[Product]:
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    return query.offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()


def create_product(db: Session, product_in: ProductCreate) -> Product:
    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

