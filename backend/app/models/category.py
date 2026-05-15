from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    image = Column(String(500), nullable=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
