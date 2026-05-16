from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.crud import crud_product
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate   

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
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return crud_product.create_product(db=db, product_in=product_in)

@router.put("/{product_id}", response_model=ProductUpdate, status_code=status.HTTP_200_OK)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    product = crud_product.update_product(db=db, product_in=product_in, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    success = crud_product.delete_product(db=db, product_id=product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")