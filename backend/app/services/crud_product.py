from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
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
    
    
    if max_price is not None:
        query=query.filter(Product.price<=max_price)
    
    if in_stock is not None :
        if in_stock:
             query = query.filter(Product.stock > 0)
        else:
             query = query.filter(Product.stock <= 0)   
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
