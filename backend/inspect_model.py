"""Quick script to rebuild and inspect the model"""
import torch
import sys
sys.path.insert(0, ".")

from app.visual_search.Ai_ML.hybrid_model import HybridProductModel

# Create the model
model = HybridProductModel()
print("=== YOUR AI MODEL BRAIN ===")
print(f"Model class: {model.__class__.__name__}")
print()

# Show architecture
print("=== ARCHITECTURE ===")
print(model)
print()

# Count parameters
total = sum(p.numel() for p in model.parameters())
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
frozen = total - trainable
print("=== PARAMETER COUNT ===")
print(f"  Total parameters:     {total:>15,}")
print(f"  Trainable parameters: {trainable:>15,}")
print(f"  Frozen parameters:    {frozen:>15,}")
print()

# Show each layer
print("=== ALL LAYERS ===")
print(f"{'Layer Name':<45} {'Shape':<25} {'Params':>12} {'Trainable'}")
print("-" * 95)
for name, param in model.named_parameters():
    print(f"  {name:<43} {str(list(param.shape)):<25} {param.numel():>10,}   {'✅ YES' if param.requires_grad else '❄️ FROZEN'}")

print()
print("=== WHAT EACH PART DOES ===")
print("""
  image_encoder (ResNet-50):
    → Takes a 224x224 image and extracts 2048 visual features
    → Detects shapes, colors, textures, objects
    → Pre-trained on ImageNet (1.2M images, 1000 categories)
    → ❄️ FROZEN during training (already knows how to see)

  image_projection (Linear 2048→512):
    → Converts 2048 image features into 512-dim shared space
    → ✅ THIS IS WHAT GETS TRAINED

  text_encoder (MiniLM):
    → Takes text like "wireless earbuds" and extracts 384 meaning features
    → Pre-trained on 1B+ sentence pairs
    → ❄️ FROZEN during training (already knows English)

  text_projection (Linear 384→512):
    → Converts 384 text features into 512-dim shared space
    → ✅ THIS IS WHAT GETS TRAINED

  img_bn / text_bn (BatchNorm):
    → Normalizes the embeddings for stable training
    → ✅ TRAINABLE
""")

# Try to load trained weights
print("=== TRAINED WEIGHTS STATUS ===")
try:
    state = torch.load("models/hybrid_model.pt", map_location="cpu")
    print("  ✅ Trained model file loaded successfully!")
    print(f"  Saved layers: {len(state)}")
    for k, v in state.items():
        print(f"    {k}: {list(v.shape)}")
except Exception as e:
    print(f"  ⚠️ Could not load trained weights: {e}")
    print("  The model file may need to be re-trained.")
    print("  Run: python train_model.py")
