from PIL import Image
from app.services.visual_encoder import VisualEncoder
 
encoder = VisualEncoder()
img = Image.open("sample.jpg").convert("RGB")
vec = encoder.encode_image(img)
 
print("Vector length:", len(vec))
print("First 5 values:", vec[:5])