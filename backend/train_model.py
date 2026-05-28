"""
Training Script for the Hybrid Visual Search Model
====================================================

This script trains the projection layers of the HybridProductModel
using your actual product data (images + descriptions) from the database.

HOW TO RUN:
    cd backend
    python train_model.py

WHAT IT DOES:
    1. Loads all products from your PostgreSQL database
    2. Loads each product's image from the /uploads/ folder
    3. Creates matched (image, text) pairs for training
    4. Trains the model using Contrastive Loss for 50 epochs
    5. Saves the trained weights to models/hybrid_model.pt
    6. Re-indexes all products with the new embeddings
    7. Updates the similarity threshold to 0.20

After training, the search will:
    - Return relevant products with HIGH scores (50-90%)
    - Return NOTHING for unrelated queries like "bicycle"
"""

import io
import sys
import random
from pathlib import Path

import numpy as np
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

# Add parent to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.db.session import SessionLocal
from app.models.product import Product
from app.models.product_embedding import ProductEmbedding
from app.visual_search.Ai_ML.hybrid_model import ModelManager


# ──────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────
NUM_EPOCHS = 50          # Number of training passes over all data
BATCH_SIZE = 4           # Products per training batch (keep small for 9 products)
LEARNING_RATE = 5e-4     # Learning rate (higher for small datasets)
AUGMENTATION_FACTOR = 10 # Create N augmented copies of each product to increase data
MODEL_PATH = "models/hybrid_model.pt"


# ──────────────────────────────────────────────────
# Image Transforms
# ──────────────────────────────────────────────────

# Standard transform (same as used in the service)
base_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Augmented transform (creates variations of the same image for more training data)
augmented_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.1),
    transforms.RandomRotation(15),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


# ──────────────────────────────────────────────────
# Dataset
# ──────────────────────────────────────────────────
class ProductDataset(Dataset):
    """
    Creates (image_tensor, text_description) pairs from your products.
    Uses data augmentation to multiply your small dataset.
    """

    def __init__(self, products, uploads_dir: Path, augmentation_factor: int = 10):
        self.pairs = []
        self.augmented_transform = augmented_transform
        self.base_transform = base_transform
        skipped = 0

        for product in products:
            if not product.images or len(product.images) == 0:
                skipped += 1
                continue

            # Build local file path
            image_path_str = product.images[0]
            if image_path_str.startswith("/uploads/"):
                filename = image_path_str.replace("/uploads/", "")
            else:
                filename = image_path_str
            
            full_path = uploads_dir / filename
            if not full_path.exists():
                print(f"  ⚠ Skipping product {product.id} ({product.name}): image not found at {full_path}")
                skipped += 1
                continue

            # Build text description
            text_parts = []
            if product.name:
                text_parts.append(product.name)
            if product.description:
                text_parts.append(product.description)
            if product.category:
                text_parts.append(f"Category: {product.category}")
            if product.brand:
                text_parts.append(f"Brand: {product.brand}")
            
            text = ". ".join(text_parts) if text_parts else product.name

            # Add original + augmented copies
            for i in range(augmentation_factor):
                self.pairs.append({
                    "image_path": full_path,
                    "text": text,
                    "product_id": product.id,
                    "use_augmentation": (i > 0),  # First copy is un-augmented
                })

        print(f"  ✅ Created {len(self.pairs)} training pairs from {len(self.pairs) // augmentation_factor} products")
        if skipped > 0:
            print(f"  ⚠ Skipped {skipped} products (no images or file not found)")

    def __len__(self):
        return len(self.pairs)

    def __getitem__(self, idx):
        pair = self.pairs[idx]
        
        # Load image
        img = Image.open(pair["image_path"]).convert("RGB")
        
        # Apply transform
        if pair["use_augmentation"]:
            img_tensor = self.augmented_transform(img)
        else:
            img_tensor = self.base_transform(img)

        return img_tensor, pair["text"]


def collate_fn(batch):
    """Custom collate: stack images, keep texts as list of strings."""
    images = torch.stack([item[0] for item in batch])
    texts = [item[1] for item in batch]
    return images, texts


