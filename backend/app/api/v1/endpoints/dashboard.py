from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.models.order import Order
from app.models.product import Product
from app.models.user import User

router = APIRouter()


def _month_start(date: datetime, months_back: int) -> datetime:
    year = date.year
    month = date.month - months_back
    while month <= 0:
        month += 12
        year -= 1
    return datetime(year=year, month=month, day=1)


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("admin")),
):
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0
    total_customers = db.query(func.count(User.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar() or 0

    orders_by_status = dict(
        db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    )

    now = datetime.utcnow()
    revenue_by_month = []
    for months_back in range(5, -1, -1):
        month_start = _month_start(now, months_back)
        revenue = (
            db.query(func.coalesce(func.sum(Order.total_amount), 0))
            .filter(extract("year", Order.created_at) == month_start.year)
            .filter(extract("month", Order.created_at) == month_start.month)
            .scalar()
            or 0
        )
        revenue_by_month.append(
            {
                "month": month_start.strftime("%b"),
                "revenue": float(revenue),
            }
        )

    recent_orders = (
        db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    )
    recent_orders_data = [
        {
            "id": order.id,
            "customer": order.email,
            "total": order.total_amount,
            "status": order.status,
            "date": order.created_at.isoformat(),
        }
        for order in recent_orders
    ]

    return {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "total_customers": total_customers,
        "total_products": total_products,
        "orders_by_status": orders_by_status,
        "revenue_by_month": revenue_by_month,
        "recent_orders": recent_orders_data,
    }
