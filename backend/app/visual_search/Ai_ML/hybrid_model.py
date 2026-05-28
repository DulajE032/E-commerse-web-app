"""Hybrid Vision-Text Model for Product Search"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models
from sentence_transformers import SentenceTransformer
import numpy as np
from pathlib import Path


class HybridProductModel(nn.Module):
    """
    Combines image and text embeddings in a shared space.
    - Vision: ResNet-50 encoder → embedding_dim
    - Text: Sentence Transformer (pre-trained) → embedding_dim
    - Both fused into same vector space for similarity search
    """

    def __init__(self, embedding_dim: int = 512):
        super().__init__()
        self.embedding_dim = embedding_dim

        # Image encoder: ResNet-50
        resnet = models.resnet50(pretrained=True)
        self.image_encoder = nn.Sequential(*list(resnet.children())[:-1])
        self.image_projection = nn.Linear(2048, embedding_dim)

        # Text encoder: Sentence Transformer (frozen)
        self.text_encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self.text_projection = nn.Linear(384, embedding_dim)  # MiniLM outputs 384-dim

        # Batch norm for stability normalization
        self.img_bn = nn.BatchNorm1d(embedding_dim)
        self.text_bn = nn.BatchNorm1d(embedding_dim)

    def encode_image(self, images: torch.Tensor) -> torch.Tensor:
        """Encode images to embedding"""
        with torch.no_grad():
            features = self.image_encoder(images)  # [B, 2048, 1, 1]
            features = features.view(features.size(0), -1)  # [B, 2048]
        embeddings = self.image_projection(features)  # [B, embedding_dim]
        embeddings = self.img_bn(embeddings)
        embeddings = F.normalize(embeddings, p=2, dim=1)
        return embeddings

    def encode_text(self, texts: list[str]) -> torch.Tensor:
        """Encode text descriptions to embedding"""
        text_embeddings = self.text_encoder.encode(texts, convert_to_tensor=True)
        embeddings = self.text_projection(text_embeddings)
        embeddings = self.text_bn(embeddings)
        embeddings = F.normalize(embeddings, p=2, dim=1)
        return embeddings

    def forward(self, images: torch.Tensor, texts: list[str]) -> tuple:
        """Forward pass for training"""
        img_emb = self.encode_image(images)
        text_emb = self.encode_text(texts)
        return img_emb, text_emb

    def get_combined_embedding(
        self, images: torch.Tensor, texts: list[str], image_weight: float = 0.6
    ) -> torch.Tensor:
        """Combine image and text embeddings (weighted average)"""
        img_emb = self.encode_image(images)
        text_emb = self.encode_text(texts)
        combined = (image_weight * img_emb) + ((1 - image_weight) * text_emb)
        combined = F.normalize(combined, p=2, dim=1)
        return combined


class ContrastiveLoss(nn.Module):
    """Contrastive loss: pull matched pairs together, push unmatched apart"""

    def __init__(self, temperature: float = 0.07):
        super().__init__()
        self.temperature = temperature

    def forward(self, img_emb: torch.Tensor, text_emb: torch.Tensor) -> torch.Tensor:
        """
        img_emb: [B, D] image embeddings
        text_emb: [B, D] text embeddings (matched descriptions)
        """
        # Cosine similarity between all pairs
        logits = torch.matmul(img_emb, text_emb.t()) / self.temperature

        # Target: diagonal (matched pairs)
        batch_size = img_emb.shape[0]
        labels = torch.arange(batch_size, device=img_emb.device)

        # Cross-entropy loss
        loss_img_to_text = F.cross_entropy(logits, labels)
        loss_text_to_img = F.cross_entropy(logits.t(), labels)

        loss = (loss_img_to_text + loss_text_to_img) / 2
        return loss


class ModelManager:
    """Manages model training, saving, loading, and inference"""

    def __init__(self, model_path: str = "models/hybrid_model.pt", device: str = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model_path = Path(model_path)
        self.model_path.parent.mkdir(parents=True, exist_ok=True)

        self.model = HybridProductModel().to(self.device)
        self.loss_fn = ContrastiveLoss()
        self.optimizer = torch.optim.AdamW(
            self.model.parameters(), lr=1e-4, weight_decay=0.01
        )

    def save(self):
        """Save model weights"""
        torch.save(self.model.state_dict(), self.model_path)
        print(f"✅ Model saved to {self.model_path}")

    def load(self):
        """Load model weights"""
        if self.model_path.exists():
            self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
            print(f"✅ Model loaded from {self.model_path}")
            return True
        return False

    def train_epoch(self, dataloader, num_epochs: int = 1):
        """Train for N epochs"""
        self.model.train()
        total_loss = 0

        for epoch in range(num_epochs):
            for images, texts in dataloader:
                images = images.to(self.device)

                img_emb, text_emb = self.model(images, texts)
                loss = self.loss_fn(img_emb, text_emb)

                self.optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                self.optimizer.step()

                total_loss += loss.item()

            avg_loss = total_loss / len(dataloader)
            print(f"Epoch {epoch + 1}/{num_epochs}, Loss: {avg_loss:.4f}")

        self.save()
        return avg_loss

    @torch.no_grad()
    def get_image_embedding(self, image: torch.Tensor) -> np.ndarray:
        """Get embedding for single image"""
        self.model.eval()
        image = image.unsqueeze(0).to(self.device)
        embedding = self.model.encode_image(image)
        return embedding.cpu().numpy().flatten()

    @torch.no_grad()
    def get_text_embedding(self, text: str) -> np.ndarray:
        """Get embedding for single text"""
        self.model.eval()
        embedding = self.model.encode_text([text])
        return embedding.cpu().numpy().flatten()

    @torch.no_grad()
    def get_combined_embedding(
        self, image: torch.Tensor, text: str, image_weight: float = 0.6
    ) -> np.ndarray:
        """Get combined image+text embedding"""
        self.model.eval()
        image = image.unsqueeze(0).to(self.device)
        combined = self.model.get_combined_embedding(image, [text], image_weight)
        return combined.cpu().numpy().flatten()

    @torch.no_grad()
    def search_similar(
        self,
        query_embedding: np.ndarray,
        all_embeddings: np.ndarray,
        top_k: int = 5,
    ) -> list[tuple[int, float]]:
        """Find top-k most similar products"""
        query = torch.from_numpy(query_embedding).float().to(self.device)
        all_emb = torch.from_numpy(all_embeddings).float().to(self.device)

        # Cosine similarity
        similarities = torch.nn.functional.cosine_similarity(
            query.unsqueeze(0), all_emb
        )

        top_scores, top_indices = torch.topk(similarities, min(top_k, len(similarities)))

        results = [
            (idx.item(), score.item())
            for idx, score in zip(top_indices, top_scores)
        ]
        return results
