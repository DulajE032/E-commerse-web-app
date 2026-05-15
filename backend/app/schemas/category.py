from pydantic import BaseModel, ConfigDict
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    image: Optional[str] = None
    slug: str

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
