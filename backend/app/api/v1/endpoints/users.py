from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.crud import crud_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter()


@router.get("/", response_model=list[UserRead])
def list_users(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return crud_user.get_users(db=db, skip=skip, limit=limit)


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return crud_user.create_user(db=db, user_in=user_in)
