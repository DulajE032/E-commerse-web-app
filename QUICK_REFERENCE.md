# 🚀 Visual Search System - Quick Reference Guide

## File Structure & What Each Does

```
backend/app/services/Ai_ML/
│
├── hybrid_model.py
│   ├── HybridProductModel (Main Neural Network)
│   │   ├── encode_image()          → Image → 512-dim embedding
│   │   ├── encode_text()           → Text → 512-dim embedding
│   │   └── get_combined_embedding()→ Both → Fused 512-dim embedding
│   │
│   ├── ContrastiveLoss (Training Loss)
│   │   └── Makes matched pairs similar, unmatched far
│   │
│   └── ModelManager (Model Lifecycle)
│       ├── save()                  → Save trained weights
│       ├── load()                  → Load trained weights
│       ├── train_epoch()           → Train for N epochs
│       ├── get_image_embedding()   → Encode single image
│       ├── get_text_embedding()    → Encode single text
│       └── search_similar()        → Find top-k similar
│
├── visual_search_service.py
│   └── VisualSearchService (User-Facing Interface)
│       ├── index_product()         → Add product to index
│       ├── search_by_image()       → Find similar by image
│       ├── search_by_text()        → Find similar by text
│       └── index_all_products()    → Bulk index from DB
│
└── ai_engine.py
    ├── run_visual_search()         → Search by image
    ├── search_by_text()            → Search by text
    └── index_product_embedding()   → Index a product
```

---

## API Endpoints Cheat Sheet

### 1. Search by Image
```
POST /api/v1/visual-search/search-by-image/
Form Data:
  - file: image file
  - top_k: 5 (optional)

Response:
{
  "status": "success",
  "results": [
    {
      "rank": 1,
      "product_id": 42,
      "name": "Nike Air Max",
      "similarity_score": 0.87,
      "price": 120.00
    }
  ]
}
```

### 2. Search by Text
```
POST /api/v1/visual-search/search-by-text/
JSON:
{
  "query": "red running shoes",
  "top_k": 5
}

Response: Same as above
```

### 3. Index Product
```
POST /api/v1/visual-search/index-product/
Form Data:
  - product_id: 123
  - file: image file
  - description: "Red Nike Running Shoe"

Response:
{
  "status": "success",
  "product_id": 123,
  "embedding_size": 512
}
```

### 4. Index All Products
```
POST /api/v1/visual-search/index-all-products/

Response:
{
  "indexed_count": 150,
  "total_products": 150,
  "errors": []
}
```

---

## How Each Component Works

### HybridProductModel - The Neural Network

**Vision Encoder (Image Path):**
```
Input Image (224x224x3)
    ↓
ResNet-50 (Pre-trained on ImageNet)
- Extract features at multiple scales
- Understand color, shape, texture
    ↓
2048-D feature vector
    ↓
Linear Layer (2048 → 512)
- Learn which features matter for products
    ↓
BatchNorm + L2 Normalize
    ↓
512-D image embedding (unit length)
```

**Text Encoder (Description Path):**
```
Input Text ("Red Nike shoe, comfortable")
    ↓
Sentence Transformer (all-MiniLM-L6-v2)
- Pre-trained on 1B+ sentences
- Understand semantic meaning
    ↓
384-D embedding
    ↓
Linear Layer (384 → 512)
- Align with image embedding space
    ↓
BatchNorm + L2 Normalize
    ↓
512-D text embedding (unit length)
```

**Fusion:**
```
Image Embedding (512-D)  Text Embedding (512-D)
       ↓                        ↓
     60% weight              40% weight
       ↓                        ↓
      Weighted Average (60% * img + 40% * text)
       ↓
   L2 Normalize
       ↓
Combined Embedding (512-D)
```

---

## Training Process Explained

### Data Setup
```python
# You need pairs of (image, description)
training_data = [
    ("nike1.jpg", "Red Nike Air Max, running shoes, comfortable"),
    ("adidas1.jpg", "Blue Adidas Boost, training shoe, lightweight"),
    ...
]
```

### Training Loop
```
For each epoch:
  For each batch of image-text pairs:
    1. Pass images through image_encoder
    2. Pass texts through text_encoder
    3. Compute loss:
       - Make img[i] ≈ text[i]  (matched pairs close)
       - Make img[i] ≠ text[j]  (unmatched pairs far)
    4. Backpropagate error
    5. Update weights
  
  Loss should decrease each epoch
  Save model after each epoch
```

