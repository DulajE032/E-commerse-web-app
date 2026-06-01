import stripe
from fastapi import APIRouter, Request, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.order import Order
from app.core.config import settings

router = APIRouter()


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = next(get_db())):
    """
    Stripe sends this webhook AFTER a payment succeeds or fails.
    This is the ONLY reliable way to confirm payment.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        # Find and update the order
        order = db.query(Order).filter(
            Order.stripe_payment_intent_id == intent["id"]
        ).first()
        if order:
            order.payment_status = "paid"
            order.status = "confirmed"
            db.commit()
    
    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        order = db.query(Order).filter(
            Order.stripe_payment_intent_id == intent["id"]
        ).first()
        if order:
            order.payment_status = "failed"
            db.commit()
    
    return {"status": "ok"}
