from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.crud import crud_category
from app.db.session import get_db
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryRead

router = APIRouter()

@router.get("/", response_model=list[CategoryRead])
def list_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_category.get_categories(db=db, skip=skip, limit=limit)

@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    return crud_category.create_category(db=db, category_in=category_in)
