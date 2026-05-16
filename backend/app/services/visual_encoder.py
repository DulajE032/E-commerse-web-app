import torch
import open_clip
from PIL import Image

class VisualEncoder:
     def __init__(self):
         self.device = "cuda" if torch.cuda.is_available() else "cpu"
         self.model, _, self.preprocess = open_clip.create_model_and_transforms(
             "ViT-B-32",
             pretrained="laion2b_s34b_b79k",
         )
         self.model.eval().to(self.device)
 
     def encode_image(self, image: Image.Image) -> list[float]:
         img = self.preprocess(image).unsqueeze(0).to(self.device)
         with torch.no_grad():
             features = self.model.encode_image(img)
             features = features / features.norm(dim=-1, keepdim=True)  # normalize
         return features.squeeze(0).cpu().tolist()