### Example Training Output
```
Epoch 1/10: Loss = 2.4531 (High - model is learning)
Epoch 2/10: Loss = 1.8342 (Improving)
Epoch 3/10: Loss = 1.2134 (Better)
...
Epoch 10/10: Loss = 0.3421 (Converged)
✅ Model saved to models/hybrid_model.pt
```

---

## Search Process Explained

### Image Search
```
User uploads: nike_shoe.jpg
    ↓
Load & Preprocess (224x224, normalize)
    ↓
Feed through image_encoder
    ↓
Get 512-D embedding for query image
    ↓
Fetch all product embeddings from database
    ↓
For each product, compute cosine similarity:
   similarity = dot_product(query, product_embedding)
   (Range: 0 to 1, where 1 = identical)
    ↓
Sort by similarity descending
    ↓
Return top-5 with scores
```

### Example Similarity Computation
```
Query embedding (Nike shoe):  [0.12, -0.45, 0.67, ...]
Product 1 (Nike runner):      [0.11, -0.44, 0.66, ...] → similarity: 0.97 ✅
Product 2 (Adidas trainer):   [0.15, -0.32, 0.58, ...] → similarity: 0.84 ✅
Product 3 (Puma shirt):       [0.02, 0.12, 0.34, ...]  → similarity: 0.23 ❌
Product 4 (Nike casual):      [0.13, -0.46, 0.65, ...] → similarity: 0.96 ✅
Product 5 (Adidas runner):    [0.14, -0.41, 0.62, ...] → similarity: 0.91 ✅

Top-5 results returned to user
```

---

## Key Concepts Explained

### 1. Embedding
- 512 numbers that represent meaning
- Similar items have similar embeddings
- Distance between embeddings = semantic distance

### 2. Cosine Similarity
- Measures angle between two vectors
- Range: -1 to +1 (0 to 1 after L2 norm)
- 1.0 = identical, 0.0 = perpendicular, -1.0 = opposite

### 3. Transfer Learning
- Don't train ResNet from scratch (ImageNet already trained it!)
- Don't train Sentence Transformer from scratch
- Only train projection layers (small, fast, efficient)

### 4. Batch Normalization
- Normalizes layer input
- Improves training stability
- Helps model learn faster

### 5. L2 Normalization
- Scale embedding to unit length
- Enable cosine similarity calculations
- Compare embeddings on same scale

---

## Performance Tips

### Faster Searches
- ✅ Pre-compute all embeddings (done automatically)
- ✅ Store in database (not filesystem)
- ✅ Use batch operations when indexing

### Better Results
- ✅ Train model on similar products first
- ✅ Use high-quality product images
- ✅ Write descriptive product names/descriptions

### Scaling to 1M+ Products
- Use approximate nearest neighbor search (FAISS)
- Shard embeddings across databases
- Compress embeddings (binarize, reduce dimensions)

---

## Common Questions

**Q: Why combine image + text?**
A: Image gives visual similarity, text gives semantic understanding. Together = smarter search!

**Q: Why ResNet-50?**
A: Pre-trained on 1M+ images. Already knows visual features. Only need to learn alignment.

**Q: Why Sentence Transformer?**
A: Lightweight, pre-trained on billions of sentences. Understands product language perfectly.

**Q: How much data to train?**
A: 100-500 good image-text pairs = decent results. 1000+ = excellent results.

**Q: Can I train without GPU?**
A: Yes, but slow (~30min/epoch on CPU vs ~1min on GPU). GPU highly recommended.

**Q: How to improve results?**
A: 1) More data 2) Fine-tune model 3) Better descriptions 4) Higher quality images

---

## Debugging Checklist

- [ ] All dependencies installed? (`pip install -r requirements.txt`)
- [ ] Database migrations run? (`alembic upgrade head`)
- [ ] Backend started? (`uvicorn app.main:app --reload`)
- [ ] Products indexed? (Call `/index-all-products/`)
- [ ] Images exist and accessible?
- [ ] Descriptions not empty?
- [ ] GPU available? (`python -c "import torch; print(torch.cuda.is_available())"`)

---

## Next Steps

1. **Test**: Call endpoints with sample images
2. **Index**: Run `/index-all-products/` to populate embeddings
3. **Monitor**: Check similarity scores make sense
4. **Optimize**: Fine-tune model if needed
5. **Deploy**: Push to production with this guide

---

**For detailed explanations, see: `VISUAL_SEARCH_README.md`**
