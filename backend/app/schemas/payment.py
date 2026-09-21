from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PaymentMethodEnum(str, Enum):
    COD = "cod"
    BANK_TRANSFER = "bank_transfer"


class PaymentStatusEnum(str, Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    user_id: int
    payment_method: str
    reference_number: Optional[str] = None
    amount: float
    bank_slip_url: Optional[str] = None
    payment_instructions_pdf: Optional[str] = None
    status: str
    created_at: datetime
    verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class VerifyPaymentActionRequest(BaseModel):
    is_approved: bool
    notes: Optional[str] = None

    model_config = ConfigDict(extra="forbid")
