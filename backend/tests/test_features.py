import pytest
from datetime import datetime, timezone, timedelta
from app.models.payment import Payment
from app.models.notification import Notification
from app.models.feedback import Feedback, FeedbackResponse
from app.models.order import Order
from app.models.user import User
from app.api.v1.endpoints.order import generate_bank_reference, attach_order_metadata
from app.api.v1.endpoints.notification import create_notification


def test_bank_reference_format():
    """Verify bank reference follows BT-YYYYMMDD-XXXXXX format."""
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
    assert len(parts[1]) == 8  # YYYYMMDD
    assert len(parts[2]) == 6  # 6-character hex/alphanumeric


def test_order_can_cancel_within_two_hours():
    """Verify order is cancellable when placed within 2 hours."""
    now = datetime.now(timezone.utc)
    order = Order(
        id=1,
        user_id=1,
        status="pending",
        payment_status="pending",
        payment_method="bank_transfer",
        total_amount=100.0,
        shipping_cost=0.0,
        tax_amount=0.0,
        email="test@example.com",
        created_at=now - timedelta(minutes=30),  # 30 mins ago
    )
    meta = attach_order_metadata(order)
    assert meta.can_cancel is True


def test_order_cannot_cancel_after_two_hours():
    """Verify order cannot be cancelled after 2 hours have passed."""
    now = datetime.now(timezone.utc)
    order = Order(
        id=2,
        user_id=1,
        status="pending",
        payment_status="pending",
        payment_method="bank_transfer",
        total_amount=100.0,
        shipping_cost=0.0,
        tax_amount=0.0,
        email="test@example.com",
        created_at=now - timedelta(hours=2, minutes=10),  # 2h 10m ago
    )
    meta = attach_order_metadata(order)
    assert meta.can_cancel is False


def test_order_cannot_cancel_when_shipped_or_delivered():
    """Verify shipped and delivered orders cannot be cancelled even within 2 hours."""
    now = datetime.now(timezone.utc)
    order_shipped = Order(
        id=3,
        user_id=1,
        status="shipped",
        payment_status="paid",
        payment_method="cod",
        total_amount=50.0,
        shipping_cost=0.0,
        tax_amount=0.0,
        email="test@example.com",
        created_at=now - timedelta(minutes=10),
    )
    meta_shipped = attach_order_metadata(order_shipped)
    assert meta_shipped.can_cancel is False

    order_delivered = Order(
        id=4,
        user_id=1,
        status="delivered",
        payment_status="paid",
        payment_method="cod",
        total_amount=50.0,
        shipping_cost=0.0,
        tax_amount=0.0,
        email="test@example.com",
        created_at=now - timedelta(minutes=10),
    )
    meta_delivered = attach_order_metadata(order_delivered)
    assert meta_delivered.can_cancel is False


def test_notification_helper_instantiation():
    """Verify create_notification creates unread notification record."""
    class DummyDB:
        def __init__(self):
            self.added = []
        def add(self, item):
            self.added.append(item)

    db = DummyDB()
    notif = create_notification(
        db=db,
        user_id=42,
        title="Test Title",
        message="Test Message",
        type="order_confirmed",
        order_id=99,
    )
    assert notif.user_id == 42
    assert notif.title == "Test Title"
    assert notif.type == "order_confirmed"
    assert notif.is_read is False
    assert notif in db.added


def test_feedback_and_response_models():
    """Verify Feedback and FeedbackResponse relationships."""
    fb = Feedback(
        id=10,
        user_id=5,
        order_id=20,
        rating=5,
        comment="Excellent product and fast shipping!",
        is_featured=True,
        status="RESPONDED",
    )
    resp = FeedbackResponse(
        id=1,
        feedback_id=10,
        admin_id=1,
        response="Thank you for your feedback!",
    )
    assert fb.rating == 5
    assert fb.is_featured is True
    assert resp.feedback_id == fb.id
    # Ensure original feedback comment is preserved
    assert fb.comment == "Excellent product and fast shipping!"
