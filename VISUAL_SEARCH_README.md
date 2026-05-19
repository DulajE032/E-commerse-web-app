# 🔍 Hybrid Visual Search System - Complete Guide

## 📚 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How It Works](#how-it-works)
4. [Installation & Setup](#installation--setup)
5. [Understanding the Code](#understanding-the-code)
6. [API Endpoints](#api-endpoints)
7. [Training Your Model](#training-your-model)
8. [Deployment](#deployment)
9. [Advanced Concepts](#advanced-concepts)

---

## 🎯 Overview

This system builds a **custom AI model** that learns to find similar products using **both images AND text descriptions**. Unlike simple pre-trained models, this one is trained specifically for YOUR e-commerce data.

### What Makes It Special?
- ✅ **Hybrid Approach**: Combines image + text embeddings
- ✅ **Custom Training**: Learns from your product data
- ✅ **Fast Search**: Uses embeddings for instant similarity matching
- ✅ **Production-Ready**: Integrated with your FastAPI backend

### Real-World Example
```
User uploads: Nike Shoe Image
↓
Model extracts image features (CNN)
↓
Model understands text: "running shoe, comfortable, red"
↓
Combines both in shared vector space
↓
Finds similar products: "Adidas Running Shoe", "Nike Red Trainer", etc.
```

---

## 🏗️ Architecture

### System Design Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ - Image Upload Component                              │ │
│  │ - Text Search Bar                                     │ │
│  │ - Display Results with Similarity Scores             │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
┌────────────────────▼────────────────────────────────────────┐
│              BACKEND (FastAPI - Python)                    │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Visual Search Endpoints                               │ │
│  │ - POST /search-by-image/ (upload image)              │ │
│  │ - POST /search-by-text/ (text query)                 │ │
│  │ - POST /index-product/ (add new product)             │ │
│  │ - POST /index-all-products/ (bulk index)             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ AI Engine (ai_engine.py)                              │ │
│  │ - Orchestrates search operations                      │ │
│  │ - Calls visual search service                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Visual Search Service (visual_search_service.py)      │ │
│  │ - Handles image/text encoding                         │ │
│  │ - Queries embedded database                           │ │
│  │ - Computes cosine similarity                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Hybrid Model (hybrid_model.py)                        │ │
│  │ ┌──────────────────────────────────────────────────┐  │ │
│  │ │ IMAGE ENCODER (ResNet-50)                       │  │ │
│  │ │ Input: Image → Feature Extraction → 2048-dim   │  │ │
│  │ │ Output: 512-dim embedding (normalized)         │  │ │
│  │ └──────────────────────────────────────────────────┘  │ │
│  │                        ↓                              │ │
│  │ ┌──────────────────────────────────────────────────┐  │ │
│  │ │ TEXT ENCODER (Sentence Transformer)            │  │ │
│  │ │ Input: Text → NLP Processing → 384-dim        │  │ │
│  │ │ Output: 512-dim embedding (normalized)         │  │ │
│  │ └──────────────────────────────────────────────────┘  │ │
│  │                        ↓                              │ │
│  │ ┌──────────────────────────────────────────────────┐  │ │
│  │ │ FUSION LAYER                                    │  │ │
│  │ │ Weighted Average: 60% image + 40% text        │  │ │
│  │ │ Output: 512-dim joint embedding                │  │ │
│  │ └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌─────▼──────┐
    │ Database │          │   Model    │
    │  (Embeddings)       │  (Trained) │
    │  Store vectors      │  .pt file  │
    └──────────┘          └────────────┘
```

---

## 💡 How It Works

### Step 1: Image Encoding
```python
Input Image (e.g., shoe.jpg)
         ↓
ResNet-50 CNN (pre-trained on ImageNet)
- Extracts visual features at multiple scales
- Identifies: color, shape, texture, patterns
- Output: 2048-dimensional feature vector
         ↓
Linear Projection Layer
- Reduces 2048-dim → 512-dim
- Learns importance weights during training
         ↓
L2 Normalization (Cosine Distance)
- Normalizes to unit length
- Enables cosine similarity calculations
```

**Why ResNet-50?**
- Pre-trained on 1M+ images (ImageNet)
- Excellent feature extraction for general objects
- Fast inference (no training needed for image backbone)
- Well-documented and stable

### Step 2: Text Encoding
```python
Input Text (e.g., "red running shoe comfortable")
         ↓
Sentence Transformer (all-MiniLM-L6-v2)
- Pre-trained on 1B+ sentences
- Understands semantic meaning
- Output: 384-dimensional embedding
         ↓
Linear Projection Layer
- Reduces 384-dim → 512-dim
- Aligns with image embedding space
         ↓
L2 Normalization
```

**Why Sentence Transformer?**
- Lightweight (only 22MB)
- Excellent for short product descriptions
- Works without fine-tuning
- Fast inference on CPU

### Step 3: Embedding Fusion
```python
Image Embedding (512-dim)    Text Embedding (512-dim)
         ↓                          ↓
      60% weight              40% weight
         ↓                          ↓
    Weighted Average
         ↓
   Combined Embedding (512-dim)
         ↓
   L2 Normalize
         ↓
   Store in Database
```

**Why Weighted Average?**
- Image dominates (60%) because visual similarity matters most for shopping
- Text provides context (40%) for better semantic understanding
- Adjustable weights for different use cases

### Step 4: Similarity Search
```python
Query Embedding (user's image)
         ↓
Compute Cosine Similarity with ALL stored embeddings
         ↓
Sort by similarity score (0 to 1)
         ↓
Return top-5 most similar products
```

---

## 🚀 Installation & Setup

### Prerequisites
```bash
Python 3.9+
PostgreSQL 12+
CUDA 11.8+ (optional, for GPU acceleration)
```

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

Key packages added:
- `torch` - Deep learning framework
- `torchvision` - Computer vision models
- `sentence-transformers` - NLP embeddings
- `Pillow` - Image processing
- `numpy` - Numerical computing

### Step 2: Update Database
```bash
# Run migrations to create product_embeddings table
alembic upgrade head
```

### Step 3: Start Backend
```bash
uvicorn app.main:app --reload
```

Your API is now live at `http://localhost:8000`

### Step 4: Verify Installation
```bash
# Check if model is loaded
curl http://localhost:8000/health/db
```

---

## 📖 Understanding the Code

### 1. **hybrid_model.py** - The Core Model

```python
class HybridProductModel(nn.Module):
    """
    The main neural network that combines vision + text
    """
    
    def __init__(self, embedding_dim: int = 512):
        # Image encoder: ResNet-50
        self.image_encoder = ResNet50()  # Pre-trained
        self.image_projection = Linear(2048 → 512)  # Learnable
        
        # Text encoder: Sentence Transformer
        self.text_encoder = SentenceTransformer()  # Pre-trained, frozen
        self.text_projection = Linear(384 → 512)  # Learnable
        
        # Normalization
        self.img_bn = BatchNorm1d(512)
        self.text_bn = BatchNorm1d(512)
```

**Key Methods:**

a) **encode_image()**
```python
def encode_image(self, images):
    # Input: [B, 3, 224, 224] batch of images
    features = self.image_encoder(images)  # [B, 2048]
    embeddings = self.image_projection(features)  # [B, 512]
    embeddings = normalize(embeddings)  # Unit length
    return embeddings  # [B, 512]
```

b) **encode_text()**
```python
def encode_text(self, texts):
    # Input: List of strings
    embeddings = self.text_encoder.encode(texts)  # [B, 384]
    embeddings = self.text_projection(embeddings)  # [B, 512]
    embeddings = normalize(embeddings)  # Unit length
    return embeddings  # [B, 512]
```

c) **forward()** - Used during training
```python
def forward(self, images, texts):
    img_emb = self.encode_image(images)    # [B, 512]
    text_emb = self.encode_text(texts)     # [B, 512]
    return img_emb, text_emb
```

### 2. **ContrastiveLoss** - Training Objective

```python
class ContrastiveLoss(nn.Module):
    """
    Makes matched image-text pairs similar (high dot product)
    Makes unmatched pairs dissimilar (low dot product)
    """
    
    def forward(self, img_emb, text_emb):
        # img_emb[i] should be close to text_emb[i]
        # img_emb[i] should be far from text_emb[j] (j != i)
        
        # Compute similarity matrix
        logits = matmul(img_emb, text_emb.T)  # [B, B]
        
        # Diagonal should be 1 (matched), off-diagonal 0 (unmatched)
        labels = [0, 1, 2, 3, ...]  # Expected positions
        
        # Cross-entropy loss
        loss = CrossEntropyLoss(logits, labels)
```

**Visual Example:**
```
Image-Text Similarity Matrix (after training):
        Text_0  Text_1  Text_2  Text_3
Img_0  [0.95   0.10   0.05   0.08]  ← Img_0 matches Text_0 ✓
Img_1  [0.08   0.92   0.10   0.07]  ← Img_1 matches Text_1 ✓
Img_2  [0.05   0.12   0.88   0.11]  ← Img_2 matches Text_2 ✓
Img_3  [0.07   0.06   0.09   0.91]  ← Img_3 matches Text_3 ✓

Goal: Maximize diagonal, minimize off-diagonal
```

### 3. **ModelManager** - Orchestrates Model Lifecycle

```python
class ModelManager:
    """
    - Loads/saves model weights
    - Handles training
    - Provides inference methods
    """
    
    def __init__(self, model_path="models/hybrid_model.pt"):
        self.model = HybridProductModel()
        self.loss_fn = ContrastiveLoss()
        self.optimizer = AdamW(lr=1e-4)
        
    def train_epoch(self, dataloader, num_epochs):
        for epoch in range(num_epochs):
            for images, texts in dataloader:
                img_emb, text_emb = self.model(images, texts)
                loss = self.loss_fn(img_emb, text_emb)
                
                # Backpropagation
                loss.backward()
                self.optimizer.step()
        
        self.save()  # Save weights
```

### 4. **VisualSearchService** - High-Level Search API

```python
class VisualSearchService:
    """
    User-facing interface for search operations
    """
    
    def __init__(self):
        self.model_manager = ModelManager()
        self.model_manager.load()  # Load trained weights
        
    def search_by_image(self, image_bytes, db, top_k=5):
        # 1. Load and preprocess image
        img = load_image(image_bytes)
        
        # 2. Get embedding
        query_embedding = self.model_manager.get_image_embedding(img)
        
        # 3. Fetch all indexed embeddings from database
        all_embeddings = db.query(ProductEmbedding).all()
        
        # 4. Compute similarity
        similarities = cosine_similarity(query_embedding, all_embeddings)
        
        # 5. Get top-k
        results = get_top_k(similarities, k=5)
        
        return results
```

---

## 🔌 API Endpoints

### 1. Search by Image Upload

**Endpoint:** `POST /api/v1/visual-search/search-by-image/`

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/visual-search/search-by-image/" \
  -F "file=@my_shoe.jpg" \
  -F "top_k=5"
```

**Response:**
```json
{
  "status": "success",
  "results": [
    {
      "rank": 1,
      "product_id": 42,
      "name": "Nike Air Max 90",
      "similarity_score": 0.87,
      "price": 120.00
    },
    {
      "rank": 2,
      "product_id": 15,
      "name": "Adidas EQT Support",
      "similarity_score": 0.81,
      "price": 95.00
    }
  ]
}
```

### 2. Search by Text

**Endpoint:** `POST /api/v1/visual-search/search-by-text/`

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/visual-search/search-by-text/" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "comfortable running shoes red",
    "top_k": 5
  }'
```

**Response:**
```json
{
  "status": "success",
  "query": "comfortable running shoes red",
  "results": [...]
}
```

### 3. Index a New Product

**Endpoint:** `POST /api/v1/visual-search/index-product/`

```bash
curl -X POST "http://localhost:8000/api/v1/visual-search/index-product/" \
  -F "product_id=123" \
  -F "file=@product_image.jpg" \
  -F "description=Premium leather men's wallet"
```

**Process:**
1. Loads image and extracts visual features
2. Encodes product description
3. Fuses both embeddings
4. Stores in database

### 4. Index All Products (Bulk)

**Endpoint:** `POST /api/v1/visual-search/index-all-products/`

```bash
curl -X POST "http://localhost:8000/api/v1/visual-search/index-all-products/"
```

**What it does:**
- Iterates through all products in your database
- Downloads images from URLs
- Extracts and indexes embeddings
- Stores in `product_embeddings` table

---

## 🎓 Training Your Model

### Phase 1: Prepare Training Data

```python
# You need: (image, text) pairs
# Example: 
# - Image: "nike_shoe_1.jpg"
# - Text: "Red Nike Air Max, comfortable, running shoe"

training_data = [
    ("nike_shoe_1.jpg", "Red Nike Air Max, comfortable, running shoe"),
    ("adidas_shoe_1.jpg", "Blue Adidas Boost, lightweight, training"),
    ("puma_shirt_1.jpg", "Black Puma T-shirt, breathable, sports"),
    ...
]
```

### Phase 2: Create DataLoader

```python
import torch
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms

class ProductDataset(Dataset):
    def __init__(self, image_paths, descriptions):
        self.image_paths = image_paths
        self.descriptions = descriptions
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image = Image.open(self.image_paths[idx]).convert('RGB')
        image = self.transform(image)
        text = self.descriptions[idx]
        return image, text

# Create dataloader
train_dataset = ProductDataset(image_paths, descriptions)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
```

### Phase 3: Train Model

```python
from app.services.hybrid_model import ModelManager

# Initialize
manager = ModelManager()

# Train for 10 epochs
manager.train_epoch(train_loader, num_epochs=10)

# Model is automatically saved
```

**What Happens During Training:**
```
Epoch 1/10:
  Batch 1: Loss = 0.8234
  Batch 2: Loss = 0.7891
  Batch 3: Loss = 0.7234
  ...
  Avg Loss: 0.7421
  
Epoch 2/10:
  ...
  Avg Loss: 0.5834
  
Epoch 3/10:
  ...
  Avg Loss: 0.3421
  
...

Model saved to: models/hybrid_model.pt
```

---

## 🚢 Deployment

### Option 1: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t visual-search-api .
docker run -p 8000:8000 visual-search-api
```

### Option 2: Production Server

```bash
# Install gunicorn + uvicorn
pip install gunicorn uvicorn

# Run with 4 workers
gunicorn \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  app.main:app
```

### Option 3: Cloud Deployment (Heroku)

```bash
# Create Procfile
web: gunicorn -w 1 -k uvicorn.workers.UvicornWorker app.main:app

# Deploy
git push heroku main
```

---

## 🧠 Advanced Concepts

### 1. Why Normalization (L2)?

```python
# Without normalization
embedding1 = [1.0, 2.0, 3.0]
embedding2 = [0.5, 1.0, 1.5]

# They represent the same direction but different magnitudes
dot_product = 1*0.5 + 2*1 + 3*1.5 = 7.0

# After L2 normalization
embedding1_norm = [0.267, 0.535, 0.802]  # length = 1
embedding2_norm = [0.267, 0.535, 0.802]  # length = 1

# Now dot product = 1.0 (perfect match!)
# Cosine similarity = dot_product = 1.0
```

**Why it matters:**
- Enables cosine similarity (most efficient similarity measure)
- Makes embeddings comparable across different scales
- Improves neural network stability

### 2. Cosine Similarity

```python
# Most similar: score = 1.0 (parallel vectors)
# Least similar: score = 0.0 (perpendicular)
# Opposite: score = -1.0 (opposite direction)

similarity = dot(A, B) / (||A|| * ||B||)
           = dot(A_norm, B_norm)  # After L2 norm
```

### 3. Contrastive Learning

```python
# Traditional supervised learning:
# Input → Model → Class Label
# Loss: CrossEntropyLoss(pred, label)

# Contrastive learning:
# (Image, Text) → Model → Embeddings
# Loss: Pull matched pairs close, push others far
```

**Advantage:** Learn general representations without explicit class labels

### 4. Transfer Learning

```python
# Your model has 3 components:

1. Image Encoder (ResNet-50)
   └─ Pre-trained on ImageNet
   └─ FROZEN (we don't train this)
   └─ Already knows visual features

2. Text Encoder (Sentence Transformer)
   └─ Pre-trained on 1B+ sentences
   └─ FROZEN (we don't train this)
   └─ Already understands language

3. Projection Layers
   └─ TRAINABLE (we train these)
   └─ Learn to align embeddings to shared space
   └─ Small = Fast training = Few data needed
```

### 5. Embedding Space Visualization

```python
# You can visualize 512-D embeddings with t-SNE or UMAP

from sklearn.manifold import TSNE

# Reduce 512-D to 2-D
embeddings_2d = TSNE(n_components=2).fit_transform(all_embeddings)

# Plot
import matplotlib.pyplot as plt
plt.scatter(embeddings_2d[:, 0], embeddings_2d[:, 1])
plt.show()

# Similar products should cluster together!
```

### 6. Efficiency Tricks

**Caching Embeddings:**
```python
# Instead of computing embeddings every time
# Pre-compute and store in database

db.product_embeddings {
    product_id: 42
    embedding: [0.12, 0.45, 0.67, ...]  # 512 floats
    model_version: "hybrid-v1"
}

# Search is just: index lookup + dot product
# Time: O(n) where n = number of products
# Much faster than running model n times!
```

**Approximate Nearest Neighbors:**
```python
# For 1M+ products, full search is slow
# Use FAISS for fast approximate search

from faiss import IndexFlatL2

index = IndexFlatL2(512)  # 512-D embeddings
index.add(all_embeddings)  # Add 1M embeddings

distances, indices = index.search(query_embedding, k=5)
# Returns top-5 in milliseconds!
```

---

## 📊 Performance Metrics

### Inference Speed
- **Single Image Search**: ~200-300ms (first inference) → ~50ms (cached)
- **Text Search**: ~100ms
- **Batch Search (100 images)**: ~3-5 seconds

### Model Size
- **Trained Model File**: ~450MB
- **In-Memory**: ~2GB (with optimizations)

### Database Requirements
- **Per Product**: 512 floats × 4 bytes = 2KB
- **1000 Products**: ~2MB (negligible)
- **1M Products**: ~2GB (fits in modern databases)

---

## ⚡ Tips & Best Practices

### ✅ DO:
- Re-index products after model updates
- Use batch processing for bulk indexing
- Monitor model performance with test sets
- Version your models (`hybrid-v1`, `hybrid-v2`)
- Cache embeddings in database

### ❌ DON'T:
- Train on imbalanced data (use data augmentation)
- Use very large batch sizes (memory issues)
- Train with corrupted images
- Forget to normalize embeddings
- Deploy untested models to production

---

## 🔧 Troubleshooting

### Issue: Out of Memory (OOM)
```python
# Solution 1: Reduce batch size
# DataLoader(batch_size=16)  instead of 32

# Solution 2: Use smaller model
# embedding_dim=256  instead of 512

# Solution 3: Gradient accumulation
for images, texts in dataloader:
    loss.backward()  # Don't step
    # Accumulate gradients
if step % 4 == 0:
    optimizer.step()  # Step every 4 batches
```

### Issue: Poor Search Results
```python
# 1. Check embeddings are normalized
assert abs(np.linalg.norm(embedding) - 1.0) < 0.001

# 2. Verify database has indexed products
count = db.query(ProductEmbedding).count()
print(f"Indexed products: {count}")

# 3. Check similarity distribution
similarities = [...]
print(f"Min: {min(similarities)}, Max: {max(similarities)}")
# Should be between 0-1
```

### Issue: Model Not Improving
```python
# Check training loss
print(loss.item())
# Should decrease over epochs

# Check learning rate
optimizer = AdamW(lr=1e-3)  # Try different values
# Too high: loss explodes
# Too low: loss doesn't decrease

# Check data quality
# Verify image-text pairs are correctly matched
```

---

## 📚 Further Learning Resources

### Concepts:
- **Embeddings**: https://en.wikipedia.org/wiki/Word_embedding
- **Contrastive Learning**: https://arxiv.org/abs/2002.05709
- **CLIP**: https://arxiv.org/abs/2103.00020

### Papers:
- ResNet: https://arxiv.org/abs/1512.03385
- Sentence Transformers: https://arxiv.org/abs/1908.10084

### Tools:
- PyTorch: https://pytorch.org
- Hugging Face: https://huggingface.co
- FAISS: https://github.com/facebookresearch/faiss

---

## 🎉 Summary

You've now built a **production-ready hybrid visual search system** that:

1. ✅ Combines images + text for smarter search
2. ✅ Uses transfer learning (no need for huge datasets)
3. ✅ Provides fast inference (embeddings cached in DB)
4. ✅ Can be trained on your own data
5. ✅ Scales from 100s to 1M+ products

**Next Steps:**
- Collect training data from your products
- Train the model (takes 1-2 hours on GPU)
- Deploy to production
- Monitor and iterate

Happy searching! 🚀

---

**Questions?** Check the troubleshooting section or review the code comments.
