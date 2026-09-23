import os
import uuid
import secrets
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.security import get_current_user, require_role
from app.db.session import get_db
from app.models.order import Order
from app.models.payment import Payment
from app.models.product import Product
from app.schemas.order import (
    CreateOrderRequest,
    OrderResponse,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    UpdateOrderStatusRequest,
    VerifyPaymentRequest,
)
from app.services.email_service import (
    send_admin_new_order_email,
    send_bank_transfer_instructions_email,
)
from app.api.v1.endpoints.notification import create_notification

logger = logging.getLogger(__name__)

router = APIRouter()


def generate_bank_reference(db: Session) -> str:
    """Generate a unique reference number: BT-YYYYMMDD-XXXXXX."""
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    for _ in range(10):
        random_suffix = secrets.token_hex(3).upper()  # 6 characters
        ref = f"BT-{date_str}-{random_suffix}"
        # Check uniqueness in both Order and Payment
        exists = db.query(Payment).filter(Payment.reference_number == ref).first()
        if not exists:
            return ref
    # Fallback with uuid if collision persists
    return f"BT-{date_str}-{uuid.uuid4().hex[:6].upper()}"


def attach_order_metadata(order: Order) -> OrderResponse:
    """Compute helper fields like can_cancel and populate OrderResponse."""
    now = datetime.now(timezone.utc)
    order_created = order.created_at
    if order_created.tzinfo is None:
        order_created = order_created.replace(tzinfo=timezone.utc)
    elapsed_seconds = (now - order_created).total_seconds()

    # Can cancel if within 2 hours (7200s) and not in final states
    terminal_statuses = {
        OrderStatus.SHIPPED.value,
        OrderStatus.DELIVERED.value,
        OrderStatus.CANCELLED.value,
    }
    can_cancel = (order.status not in terminal_statuses) and (elapsed_seconds <= 7200)

    resp = OrderResponse.model_validate(order)
    resp.can_cancel = can_cancel
    return resp


