import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from app.models.payment import Payment
from app.models.order import Order
from app.models.user import User
from app.models.product import Product
from app.schemas.order import OrderStatus, PaymentStatus, VerifyPaymentRequest, UpdateOrderStatusRequest
from app.api.v1.endpoints.order import (
    generate_bank_reference,
    attach_order_metadata,
    verify_payment,
    update_order_status,
)
from app.services.email_service import (
    send_payment_verified_email,
    send_payment_rejected_email,
)


class MockQuery:
    def __init__(self, item=None):
        self._item = item

    def filter(self, *args, **kwargs):
        return self

    def options(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def first(self):
        return self._item

    def all(self):
        return [self._item] if self._item else []


class MockSession:
    def __init__(self, order=None):
        self.order = order
        self.added = []
        self.committed = False
        self.refreshed = False

    def query(self, model):
        if model == Order:
            return MockQuery(self.order)
        if model == Payment:
            return MockQuery(self.order.payment if self.order else None)
        return MockQuery(None)

    def add(self, item):
        self.added.append(item)

    def commit(self):
        self.committed = True

    def refresh(self, item):
        self.refreshed = True


# ==========================================
# TEST CASE 1: Bank Reference Generation
# ==========================================
def test_bank_reference_generation_format():
    """Test Case 1: Reference conforms to BT-YYYYMMDD-XXXXXX format and uses date."""
    class DummyDB:
        def query(self, *args):
            return self
        def filter(self, *args):
            return self
        def first(self):
            return None

    ref = generate_bank_reference(DummyDB())
    assert ref.startswith("BT-")
    parts = ref.split("-")
    assert len(parts) == 3
    assert len(parts[1]) == 8
    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    assert parts[1] == today_str
    assert len(parts[2]) == 6


# ==========================================
# TEST CASE 2: 2-Hour Cancellation Window
# ==========================================
def test_cancellation_window_allowed_within_two_hours():
    """Test Case 2a: Customer can cancel within 2 hours of placement."""
    now = datetime.now(timezone.utc)
    order = Order(
        id=101,
        user_id=1,
        status="pending_verification",
        payment_status="pending",
        payment_method="bank_transfer",
        total_amount=150.0,
        email="customer@example.com",
        created_at=now - timedelta(minutes=45),
    )
    meta = attach_order_metadata(order)
    assert meta.can_cancel is True


def test_cancellation_window_blocked_after_two_hours():
    """Test Case 2b: Customer cannot cancel after 2 hours have passed."""
    now = datetime.now(timezone.utc)
    order = Order(
        id=102,
        user_id=1,
        status="pending_verification",
        payment_status="pending",
        payment_method="bank_transfer",
        total_amount=150.0,
        email="customer@example.com",
        created_at=now - timedelta(hours=2, minutes=5),
    )
    meta = attach_order_metadata(order)
    assert meta.can_cancel is False


def test_cancellation_blocked_for_terminal_status():
    """Test Case 2c: Cannot cancel shipped, delivered, or cancelled orders."""
    now = datetime.now(timezone.utc)
    for term_status in ["shipped", "delivered", "cancelled"]:
        order = Order(
            id=103,
            user_id=1,
            status=term_status,
            payment_status="paid",
            payment_method="cod",
            total_amount=80.0,
            email="customer@example.com",
            created_at=now - timedelta(minutes=15),
        )
        meta = attach_order_metadata(order)
        assert meta.can_cancel is False


# ==========================================
# TEST CASE 3: Admin Approve Bank Payment
# ==========================================
@pytest.mark.anyio
async def test_admin_verify_payment_approval():
    """Test Case 3: Admin approves bank transfer -> Order CONFIRMED & Payment VERIFIED."""
    order = Order(
        id=201,
        user_id=5,
        status=OrderStatus.SLIP_UPLOADED.value,
        payment_status=PaymentStatus.PENDING.value,
        payment_method="bank_transfer",
        bank_reference="BT-20260923-ABCDEF",
        total_amount=250.0,
        email="buyer@example.com",
        created_at=datetime.now(timezone.utc),
    )
    payment = Payment(
        id=10,
        order_id=201,
        user_id=5,
        payment_method="BANK_TRANSFER",
        reference_number="BT-20260923-ABCDEF",
        amount=250.0,
        status="SUBMITTED",
        created_at=datetime.now(timezone.utc),
    )
    order.payment = payment

    db = MockSession(order)
    admin_user = User(id=99, role="admin", email="admin@store.com")
    bg_tasks = MagicMock()

    req = VerifyPaymentRequest(is_approved=True, admin_notes="Slip matches exact amount.")

    result = await verify_payment(
        order_id=201,
        request_data=req,
        background_tasks=bg_tasks,
        db=db,
        admin_user=admin_user,
    )

    assert result.status == OrderStatus.CONFIRMED.value
    assert result.payment_status == PaymentStatus.PAID.value
    assert payment.status == "VERIFIED"
    assert payment.verified_at is not None
    assert payment.verified_by == 99
    assert payment.admin_notes == "Slip matches exact amount."
    assert db.committed is True
    # Background email task queued
    bg_tasks.add_task.assert_called_once()
    assert bg_tasks.add_task.call_args[0][0] == send_payment_verified_email


# ==========================================
# TEST CASE 4: Admin Reject Bank Payment (Amount Mismatch)
# ==========================================
@pytest.mark.anyio
async def test_admin_verify_payment_rejection():
    """Test Case 4: Admin rejects bank transfer -> Order PAYMENT_REJECTED & Payment REJECTED."""
    order = Order(
        id=202,
        user_id=6,
        status=OrderStatus.SLIP_UPLOADED.value,
        payment_status=PaymentStatus.PENDING.value,
        payment_method="bank_transfer",
        bank_reference="BT-20260923-123456",
        total_amount=300.0,
        email="buyer2@example.com",
        created_at=datetime.now(timezone.utc),
    )
    payment = Payment(
        id=11,
        order_id=202,
        user_id=6,
        payment_method="BANK_TRANSFER",
        reference_number="BT-20260923-123456",
        amount=300.0,
        status="SUBMITTED",
        created_at=datetime.now(timezone.utc),
    )
    order.payment = payment

    db = MockSession(order)
    admin_user = User(id=99, role="admin", email="admin@store.com")
    bg_tasks = MagicMock()

    rejection_note = "Amount mismatch: expected $300.00 but slip shows $150.00."
    req = VerifyPaymentRequest(is_approved=False, admin_notes=rejection_note)

    result = await verify_payment(
        order_id=202,
        request_data=req,
        background_tasks=bg_tasks,
        db=db,
        admin_user=admin_user,
    )

    assert result.status == OrderStatus.PAYMENT_REJECTED.value
    assert result.payment_status == PaymentStatus.FAILED.value
    assert payment.status == "REJECTED"
    assert payment.verified_at is None
    assert payment.verified_by == 99
    assert payment.admin_notes == rejection_note
    assert db.committed is True
    # Background rejection email task queued
    bg_tasks.add_task.assert_called_once()
    assert bg_tasks.add_task.call_args[0][0] == send_payment_rejected_email


# ==========================================
# TEST CASE 5: COD Auto-Verification on Delivery
# ==========================================
@pytest.mark.anyio
async def test_cod_order_auto_verified_on_delivery():
    """Test Case 5: When COD order is delivered, payment automatically verified."""
    order = Order(
        id=301,
        user_id=8,
        status=OrderStatus.SHIPPED.value,
        payment_status=PaymentStatus.PENDING.value,
        payment_method="cod",
        total_amount=95.0,
        email="codbuyer@example.com",
        created_at=datetime.now(timezone.utc),
    )
    payment = Payment(
        id=12,
        order_id=301,
        user_id=8,
        payment_method="COD",
        amount=95.0,
        status="PENDING",
        created_at=datetime.now(timezone.utc),
    )
    order.payment = payment

    db = MockSession(order)
    admin_user = User(id=99, role="admin")

    req = UpdateOrderStatusRequest(status=OrderStatus.DELIVERED)
    result = await update_order_status(
        order_id=301,
        body=req,
        db=db,
        admin_user=admin_user,
    )

    assert result.status == OrderStatus.DELIVERED.value
    assert result.payment_status == PaymentStatus.PAID.value
    assert payment.status == "VERIFIED"
    assert payment.verified_at is not None
    assert db.committed is True


# ==========================================
# TEST CASE 6: COD Shipped Does Not Auto-Verify
# ==========================================
@pytest.mark.anyio
async def test_cod_order_shipped_does_not_verify_payment():
    """Test Case 6: Marking COD shipped leaves payment PENDING."""
    order = Order(
        id=302,
        user_id=9,
        status=OrderStatus.CONFIRMED.value,
        payment_status=PaymentStatus.PENDING.value,
        payment_method="cod",
        total_amount=120.0,
        email="codbuyer2@example.com",
        created_at=datetime.now(timezone.utc),
    )
    payment = Payment(
        id=13,
        order_id=302,
        user_id=9,
        payment_method="COD",
        amount=120.0,
        status="PENDING",
        created_at=datetime.now(timezone.utc),
    )
    order.payment = payment

    db = MockSession(order)
    admin_user = User(id=99, role="admin")

    req = UpdateOrderStatusRequest(status=OrderStatus.SHIPPED)
    result = await update_order_status(
        order_id=302,
        body=req,
        db=db,
        admin_user=admin_user,
    )

    assert result.status == OrderStatus.SHIPPED.value
    assert result.payment_status == PaymentStatus.PENDING.value
    assert payment.status == "PENDING"
    assert payment.verified_at is None
