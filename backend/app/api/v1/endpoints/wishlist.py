from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.wishlist import (
    CampaignResult,
    TrendingProductRead,
    UserWishlistDetail,
    UserWishlistSummary,
    WishlistAdd,
    WishlistBulkSync,
    WishlistIdsResponse,
    WishlistItemRead,
    WishlistToggle,
    WishlistToggleResponse,
)
from app.services import crud_wishlist
from app.services.crud_product import get_product

router = APIRouter()


# ──────────────────────────────────────────────
# User-facing endpoints (require authentication)
# ──────────────────────────────────────────────


@router.get("/", response_model=list[WishlistItemRead])
def get_my_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's full wishlist with product details."""
    return crud_wishlist.get_user_wishlist(db, current_user.id)


@router.get("/ids", response_model=WishlistIdsResponse)
def get_my_wishlist_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get just the product IDs in the current user's wishlist (lightweight)."""
    ids = crud_wishlist.get_user_wishlist_ids(db, current_user.id)
    return WishlistIdsResponse(product_ids=ids)


@router.post("/", response_model=WishlistItemRead, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    payload: WishlistAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a product to the current user's wishlist."""
    product = get_product(db=db, product_id=payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    item = crud_wishlist.add_to_wishlist(db, current_user.id, payload.product_id)
    return item


@router.post("/toggle", response_model=WishlistToggleResponse)
def toggle_wishlist(
    payload: WishlistToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle a product in/out of the current user's wishlist."""
    product = get_product(db=db, product_id=payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    result = crud_wishlist.toggle_wishlist(db, current_user.id, payload.product_id)
    return WishlistToggleResponse(status=result, product_id=payload.product_id)


@router.post("/sync")
def sync_wishlist(
    payload: WishlistBulkSync,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sync guest localStorage wishlist items to the server after login."""
    added = crud_wishlist.bulk_sync_wishlist(db, current_user.id, payload.product_ids)
    ids = crud_wishlist.get_user_wishlist_ids(db, current_user.id)
    return {"synced": added, "product_ids": ids}


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    product_id: int = Path(..., gt=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a product from the current user's wishlist."""
    success = crud_wishlist.remove_from_wishlist(db, current_user.id, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    return None


# ──────────────────────────────────────────────
# Admin-facing endpoints (require admin role)
# ──────────────────────────────────────────────


@router.get("/admin/trending", response_model=list[TrendingProductRead])
def get_trending(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Get products ranked by wishlist popularity — admin only."""
    return crud_wishlist.get_trending_products(db, limit=50)


@router.get("/admin/users", response_model=list[UserWishlistSummary])
def get_users_with_wishlists(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Get all users who have wishlist items — admin only."""
    return crud_wishlist.get_all_users_with_wishlists(db)


@router.get("/admin/users/{user_id}", response_model=UserWishlistDetail)
def get_user_wishlist(
    user_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Get a specific user's wishlist — admin only."""
    from app.services.crud_user import get_user_by_id

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    items = crud_wishlist.get_user_wishlist(db, user_id)
    return UserWishlistDetail(
        user_id=user.id,
        user_name=user.full_name,
        user_email=user.email,
        items=items,
    )


@router.post("/admin/campaign/{product_id}", response_model=CampaignResult)
def send_campaign(
    product_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Simulate sending a discount email to all users who wishlisted a product."""
    product = get_product(db=db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    users = crud_wishlist.get_wishlist_users_for_product(db, product_id)

    # In a real app, this is where you'd queue emails via Celery / SES / SendGrid.
    # For now, we simulate success.
    return CampaignResult(
        product_id=product.id,
        product_name=product.name,
        users_notified=len(users),
        user_emails=[u["user_email"] for u in users],
    )
