from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    products,
    users,
    visual_search,
    categories,
    upload,
    order,
    webhook,
    dashboard,
    wishlist,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(
    visual_search.router, prefix="/visual-search", tags=["visual-search"]
)
api_router.include_router(order.router, prefix="/orders", tags=["orders"])
api_router.include_router(webhook.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
