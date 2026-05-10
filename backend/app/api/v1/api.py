from fastapi import APIRouter

from app.api.v1.endpoints import products, users, visual_search

api_router = APIRouter()
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(
    visual_search.router, prefix="/visual-search", tags=["visual-search"]
)
