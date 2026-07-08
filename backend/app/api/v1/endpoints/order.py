import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role
from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import CreateOrderRequest, OrderResponse

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a new order and (if card payment) create a Stripe PaymentIntent."""
    # 1. Validate stock and build authoritative order lines from DB prices.
    normalized_items = []
    subtotal = 0.0

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Product with ID {item.product_id} not found.",
            )
        if product.stock < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. "
                f"Requested {item.quantity}, but only {product.stock} available.",
            )

        unit_price = (
            product.discount_price
            if product.discount_price is not None
            and product.discount_price > 0
            and product.discount_price < product.price
            else product.price
        )

        subtotal += unit_price * item.quantity
        product.sales_count += item.quantity
        product.stock -= item.quantity

        normalized_items.append(
            {
                "product_id": product.id,
                "name": product.name,
                "price": unit_price,
                "quantity": item.quantity,
                "image": product.images[0] if product.images else None,
            }
        )

    total = subtotal + order_data.shipping_cost + order_data.tax_amount

    # 2. Create the order in database with server-authoritative item data.
    new_order = Order(
        user_id=current_user.id,
        email=order_data.email,
        phone=order_data.phone,
        payment_method=order_data.payment_method,
        payment_status="pending",
        status="pending",
        total_amount=total,
        shipping_cost=order_data.shipping_cost,
        tax_amount=order_data.tax_amount,
        shipping_address=order_data.shipping_address.model_dump(),
        items=normalized_items,
    )

    db.add(new_order)
    db.flush()

    client_secret = None

    # 3. If paying by card, create Stripe PaymentIntent
    if order_data.payment_method == "card":
        if not settings.STRIPE_SECRET_KEY:
            raise HTTPException(
                status_code=500, detail="Stripe secret key not configured"
            )
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(total * 100),  # Stripe uses cents
                currency="usd",
                metadata={"order_id": str(new_order.id)},
            )
            new_order.stripe_payment_intent_id = intent.id
            client_secret = intent.client_secret
        except stripe.error.StripeError as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    # 4. For COD, mark as confirmed immediately
    if order_data.payment_method == "cod":
        new_order.status = "confirmed"

    db.commit()
    db.refresh(new_order)
    
    # 5. Return order with client_secret (for card payments)
    response = OrderResponse.model_validate(new_order)
    response.client_secret = client_secret
    return response


@router.get("/", response_model=list[OrderResponse])
async def get_all_orders(
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("admin")),
):
    """Get all orders (admin endpoint)."""
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders


@router.get("/me", response_model=list[OrderResponse])
async def get_my_orders(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get orders for the currently logged-in user."""
    query = db.query(Order).filter(Order.user_id == current_user.id)
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get a specific order by ID."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return order


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("admin")),
):
    """Update order status (admin endpoint)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    db.commit()
    return {"message": f"Order #{order_id} status updated to '{status}'"}
