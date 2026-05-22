"""Visual Search Service - Main orchestrator for image search"""
import io
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
from PIL import Image
import torch
from torchvision import transforms
from sqlalchemy.orm import Session

from app.services.Ai_ML.hybrid_model import ModelManager
from app.models.product_embedding import ProductEmbedding
from app.models.product import Product
from app.crud.crud_product import get_product


class VisualSearchService:
    """Orchestrates visual search functionality"""

    def __init__(self):
        self.model_manager = ModelManager()
        self.model_manager.load()  # Load existing model or create new
        self.device = self.model_manager.device
        self.image_transform = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

    def _load_image(self, image_bytes: bytes) -> torch.Tensor:
        """Convert bytes to preprocessed tensor"""
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_tensor = self.image_transform(img)
        return img_tensor

    def index_product(
        self,
        product_id: int,
        image_bytes: bytes,
        product_description: str,
        db: Session,
    ) -> dict:
        """
        Index a product: compute and store embeddings
        """
        try:
            # Load and process image
            img_tensor = self._load_image(image_bytes)

            # Get embeddings
            combined_emb = self.model_manager.get_combined_embedding(
                img_tensor, product_description, image_weight=0.6
            )

            # Store in database
            embedding = ProductEmbedding(
                product_id=product_id,
                image_url="",
                model_name="hybrid-resnet50-miniml",
                embedding=combined_emb.tolist(),
            )
            db.add(embedding)
            db.commit()

            return {
                "status": "success",
                "product_id": product_id,
                "embedding_size": len(combined_emb),
            }

        except Exception as e:
            return {"status": "error", "message": str(e)}

    def search_by_image(
        self, image_bytes: bytes, db: Session, top_k: int = 5
    ) -> list[dict]:
        """
        Search for similar products by uploading an image
        """
        try:
            # Load image
            img_tensor = self._load_image(image_bytes)

            # Get query embedding
            query_embedding = self.model_manager.get_image_embedding(img_tensor)

            # Get all indexed embeddings from DB
            all_indexed = db.query(ProductEmbedding).all()
            if not all_indexed:
                return []

            all_embeddings = np.array([p.embedding for p in all_indexed])
            product_ids = [p.product_id for p in all_indexed]

            # Find similar
            results = self.model_manager.search_similar(query_embedding, all_embeddings, top_k)

            # Build response
            output = []
            for rank, (idx, score) in enumerate(results, 1):
                product_id = product_ids[idx]
                product = get_product(db, product_id)
                if product:
                    output.append(
                        {
                            "rank": rank,
                            "product_id": product_id,
                            "name": product.name,
                            "similarity_score": float(score),
                            "price": product.price,
                        }
                    )

            return output

        except Exception as e:
            return [{"error": str(e)}]

    def search_by_text(self, text_query: str, db: Session, top_k: int = 5) -> list[dict]:
        """
        Search by text description
        """
        try:
            # Get text embedding
            query_embedding = self.model_manager.get_text_embedding(text_query)

            # Get all indexed embeddings
            all_indexed = db.query(ProductEmbedding).all()
            if not all_indexed:
                return []

            all_embeddings = np.array([p.embedding for p in all_indexed])
            product_ids = [p.product_id for p in all_indexed]

            # Find similar
            results = self.model_manager.search_similar(query_embedding, all_embeddings, top_k)

            # Build response
            output = []
            for rank, (idx, score) in enumerate(results, 1):
                product_id = product_ids[idx]
                product = get_product(db, product_id)
                if product:
                    output.append(
                        {
                            "rank": rank,
                            "product_id": product_id,
                            "name": product.name,
                            "similarity_score": float(score),
                            "price": product.price,
                        }
                    )

            return output

        except Exception as e:
            return [{"error": str(e)}]

    def index_all_products(self, db: Session) -> dict:
        """
        Bulk index all products (run periodically or once)
        """
        from app.crud.crud_product import get_products

        products = get_products(db)
        indexed_count = 0
        errors = []

        for product in products:
            if not product.images:
                continue

            try:
                # Use first image
                image_url = product.images[0]
                image_bytes = None

                # Try local path first (absolute or relative)
                local_path = Path(image_url)
                if local_path.exists():
                    image_bytes = local_path.read_bytes()
                elif image_url.startswith("/uploads/"):
                    upload_path = Path(image_url.lstrip("/"))
                    if upload_path.exists():
                        image_bytes = upload_path.read_bytes()
                    else:
                        raise FileNotFoundError(f"Upload not found: {image_url}")
                else:
                    parsed = urlparse(image_url)
                    if parsed.scheme in ("http", "https"):
                        import requests

                        response = requests.get(image_url, timeout=10)
                        if response.status_code == 200:
                            image_bytes = response.content
                        else:
                            raise ValueError(
                                f"Failed to fetch image (status {response.status_code})"
                            )
                    else:
                        raise ValueError(f"Unsupported image URL: {image_url}")

                description = product.description or product.name
                result = self.index_product(product.id, image_bytes, description, db)
                if result["status"] == "success":
                    indexed_count += 1
            except Exception as e:
                errors.append(f"Product {product.id}: {str(e)}")

        return {
            "indexed_count": indexed_count,
            "total_products": len(products),
            "errors": errors,
        }
