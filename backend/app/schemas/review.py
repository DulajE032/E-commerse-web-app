from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    rating: float
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewRead(ReviewBase):
    id: int
    product_id: int
    user_id: int
    created_at: datetime
    
    # Optionally include user details if needed by frontend
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
