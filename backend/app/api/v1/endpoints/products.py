from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.crud import crud_product
from app.db.session import get_db
from app.schemas.product import ProductCreate, ProductRead

router = APIRouter()


@router.get("/", response_model=list[ProductRead])
def list_products(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud_product.get_products(db=db, skip=skip, limit=limit)


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    return crud_product.create_product(db=db, product_in=product_in)
