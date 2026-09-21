from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    products,
    users,
    categories,
    upload,
    order,
    notification,
    feedback,
    dashboard,
    wishlist,
    stats,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(order.router, prefix="/orders", tags=["orders"])
api_router.include_router(notification.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
