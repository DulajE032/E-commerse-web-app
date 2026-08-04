from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User
from app.models.order import Order

router = APIRouter()

@router.get("/public")
async def get_public_stats(db: Session = Depends(get_db)):
    """Fetch aggregated public statistics for the landing page."""
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).filter(User.role == "user").scalar() or 0
    
    # We count successful / fulfilled orders
    completed_orders = db.query(func.count(Order.id)).filter(
        Order.status.in_(["confirmed", "shipped", "delivered"])
    ).scalar() or 0

    return {
        "products_count": total_products,
        "customers_count": total_users,
        "successful_orders": completed_orders,
    }
