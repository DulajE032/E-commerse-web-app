from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AdminResponseItem(BaseModel):
    id: int
    feedback_id: int
    admin_id: int
    admin_name: Optional[str] = None
    response: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateFeedbackResponseRequest(BaseModel):
    response: str = Field(..., min_length=2, max_length=2000)

    model_config = ConfigDict(extra="forbid")


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3, max_length=2000)

    model_config = ConfigDict(extra="forbid")


class FeedbackResponseSchema(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    order_id: int
    rating: int
    comment: str
    is_featured: bool
    status: str
    created_at: datetime
    responses: list[AdminResponseItem] = []

    model_config = ConfigDict(from_attributes=True)


class FeaturedFeedbackItem(BaseModel):
    id: int
    user_name: str
    rating: int
    comment: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeatureToggleRequest(BaseModel):
    is_featured: bool

    model_config = ConfigDict(extra="forbid")
