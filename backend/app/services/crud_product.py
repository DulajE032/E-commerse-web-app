from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.product import Product
from app.models.review import Review
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.review import ReviewCreate

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    search :Optional[str]=None,
    sort_by:Optional[str]=None,
    
    brands:Optional[list[str]]=None,
    min_price:Optional[float]=None,
    max_price:Optional[float]=None,
    in_stock:Optional[bool]=None 
    
)-> list[Product]: 
    
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    
    if skip < 0:
        raise HTTPException(status_code=400, detail="Skip value cannot be negative.")
    if limit < 0:
        raise HTTPException(status_code=400, detail="Limit value cannot be negative.")
    if limit > 100:
        raise HTTPException(status_code=400, detail="Limit cannot exceed 100 items.")
    if brands:  
        query = query.filter(Product.brand.in_(brands))
     
    if min_price is not None:
        query=query.filter(Product.price>= min_price)
        
    if search:
        query=query.filter(
            Product.name.ilike(f"%{search}%") |
            Product.description.ilike(f"%{search}%")

    )
    
    if max_price is not None:
        query=query.filter(Product.price<=max_price)
    
    if in_stock is not None :
        if in_stock:
             query = query.filter(Product.stock > 0)
        else:
             query = query.filter(Product.stock <= 0)   

    # Sorting Logic
    if sort_by=="price_low":
        query=query.order_by(Product.price.asc())
    elif sort_by=="price_high":
        query=query.order_by(Product.price.desc())
    elif sort_by=="newest":
        query=query.order_by(Product.createdAt.desc())
    elif sort_by=="top_selling":
        query=query.order_by(Product.sales_count.desc())
    else:
        # Default: Show Featured products first, then newest
        query = query.order_by(Product.featured.desc(), Product.createdAt.desc())

    return query.offset(skip).limit(limit).all()


#-------------------------get brands
def get_brands(db: Session) -> list[str]:
     results = (
         db.query(Product.brand)
         .filter(Product.brand.isnot(None))
         .distinct()
         .order_by(Product.brand)
         .all()
     )
     return [row[0] for row in results if row[0]]

#------------------------------get price  range 
def get_price_range(db: Session) -> tuple[float | None, float | None]:
     min_price, max_price = db.query(
         # Translates to: SELECT * FROM products WHERE LOWER(brand) = 'apple'; func mean 
         func.min(Product.price), func.max(Product.price)
     ).first()
     return min_price, max_price

    


def get_product(db: Session, product_id: int) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()


def create_product(db: Session, product_in: ProductCreate) -> Product:
    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_in: ProductUpdate, product_id: int) -> Product | None:
    product = get_product(db, product_id)
    if not product:
        return None

    for field, value in product_in.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> bool:
    product = get_product(db, product_id)
    if not product:
        return False

    db.delete(product)
    db.commit()
    return True

def get_reviews(db: Session, product_id: int):
    return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()

def create_review(db: Session, product_id: int, user_id: int, review_in: ReviewCreate) -> Review:
    review = Review(
        product_id=product_id,
        user_id=user_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Optionally update the product's average rating here
    product = get_product(db, product_id)
    if product:
        all_reviews = get_reviews(db, product_id)
        if all_reviews:
            avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
            product.rating = avg_rating
            db.commit()
            
    return review
