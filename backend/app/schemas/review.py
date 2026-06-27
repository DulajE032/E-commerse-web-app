from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
    
class ReviewBase(BaseModel):
    rating: float = Field(ge=1.0, le=5.0)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewRead(ReviewBase):
    id: int           # ✅ Changed from UUID
    product_id: int   # ✅ Changed from UUID
    user_id: int      # ✅ Changed from UUID
    created_at: datetime
    
    # Optionally include user details if needed by frontend
    user_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)