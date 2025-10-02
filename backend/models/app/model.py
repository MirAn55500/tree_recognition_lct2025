import torch
import torch.nn as nn
import numpy as np
from pydantic import BaseModel, conlist, confloat, validator
from typing import List, Optional, Union, Dict, Any


class PredictionResult(BaseModel):
    bbox: conlist(int)
    class_name: str
    species: Union[str, List[str]] = []
    species_confidence: Union[confloat(ge=0.0, le=1.0), List[confloat(ge=0.0, le=1.0)]]

    hollows: confloat(ge=0.0, le=1.0)
    cracks: confloat(ge=0.0, le=1.0)
    stem_damage: confloat(ge=0.0, le=1.0)
    crown_damage: confloat(ge=0.0, le=1.0)
    fruiting_bodies: confloat(ge=0.0, le=1.0)

    dry_branches_percentage: confloat(ge=0.0, le=100.0)

    diseases: Union[str, List[str]] = []
    species_confidence: Union[confloat(ge=0.0, le=1.0), List[confloat(ge=0.0, le=1.0)]]

    @validator("bbox", pre=True)
    def _bbox_to_ints(cls, v):
        if isinstance(v, (list, tuple)) and len(v) == 4:
            return [int(x) for x in v]
        return v

    @validator("diseases", pre=True)
    def _diseases_to_list(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            return [v] if v else []
        if isinstance(v, list):
            out = []
            for item in v:
                if isinstance(item, str) and item:
                    out.append(item)
                elif isinstance(item, dict) and item.get("disease"):
                    out.append(str(item["disease"]))
            return out
        return []


class ApiResponse(BaseModel):
    filename: str
    results: List[PredictionResult]
    error: Optional[str] = None


class LinearClassifier(nn.Module):
    def __init__(self, embedding_dim, num_classes, hidden_dim=256, dropout_rate=0.4):
        super(LinearClassifier, self).__init__()
        self.layers = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_dim, num_classes)
        )

    def forward(self, x):
        return self.layers(x)


class RegressionModel(nn.Module):
    def __init__(self, embedding_dim, output_dim, hidden_dim=256, dropout_rate=0.4):
        super(RegressionModel, self).__init__()
        self.layers = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_dim, output_dim),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.layers(x)


class UnifiedPredictor:
    def __init__(
        self,
        species_model_path: str,
        disease_model_path: str,
        characteristics_model_path: str,
        species_classes: list,
        disease_classes: list,
        characteristic_names: list,
        embedding_dim: int,
        device: str = "cuda" if torch.cuda.is_available() else "cpu"
    ):
        self.device = device
        self.species_classes = species_classes
        self.disease_classes = disease_classes
        self.characteristic_names = characteristic_names
        
        self.species_model = LinearClassifier(embedding_dim, len(species_classes)).to(self.device)
        self.species_model.load_state_dict(torch.load(species_model_path, map_location=self.device))
        self.species_model.eval()
        
        self.disease_model = LinearClassifier(embedding_dim, len(disease_classes)).to(self.device)
        self.disease_model.load_state_dict(torch.load(disease_model_path, map_location=self.device))
        self.disease_model.eval()

        self.characteristics_model = RegressionModel(embedding_dim, len(characteristic_names)).to(self.device)
        self.characteristics_model.load_state_dict(torch.load(characteristics_model_path, map_location=self.device))
        self.characteristics_model.eval()

    @torch.no_grad()
    def predict(self, embedding: torch.Tensor, top_k: int = 3) -> Dict[str, Any]:
        if embedding.ndim == 1:
            embedding = embedding.unsqueeze(0)
        embedding = embedding.to(self.device)

        species_logits = self.species_model(embedding)
        species_probs = torch.softmax(species_logits, dim=1).squeeze().cpu().numpy()
        top_species_indices = np.argsort(species_probs)[-top_k:][::-1]
        species_topk = [
            (self.species_classes[i], float(species_probs[i])) for i in top_species_indices
        ]

        disease_logits = self.disease_model(embedding)
        disease_probs = torch.softmax(disease_logits, dim=1).squeeze().cpu().numpy()
        top_disease_indices = np.argsort(disease_probs)[-top_k:][::-1]
        diseases_topk = [
            (self.disease_classes[i], float(disease_probs[i])) for i in top_disease_indices
        ]
        
        char_outputs = self.characteristics_model(embedding).squeeze().cpu().numpy()
        characteristics = {name: float(value) for name, value in zip(self.characteristic_names, char_outputs)}
        
        if 'dry_branches_percentage' in characteristics:
            characteristics['dry_branches_percentage'] *= 100.0

        result = {
            "species_topk": species_topk,
            "diseases_topk": diseases_topk,
            "characteristics": characteristics
        }
        
        return result