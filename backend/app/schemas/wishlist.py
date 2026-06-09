from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductRead


class WishlistAdd(BaseModel):
    product_id: int

    model_config = ConfigDict(extra="forbid")


class WishlistToggle(BaseModel):
    product_id: int

    model_config = ConfigDict(extra="forbid")


class WishlistBulkSync(BaseModel):
    product_ids: List[int]

    model_config = ConfigDict(extra="forbid")


class WishlistItemRead(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)


class WishlistToggleResponse(BaseModel):
    status: str  # "added" or "removed"
    product_id: int


class WishlistIdsResponse(BaseModel):
    product_ids: List[int]


class TrendingProductRead(BaseModel):
    product: ProductRead
    wishlist_count: int
    stock: int


class UserWishlistSummary(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    item_count: int


class UserWishlistDetail(BaseModel):
    user_id: int
    user_name: str
    user_email: str
    items: List[WishlistItemRead]


class CampaignResult(BaseModel):
    product_id: int
    product_name: str
    users_notified: int
    user_emails: List[str]
