import re
from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate

def generate_slug(name: str) -> str:
    return re.sub(r'[\s]+', '-', name.lower()).strip('-')

def get_category(db: Session, category_id: int):
    return db.query(Category).filter(Category.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Category).offset(skip).limit(limit).all()

def create_category(db: Session, category_in: CategoryCreate):
    obj_data = category_in.model_dump()
    if not obj_data.get("slug"):
        obj_data["slug"] = generate_slug(obj_data["name"])
    
    db_category = Category(**obj_data)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int) -> bool:
    db_category = get_category(db, category_id)
    if not db_category:
        return False
    db.delete(db_category)
    db.commit()
    return True
