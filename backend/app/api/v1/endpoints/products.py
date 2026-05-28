from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, status,Query
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.services import crud_product
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate ,ProductFiltersResponse,PriceRange 
from app.schemas.review import ReviewCreate, ReviewRead
from app.services import crud_category
router = APIRouter()


@router.get("/", response_model=list[ProductRead])
def list_products(
     skip: int = 0,
     limit: int = 20,
     category: str | None = None,
     brands: list[str] | None = Query(None),
     min_price: float | None = Query(None, ge=0),
     max_price: float | None = Query(None, ge=0),
     in_stock: bool | None = None,
     db: Session = Depends(get_db),
 ):
     return crud_product.get_products(
         db=db,
         skip=skip,
         limit=limit,
         category=category,
         brands=brands,
         min_price=min_price,
         max_price=max_price,
         in_stock=in_stock,
     )

@router.get("/filters", response_model=ProductFiltersResponse)
def get_product_filters(db: Session = Depends(get_db)):
     categories = crud_category.get_categories(db=db, skip=0, limit=1000)
     brands = crud_product.get_brands(db=db)
     min_price, max_price = crud_product.get_price_range(db=db)
     return ProductFiltersResponse(
        categories=categories,
        brands=brands,
        priceRange=PriceRange(min=min_price, max=max_price),
     )

@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int = Path(..., gt=0), db: Session = Depends(get_db)):
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


@router.put("/{product_id}", response_model=ProductRead, status_code=status.HTTP_200_OK)
def update_product(
    product_in: ProductUpdate,
    product_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    product = crud_product.update_product(db=db, product_in=product_in, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    success = crud_product.delete_product(db=db, product_id=product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None

@router.get("/{product_id}/reviews", response_model=list[ReviewRead])
def get_product_reviews(product_id: int = Path(..., gt=0), db: Session = Depends(get_db)):
    product = crud_product.get_product(db=db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    reviews = crud_product.get_reviews(db=db, product_id=product_id)
    # Map user_name for the response
    for review in reviews:
        review.user_name = review.user.full_name if review.user else "Anonymous"
    return reviews

@router.post("/{product_id}/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_product_review(
    review_in: ReviewCreate,
    product_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("user")), # Or any authenticated user
):
    product = crud_product.get_product(db=db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    review = crud_product.create_review(db=db, product_id=product_id, user_id=current_user.id, review_in=review_in)
    review.user_name = current_user.full_name
    return review
