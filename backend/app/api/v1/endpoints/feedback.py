import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.models.order import Order
from app.models.feedback import Feedback, FeedbackResponse
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackResponseSchema,
    FeaturedFeedbackItem,
    FeatureToggleRequest,
    CreateFeedbackResponseRequest,
    AdminResponseItem,
)
from app.core.security import get_current_user, require_role
from app.api.v1.endpoints.notification import create_notification

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/{order_id}", response_model=FeedbackResponseSchema)
def submit_order_feedback(
    order_id: int,
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit store/order feedback for a delivered order. One feedback allowed per order."""
    order = db.scalar(
        select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or you do not have permission",
        )

    if order.status.lower() != "delivered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback can only be submitted after your order has been delivered",
        )

    existing = db.scalar(select(Feedback).where(Feedback.order_id == order_id))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback has already been submitted for this order",
        )

    feedback = Feedback(
        user_id=current_user.id,
        order_id=order_id,
        rating=feedback_in.rating,
        comment=feedback_in.comment,
        is_featured=False,
        status="PENDING",
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    # In-app notification to user acknowledging feedback
    create_notification(
        db=db,
        user_id=current_user.id,
        title="Thank You for Your Feedback!",
        message=f"We received your feedback for Order #{order_id}. Thank you for helping us improve.",
        type="feedback_submitted",
        order_id=order_id,
    )
    db.commit()

    return FeedbackResponseSchema(
        id=feedback.id,
        user_id=feedback.user_id,
        user_name=current_user.full_name,
        order_id=feedback.order_id,
        rating=feedback.rating,
        comment=feedback.comment,
        is_featured=feedback.is_featured,
        status=feedback.status,
        created_at=feedback.created_at,
        responses=[],
    )


@router.get("/my", response_model=list[FeedbackResponseSchema])
def get_my_feedbacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all feedbacks submitted by the current user along with any admin responses."""
    feedbacks = db.scalars(
        select(Feedback)
        .options(
            joinedload(Feedback.responses).joinedload(FeedbackResponse.admin),
        )
        .where(Feedback.user_id == current_user.id)
        .order_by(Feedback.created_at.desc())
    ).unique().all()

    result = []
    for f in feedbacks:
        resp_items = [
            AdminResponseItem(
                id=r.id,
                feedback_id=r.feedback_id,
                admin_id=r.admin_id,
                admin_name=r.admin.full_name if r.admin else "Store Admin",
                response=r.response,
                created_at=r.created_at,
            )
            for r in f.responses
        ]
        result.append(
            FeedbackResponseSchema(
                id=f.id,
                user_id=f.user_id,
                user_name=current_user.full_name,
                order_id=f.order_id,
                rating=f.rating,
                comment=f.comment,
                is_featured=f.is_featured,
                status=f.status,
                created_at=f.created_at,
                responses=resp_items,
            )
        )
    return result


@router.get("/featured", response_model=list[FeaturedFeedbackItem])
def get_featured_feedbacks(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Public endpoint: returns feedbacks curated by the admin to display on the landing page."""
    feedbacks = db.scalars(
        select(Feedback)
        .options(joinedload(Feedback.user))
        .where(Feedback.is_featured == True)
        .order_by(Feedback.created_at.desc())
        .limit(limit)
    ).unique().all()

    result = []
    for f in feedbacks:
        # Protect customer full name privacy on public landing page: "John D."
        raw_name = f.user.full_name if f.user else "Verified Customer"
        parts = raw_name.split()
        masked_name = f"{parts[0]} {parts[1][0]}." if len(parts) > 1 else raw_name

        result.append(
            FeaturedFeedbackItem(
                id=f.id,
                user_name=masked_name,
                rating=f.rating,
                comment=f.comment,
                created_at=f.created_at,
            )
        )
    return result


@router.get("/admin/all", response_model=list[FeedbackResponseSchema])
def get_all_feedbacks_admin(
    is_featured: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    """Admin endpoint: view all submitted feedbacks with status and admin responses."""
    query = (
        select(Feedback)
        .options(
            joinedload(Feedback.user),
            joinedload(Feedback.responses).joinedload(FeedbackResponse.admin),
        )
        .order_by(Feedback.created_at.desc())
    )
    if is_featured is not None:
        query = query.where(Feedback.is_featured == is_featured)

    feedbacks = db.scalars(query.offset(offset).limit(limit)).unique().all()

    result = []
    for f in feedbacks:
        resp_items = [
            AdminResponseItem(
                id=r.id,
                feedback_id=r.feedback_id,
                admin_id=r.admin_id,
                admin_name=r.admin.full_name if r.admin else "Store Admin",
                response=r.response,
                created_at=r.created_at,
            )
            for r in f.responses
        ]
        result.append(
            FeedbackResponseSchema(
                id=f.id,
                user_id=f.user_id,
                user_name=f.user.full_name if f.user else f"User #{f.user_id}",
                order_id=f.order_id,
                rating=f.rating,
                comment=f.comment,
                is_featured=f.is_featured,
                status=f.status,
                created_at=f.created_at,
                responses=resp_items,
            )
        )
    return result


@router.patch("/{feedback_id}/feature")
def toggle_feedback_feature(
    feedback_id: int,
    body: FeatureToggleRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    """Admin endpoint: feature or unfeature feedback on landing page."""
    feedback = db.scalar(select(Feedback).where(Feedback.id == feedback_id))
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    feedback.is_featured = body.is_featured
    db.commit()
    return {
        "message": f"Feedback {'featured on' if body.is_featured else 'removed from'} landing page",
        "is_featured": feedback.is_featured,
    }


@router.post("/{feedback_id}/respond", response_model=AdminResponseItem)
def respond_to_feedback(
    feedback_id: int,
    body: CreateFeedbackResponseRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    """Admin endpoint: post an official response to customer feedback without altering the original feedback."""
    feedback = db.scalar(
        select(Feedback).options(joinedload(Feedback.user)).where(Feedback.id == feedback_id)
    )
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    response_entry = FeedbackResponse(
        feedback_id=feedback.id,
        admin_id=admin.id,
        response=body.response,
    )
    db.add(response_entry)
    feedback.status = "RESPONDED"
    db.commit()
    db.refresh(response_entry)

    # In-app notification to customer
    create_notification(
        db=db,
        user_id=feedback.user_id,
        title="Admin Responded to Your Feedback",
        message=f'Our team responded to your feedback for Order #{feedback.order_id}: "{body.response[:80]}..."',
        type="feedback_response",
        order_id=feedback.order_id,
    )
    db.commit()

    return AdminResponseItem(
        id=response_entry.id,
        feedback_id=response_entry.feedback_id,
        admin_id=response_entry.admin_id,
        admin_name=admin.full_name,
        response=response_entry.response,
        created_at=response_entry.created_at,
    )
