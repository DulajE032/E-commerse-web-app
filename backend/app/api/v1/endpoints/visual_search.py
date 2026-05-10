from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_engine import run_visual_search

router = APIRouter()


class VisualSearchRequest(BaseModel):
    image_url: str


@router.post("/")
def search_by_image(payload: VisualSearchRequest):
    return run_visual_search(payload.image_url)
