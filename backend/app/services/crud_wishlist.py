from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.user import User
from app.models.wishlist import Wishlist


def add_to_wishlist(db: Session, user_id: int, product_id: int) -> Wishlist | None:
    """Add a product to the user's wishlist. Returns None if already exists."""
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        .first()
    )
    if existing:
        return existing

    item = Wishlist(user_id=user_id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def remove_from_wishlist(db: Session, user_id: int, product_id: int) -> bool:
    """Remove a product from the user's wishlist. Returns True if deleted."""
    row = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        .first()
    )
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def get_user_wishlist(db: Session, user_id: int) -> list[Wishlist]:
    """Get all wishlist items for a user, with joined product data."""
    return (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )


def get_user_wishlist_ids(db: Session, user_id: int) -> list[int]:
    """Get just the product IDs in a user's wishlist (lightweight)."""
    rows = (
        db.query(Wishlist.product_id)
        .filter(Wishlist.user_id == user_id)
        .all()
    )
    return [r[0] for r in rows]


def is_in_wishlist(db: Session, user_id: int, product_id: int) -> bool:
    """Check if a product is in the user's wishlist."""
    return (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        .first()
        is not None
    )


def toggle_wishlist(db: Session, user_id: int, product_id: int) -> str:
    """Toggle a product in the wishlist. Returns 'added' or 'removed'."""
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return "removed"
    else:
        item = Wishlist(user_id=user_id, product_id=product_id)
        db.add(item)
        db.commit()
        return "added"


def bulk_sync_wishlist(db: Session, user_id: int, product_ids: list[int]) -> int:
    """Sync guest localStorage wishlist items to the database.
    Returns the number of newly added items.
    """
    existing_ids = set(get_user_wishlist_ids(db, user_id))
    added = 0
    for pid in product_ids:
        if pid not in existing_ids:
            # Verify the product exists
            product = db.query(Product).filter(Product.id == pid).first()
            if product:
                item = Wishlist(user_id=user_id, product_id=pid)
                db.add(item)
                existing_ids.add(pid)
                added += 1
    if added:
        db.commit()
    return added


def get_trending_products(db: Session, limit: int = 20) -> list[dict]:
    """Get products ranked by wishlist count, with stock data."""
    results = (
        db.query(
            Product,
            func.count(Wishlist.id).label("wishlist_count"),
        )
        .join(Wishlist, Wishlist.product_id == Product.id)
        .group_by(Product.id)
        .order_by(func.count(Wishlist.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "product": product,
            "wishlist_count": count,
            "stock": product.stock,
        }
        for product, count in results
    ]


def get_all_users_with_wishlists(db: Session) -> list[dict]:
    """Get all users who have at least one wishlist item, with counts."""
    results = (
        db.query(
            User.id,
            User.full_name,
            User.email,
            func.count(Wishlist.id).label("item_count"),
        )
        .join(Wishlist, Wishlist.user_id == User.id)
        .group_by(User.id, User.full_name, User.email)
        .order_by(func.count(Wishlist.id).desc())
        .all()
    )
    return [
        {
            "user_id": uid,
            "user_name": name,
            "user_email": email,
            "item_count": count,
        }
        for uid, name, email, count in results
    ]


def get_wishlist_users_for_product(db: Session, product_id: int) -> list[dict]:
    """Get all users who have a specific product in their wishlist."""
    results = (
        db.query(User.id, User.full_name, User.email)
        .join(Wishlist, Wishlist.user_id == User.id)
        .filter(Wishlist.product_id == product_id)
        .all()
    )
    return [
        {"user_id": uid, "user_name": name, "user_email": email}
        for uid, name, email in results
    ]
