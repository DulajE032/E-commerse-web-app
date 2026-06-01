from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OrderItemSchema(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    image: Optional[str] = None


class ShippingAddressSchema(BaseModel):
    first_name: str
    last_name: str
    street: str
    city: str
    state: str
    zip_code: str


class CreateOrderRequest(BaseModel):
    email: str
    phone: Optional[str] = None
    payment_method: str  # "card", "paypal", "cod"
    shipping_address: ShippingAddressSchema
    items: list[OrderItemSchema]
    shipping_cost: float = 15.0
    tax_amount: float = 0.0


class OrderResponse(BaseModel):
    id: int
    status: str
    payment_status: str
    payment_method: str
    total_amount: float
    shipping_cost: float
    tax_amount: float
    items: list
    shipping_address: dict
    email: str
    created_at: datetime
    client_secret: Optional[str] = None  # Only for card payments

    class Config:
        from_attributes = True
