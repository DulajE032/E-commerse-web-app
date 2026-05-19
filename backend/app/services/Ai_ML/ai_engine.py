from app.services.Ai_ML.visual_search_service import VisualSearchService

visual_search_service = VisualSearchService()


def run_visual_search(image_bytes: bytes, db_session) -> dict:
    """Run visual search on uploaded image"""
    results = visual_search_service.search_by_image(image_bytes, db_session)
    return {
        "status": "success",
        "results": results,
    }


def search_by_text(text_query: str, db_session) -> dict:
    """Run text-based search"""
    results = visual_search_service.search_by_text(text_query, db_session)
    return {
        "status": "success",
        "query": text_query,
        "results": results,
    }


def index_product_embedding(product_id: int, image_bytes: bytes, description: str, db_session) -> dict:
    """Index a product for visual search"""
    result = visual_search_service.index_product(product_id, image_bytes, description, db_session)
    return result
