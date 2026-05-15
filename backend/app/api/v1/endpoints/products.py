from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import crud_product
from app.db.session import get_db
from app.schemas.product import ProductCreate, ProductRead

router = APIRouter()


@router.get("/", response_model=list[ProductRead])
def list_products(skip: int = 0, limit: int = 20, category: Optional[str] = None, db: Session = Depends(get_db)):
    return crud_product.get_products(db=db, skip=skip, limit=limit, category=category)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud_product.get_product(db=db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    return crud_product.create_product(db=db, product_in=product_in)

