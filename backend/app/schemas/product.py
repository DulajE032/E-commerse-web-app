from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.schemas.category import CategoryRead


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: float
    discountPrice: Optional[float] = None
    stock: int = 0
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    rating: Optional[float] = 0.0
    featured: bool = False
    specifications: Optional[Dict[str, Any]] = None

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    discountPrice: Optional[float] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    rating: Optional[float] = None
    featured: Optional[bool] = None
    specifications: Optional[Dict[str, Any]] = None
    
class PriceRange(BaseModel):
    min:Optional[float]=None,
    max:Optional[float]=None
    
class ProductFiltersResponse(BaseModel):
     categories: list[CategoryRead]
     brands: list[str]
     priceRange: PriceRange