@router.post("/", response_model=OrderResponse)
async def create_order(
    request: Request,
    order_data: CreateOrderRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a new order supporting COD and Bank Transfer only."""
    # 1. Validate stock and build authoritative order lines from DB prices
    normalized_items = []
    subtotal = 0.0

    for item in order_data.items:
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

    # 2. Determine reference and statuses
    bank_reference = None
    if order_data.payment_method == PaymentMethod.BANK_TRANSFER:
        bank_reference = generate_bank_reference(db)
        initial_order_status = OrderStatus.PENDING_VERIFICATION.value
        initial_payment_status = PaymentStatus.PENDING.value
        payment_record_status = "PENDING"
    else:  # COD
        initial_order_status = OrderStatus.CONFIRMED.value
        initial_payment_status = PaymentStatus.PENDING.value
        payment_record_status = "PENDING"

    # 3. Create Order
    new_order = Order(
        user_id=current_user.id,
        email=order_data.email,
        phone=order_data.phone,
        payment_method=order_data.payment_method.value,
        payment_status=initial_payment_status,
        bank_reference=bank_reference,
        status=initial_order_status,
        total_amount=total,
        shipping_cost=order_data.shipping_cost,
        tax_amount=order_data.tax_amount,
        shipping_address=order_data.shipping_address.model_dump(),
        items=normalized_items,
    )
    db.add(new_order)
    db.flush()

    # 4. Create separate Payment record
    new_payment = Payment(
        order_id=new_order.id,
        user_id=current_user.id,
        payment_method=order_data.payment_method.value.upper(),
        reference_number=bank_reference,
        amount=total,
        status=payment_record_status,
    )
    db.add(new_payment)

    # 5. In-app notification for order placement
    create_notification(
        db=db,
        user_id=current_user.id,
        title="Order Placed Successfully",
        message=(
            f"Your order #{new_order.id} has been placed. "
            + (f"Your bank payment reference is {bank_reference}." if bank_reference else "Payment will be collected upon delivery.")
        ),
        type="order_placed",
        order_id=new_order.id,
    )

    db.commit()
    db.refresh(new_order)

    # 6. Background email tasks
    background_tasks.add_task(
        send_admin_new_order_email,
        new_order.id,
        new_order.email,
        new_order.total_amount,
    )
    if bank_reference:
        background_tasks.add_task(
            send_bank_transfer_instructions_email,
            new_order.email,
            new_order.id,
            bank_reference,
            new_order.total_amount,
        )

    return attach_order_metadata(new_order)


@router.patch("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Cancel order within 2 hours of placement. Restores inventory stock."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    # Disallow cancelling if already shipped, delivered, or cancelled
    if order.status in [OrderStatus.SHIPPED.value, OrderStatus.DELIVERED.value, OrderStatus.CANCELLED.value]:
        raise HTTPException(
            status_code=400,
            detail=f"Order cannot be cancelled because it is already {order.status}.",
        )

    # 2-hour cancellation window enforcement
    now = datetime.now(timezone.utc)
    order_created = order.created_at
    if order_created.tzinfo is None:
        order_created = order_created.replace(tzinfo=timezone.utc)
    elapsed_seconds = (now - order_created).total_seconds()

    if current_user.role != "admin" and elapsed_seconds > 7200:
        raise HTTPException(
            status_code=403,
            detail="Order cancellation window has expired (orders can only be cancelled within 2 hours of placement).",
        )

    # Restore inventory stock
    if order.items:
        for item in order.items:
            prod_id = item.get("product_id")
            qty = item.get("quantity", 0)
            if prod_id and qty > 0:
                product = db.query(Product).filter(Product.id == prod_id).first()
                if product:
                    product.stock += qty
                    product.sales_count = max(0, product.sales_count - qty)

    order.status = OrderStatus.CANCELLED.value
    if order.payment:
        order.payment.status = "REJECTED"

    create_notification(
        db=db,
        user_id=order.user_id,
        title="Order Cancelled",
        message=f"Your order #{order.id} has been cancelled.",
        type="order_cancelled",
        order_id=order.id,
    )

    db.commit()
    db.refresh(order)
    return attach_order_metadata(order)


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

    slip_url = f"/uploads/slips/{filename}"
    order.bank_slip_url = slip_url
    order.status = OrderStatus.SLIP_UPLOADED.value

    # Sync Payment model
    if order.payment:
        order.payment.bank_slip_url = slip_url
        order.payment.status = "SUBMITTED"

    create_notification(
        db=db,
        user_id=order.user_id,
        title="Payment Slip Uploaded",
        message=f"Your bank transfer slip for Order #{order.id} was uploaded and is awaiting admin review.",
        type="slip_uploaded",
        order_id=order.id,
    )

    db.commit()
    db.refresh(order)
    return attach_order_metadata(order)


@router.patch("/{order_id}/verify-payment", response_model=OrderResponse)
async def verify_payment(
    order_id: int,
    request_data: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("admin")),
):
    """Verify or reject a bank transfer order payment (admin endpoint)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    is_approved = request_data.is_approved
    if is_approved:
        order.payment_status = PaymentStatus.PAID.value
        order.status = OrderStatus.CONFIRMED.value
        if order.payment:
            order.payment.status = "VERIFIED"
            order.payment.verified_at = datetime.now(timezone.utc)

        create_notification(
            db=db,
            user_id=order.user_id,
            title="Payment Verified",
            message=f"Your bank transfer payment for Order #{order.id} has been verified! Order is confirmed.",
            type="payment_verified",
            order_id=order.id,
        )
    else:
        order.payment_status = PaymentStatus.FAILED.value
        order.status = OrderStatus.PAYMENT_REJECTED.value
        if order.payment:
            order.payment.status = "REJECTED"

        create_notification(
            db=db,
            user_id=order.user_id,
            title="Payment Slip Rejected",
            message=f"Your payment slip for Order #{order.id} could not be verified. Please re-upload or contact support.",
            type="payment_rejected",
            order_id=order.id,
        )

    db.commit()
    db.refresh(order)
    return attach_order_metadata(order)


@router.get("/", response_model=list[OrderResponse])
async def get_all_orders(
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("admin")),
):
    """Get all orders (admin endpoint)."""
    orders = (
        db.query(Order)
        .options(joinedload(Order.payment))
        .order_by(Order.created_at.desc())
        .all()
    )
    return [attach_order_metadata(o) for o in orders]


@router.get("/me", response_model=list[OrderResponse])
async def get_my_orders(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get orders for the currently logged-in user."""
    query = (
        db.query(Order)
        .options(joinedload(Order.payment))
        .filter(Order.user_id == current_user.id)
    )
    if status:
        query = query.filter(Order.status == status)
    orders = query.order_by(Order.created_at.desc()).all()
    return [attach_order_metadata(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get a specific order by ID."""
    order = (
        db.query(Order)
        .options(joinedload(Order.payment))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return attach_order_metadata(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    body: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
    admin_user=Depends(require_role("admin")),
):
    """Update order status (admin endpoint) with in-app notification triggers."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = body.status.value
    order.status = new_status

    # Trigger contextual notifications
    if new_status == OrderStatus.CONFIRMED.value:
        create_notification(
            db=db,
            user_id=order.user_id,
            title="Order Confirmed",
            message=f"Your order #{order.id} has been confirmed and is being prepared.",
            type="order_confirmed",
            order_id=order.id,
        )
    elif new_status == OrderStatus.SHIPPED.value:
        create_notification(
            db=db,
            user_id=order.user_id,
            title="Order Shipped",
            message=f"Your order #{order.id} has been shipped! It is on its way to your address.",
            type="order_shipped",
            order_id=order.id,
        )
    elif new_status == OrderStatus.DELIVERED.value:
        create_notification(
            db=db,
            user_id=order.user_id,
            title="Order Delivered",
            message=f"Your order #{order.id} has been delivered! Please share your feedback with us in your dashboard.",
            type="order_delivered",
            order_id=order.id,
        )

    db.commit()
    db.refresh(order)
    return attach_order_metadata(order)
