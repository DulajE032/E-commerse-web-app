from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PENDING_VERIFICATION = "pending_verification"
    SLIP_UPLOADED = "slip_uploaded"
    PAYMENT_REJECTED = "payment_rejected"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    CARD = "card"
    PAYPAL = "paypal"
    COD = "cod"
    BANK_TRANSFER = "bank_transfer"


class OrderItemSchema(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int = Field(..., gt=0)
    image: Optional[str] = None


class ShippingAddressSchema(BaseModel):
    first_name: str
    last_name: str
    street: str
    city: str
    state: str
    zip_code: str


class CreateOrderRequest(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    payment_method: PaymentMethod
    shipping_address: ShippingAddressSchema
    items: list[OrderItemSchema]
    shipping_cost: float = 15.0
    tax_amount: float = 0.0
    turnstile_token: Optional[str] = None


class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus

    model_config = ConfigDict(extra="forbid")


class VerifyPaymentRequest(BaseModel):
    is_approved: bool

    model_config = ConfigDict(extra="forbid")


class OrderResponse(BaseModel):
    id: int
    status: str
    payment_status: str
    payment_method: str
    total_amount: float
    shipping_cost: float
    tax_amount: float
    items: Optional[list[Any]] = None
    shipping_address: Optional[dict[str, Any]] = None
    email: str
    phone: Optional[str] = None
    bank_slip_url: Optional[str] = None
    created_at: datetime
    client_secret: Optional[str] = None  # Only for card payments

    model_config = ConfigDict(from_attributes=True)
