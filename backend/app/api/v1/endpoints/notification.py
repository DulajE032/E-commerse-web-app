import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, update

from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.core.security import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: str = "info",
    order_id: Optional[int] = None,
) -> Notification:
    """Helper function to create and persist an in-app notification."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        order_id=order_id,
        is_read=False,
    )
    db.add(notif)
    # caller is responsible for commit or we commit if standalone
    return notif


@router.get("/", response_model=list[NotificationResponse])
def get_user_notifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve notifications for the current authenticated user."""
    query = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    notifications = db.scalars(query).all()
    return notifications


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the number of unread notifications for badge display."""
    count = db.scalar(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
    )
    return {"count": count or 0}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a specific notification as read."""
    notif = db.scalar(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.patch("/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read for current user."""
    db.execute(
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
        )
        .values(is_read=True)
    )
    db.commit()
    return {"message": "All notifications marked as read"}
