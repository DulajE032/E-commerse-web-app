from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.schemas.category import CategoryRead


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: float
    discount_price: Optional[float] = Field(None, alias="discountPrice")
    stock: int = 0
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    rating: Optional[float] = 0.0
    featured: bool = False
    specifications: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(populate_by_name=True)

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = Field(None, alias="discountPrice")
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    rating: Optional[float] = None
    featured: Optional[bool] = None
    specifications: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(populate_by_name=True)

class PriceRange(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    
class PaginatedProductResponse(BaseModel):
    products: list[ProductRead]
    total: int
    page: int
    limit: int
    pages: int

class ProductFiltersResponse(BaseModel):
    categories: list[CategoryRead]
    brands: list[str]
    price_range: PriceRange = Field(alias="priceRange")

    model_config = ConfigDict(populate_by_name=True)