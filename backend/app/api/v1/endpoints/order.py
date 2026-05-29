import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.order import Order
from app.schemas.order import CreateOrderRequest, OrderResponse
from app.core.config import settings  # You'll need to add STRIPE_SECRET_KEY here

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: CreateOrderRequest,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)  # Add auth dependency
):
    """Create a new order and (if card payment) create a Stripe PaymentIntent."""
    
    # 1. Calculate total
    subtotal = sum(item.price * item.quantity for item in order_data.items)
    total = subtotal + order_data.shipping_cost + order_data.tax_amount
    
    # 2. Create the order in database
    new_order = Order(
        user_id=1,  # Replace with current_user.id
        email=order_data.email,
        phone=order_data.phone,
        payment_method=order_data.payment_method,
        payment_status="pending",
        status="pending",
        total_amount=total,
        shipping_cost=order_data.shipping_cost,
        tax_amount=order_data.tax_amount,
        shipping_address=order_data.shipping_address.model_dump(),
        items=[item.model_dump() for item in order_data.items],
    )
    
    client_secret = None
    
    # 3. If paying by card, create Stripe PaymentIntent
    if order_data.payment_method == "card":
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(total * 100),  # Stripe uses cents
                currency="usd",
                metadata={"order_id": str(new_order.id) if new_order.id else "pending"},
            )
            new_order.stripe_payment_intent_id = intent.id
            client_secret = intent.client_secret
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    # 4. For COD, mark as confirmed immediately
    if order_data.payment_method == "cod":
        new_order.status = "confirmed"
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # 5. Return order with client_secret (for card payments)
    response = OrderResponse.model_validate(new_order)
    response.client_secret = client_secret
    return response


@router.get("/", response_model=list[OrderResponse])
async def get_all_orders(
    db: Session = Depends(get_db),
    # admin_user = Depends(get_admin_user)  # Admin only
):
    """Get all orders (admin endpoint)."""
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a specific order by ID."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
):
    """Update order status (admin endpoint)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    db.commit()
    return {"message": f"Order #{order_id} status updated to '{status}'"}
