
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from uuid import UUID
from typing import Optional
    
class ReviewBase(BaseModel):
    rating: float = Field(ge=1.0, le=5.0)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewRead(ReviewBase):
    id: UUID
    product_id: UUID
    user_id: UUID
    created_at: datetime
    
    # Optionally include user details if needed by frontend
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
