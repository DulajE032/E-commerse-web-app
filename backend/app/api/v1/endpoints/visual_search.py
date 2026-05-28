from fastapi import APIRouter, UploadFile, File, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.visual_search.Ai_ML.ai_engine import run_visual_search, search_by_text, index_product_embedding
from app.db.session import get_db

router = APIRouter()


class TextSearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/search-by-image/")
async def search_by_image_file(
    file: UploadFile = File(...),
    top_k: int = Query(5),
    db: Session = Depends(get_db)
):
    """Search for similar products by uploading an image"""
    content = await file.read()
    result = run_visual_search(content, db)
    return result


@router.post("/search-by-text/")
def search_by_text_endpoint(
    request: TextSearchRequest,
    db: Session = Depends(get_db)
):
    """Search for similar products by text query"""
    return search_by_text(request.query, db)


@router.post("/index-product/")
async def index_product(
    product_id: int,
    file: UploadFile = File(...),
    description: str = Query(...),
    db: Session = Depends(get_db)
):
    """Index a product for visual search"""
    content = await file.read()
    result = index_product_embedding(product_id, content, description, db)
    return result


@router.post("/index-all-products/")
def index_all_products(db: Session = Depends(get_db)):
    """Index all products in the database (downloads from image URLs)"""
    from app.visual_search.Ai_ML.visual_search_service import VisualSearchService
    service = VisualSearchService()
    result = service.index_all_products(db)
    return result