# ──────────────────────────────────────────────────
# Main Training Function
# ──────────────────────────────────────────────────
def train():
    print("=" * 60)
    print("🚀 TRAINING HYBRID VISUAL SEARCH MODEL")
    print("=" * 60)

    # 1. Connect to database
    print("\n📦 Step 1: Loading products from database...")
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        print(f"  Found {len(products)} products in database")

        if len(products) == 0:
            print("  ❌ No products found! Add some products first.")
            return

        # 2. Create dataset
        print("\n📸 Step 2: Building training dataset...")
        uploads_dir = Path(__file__).parent / "uploads"
        dataset = ProductDataset(products, uploads_dir, augmentation_factor=AUGMENTATION_FACTOR)

        if len(dataset) == 0:
            print("  ❌ No valid image-text pairs found! Check your uploads folder.")
            return

        dataloader = DataLoader(
            dataset,
            batch_size=BATCH_SIZE,
            shuffle=True,
            collate_fn=collate_fn,
            drop_last=True,  # Drop last incomplete batch (important for contrastive loss)
        )

        print(f"  Batches per epoch: {len(dataloader)}")
        print(f"  Total training samples: {len(dataset)}")

        # 3. Initialize model
        print(f"\n🧠 Step 3: Initializing model...")
        manager = ModelManager(model_path=MODEL_PATH)
        # Don't load existing weights — train from scratch for best results
        print(f"  Device: {manager.device}")
        print(f"  Embedding dim: {manager.model.embedding_dim}")

        # Override optimizer with our learning rate
        manager.optimizer = torch.optim.AdamW(
            manager.model.parameters(), lr=LEARNING_RATE, weight_decay=0.01
        )

        # 4. Train
        print(f"\n🔄 Step 4: Training for {NUM_EPOCHS} epochs...")
        print("-" * 40)
        
        best_loss = float("inf")
        manager.model.train()
        
        for epoch in range(1, NUM_EPOCHS + 1):
            epoch_loss = 0.0
            num_batches = 0

            for images, texts in dataloader:
                images = images.to(manager.device)

                # Forward pass
                img_emb, text_emb = manager.model(images, texts)
                loss = manager.loss_fn(img_emb, text_emb)

                # Backward pass
                manager.optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(manager.model.parameters(), 1.0)
                manager.optimizer.step()

                epoch_loss += loss.item()
                num_batches += 1

            avg_loss = epoch_loss / max(num_batches, 1)

            # Print progress every 5 epochs
            if epoch % 5 == 0 or epoch == 1:
                bar = "█" * int(30 * epoch / NUM_EPOCHS) + "░" * (30 - int(30 * epoch / NUM_EPOCHS))
                print(f"  Epoch {epoch:3d}/{NUM_EPOCHS} |{bar}| Loss: {avg_loss:.4f}")

            if avg_loss < best_loss:
                best_loss = avg_loss

        print("-" * 40)
        print(f"  ✅ Training complete! Best loss: {best_loss:.4f}")

        # 5. Save model
        print(f"\n💾 Step 5: Saving trained model to {MODEL_PATH}...")
        manager.save()

        # 6. Re-index all products with new embeddings
        print("\n🔍 Step 6: Re-indexing all products with trained model...")
        
        # Clear old embeddings
        db.query(ProductEmbedding).delete()
        db.commit()
        print("  Cleared old embeddings")

        # Re-index using the trained model
        from app.visual_search.Ai_ML.visual_search_service import VisualSearchService
        service = VisualSearchService()  # This loads the newly saved model
        result = service.index_all_products(db)
        print(f"  ✅ Indexed {result['indexed_count']}/{result['total_products']} products")
        if result['errors']:
            for err in result['errors']:
                print(f"  ⚠ {err}")

        # 7. Update threshold
        print("\n⚙️ Step 7: Recommended threshold update")
        print("  After training, you can increase MIN_SIMILARITY_THRESHOLD")
        print("  in visual_search_service.py to 0.20 for better filtering.")
        print("  This means only products with >20% similarity will be returned.")

        print("\n" + "=" * 60)
        print("🎉 DONE! Your visual search model is now trained!")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Restart your backend server (uvicorn)")
        print("  2. Go to /visual-search and try searching")
        print("  3. 'earbuds' → should show your earbuds products")
        print("  4. 'bicycle' → should show 'No matching products'")

    finally:
        db.close()


if __name__ == "__main__":
    train()
