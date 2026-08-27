import os
import uuid
import stripe
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import (
    CreateOrderRequest,
    OrderResponse,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    UpdateOrderStatusRequest,
)
from app.services.email_service import send_admin_new_order_email
from app.services.turnstile import verify_turnstile_token

router = APIRouter()

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/", response_model=OrderResponse)
async def create_order(
    request: Request,
    order_data: CreateOrderRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a new order and (if card payment) create a Stripe PaymentIntent."""
    # Verify Cloudflare Turnstile token
    if not await verify_turnstile_token(order_data.turnstile_token or "", request.client.host if request.client else None):
        raise HTTPException(status_code=400, detail="Bot verification failed. Please try again.")

    # 1. Validate stock and build authoritative order lines from DB prices.
    normalized_items = []
    subtotal = 0.0

    for item in order_data.items:
        # Use with_for_update to prevent race conditions on stock check
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
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
        payment_method=order_data.payment_method.value,
        payment_status=PaymentStatus.PENDING.value,
        status=OrderStatus.PENDING.value,
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
    if order_data.payment_method == PaymentMethod.CARD:
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

    # 4. Handle initial status for alternative payment methods
    if order_data.payment_method == PaymentMethod.COD:
        new_order.status = OrderStatus.CONFIRMED.value
    elif order_data.payment_method == PaymentMethod.BANK_TRANSFER:
        new_order.status = OrderStatus.PENDING_VERIFICATION.value

    db.commit()
    db.refresh(new_order)

    # Send email notification to admin in background
    background_tasks.add_task(
        send_admin_new_order_email,
        new_order.id,
        new_order.email,
        new_order.total_amount,
    )
    
    # 5. Return order with client_secret (for card payments)
    response = OrderResponse.model_validate(new_order)
    response.client_secret = client_secret
    return response


ALLOWED_SLIP_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}
SLIP_UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "slips")
os.makedirs(SLIP_UPLOAD_DIR, exist_ok=True)


@router.post("/{order_id}/upload-slip", response_model=OrderResponse)
async def upload_bank_slip(
    order_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Upload a bank transfer payment slip (Image or PDF)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this order")

    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_SLIP_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format '{ext}'. Allowed formats: {', '.join(ALLOWED_SLIP_EXTENSIONS)}",
        )

    filename = f"slip_{order_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(SLIP_UPLOAD_DIR, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    order.bank_slip_url = f"/uploads/slips/{filename}"
    order.status = OrderStatus.SLIP_UPLOADED.value
    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/verify-payment", response_model=OrderResponse)
async def verify_payment(
    order_id: int,
    is_approved: bool,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("admin")),
):
    """Verify or reject a bank transfer order payment (admin endpoint)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if is_approved:
        order.payment_status = PaymentStatus.PAID.value
        order.status = OrderStatus.CONFIRMED.value
    else:
        order.payment_status = PaymentStatus.FAILED.value
        order.status = OrderStatus.PAYMENT_REJECTED.value

    db.commit()
    db.refresh(order)
    return order


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


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    body: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("admin")),
):
    """Update order status (admin endpoint) with enum validation."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = body.status.value
    db.commit()
    db.refresh(order)
    return order
