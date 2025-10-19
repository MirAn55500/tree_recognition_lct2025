import os
import json
from pathlib import Path
from typing import Dict, Any, List

import torch
import torch.nn as nn
import numpy as np
from transformers import AutoProcessor, AutoModel

from backend.core import config
from backend.core.logging_config import logger
from backend.models.architectures import LinearClassifier, RegressionModel 


class UnifiedPredictor:
    def __init__(
        self,
        species_model_path: str,
        disease_model_path: str,
        characteristics_model_path: str,
        species_classes: List[str],
        disease_classes: List[str],
        characteristic_names: List[str],
        embedding_dim: int = 384,
        device: str = "cuda" if torch.cuda.is_available() else "cpu"
    ):
        self.device = device
        self.species_classes = species_classes
        self.disease_classes = disease_classes
        self.characteristic_names = characteristic_names
        
        self.species_model = LinearClassifier(embedding_dim, len(species_classes)).to(self.device)
        self.disease_model = LinearClassifier(embedding_dim, len(disease_classes)).to(self.device)
        self.characteristics_model = RegressionModel(embedding_dim, len(characteristic_names)).to(self.device)
    
        if os.path.exists(species_model_path):
            self.species_model.load_state_dict(torch.load(species_model_path, map_location=self.device))
            logger.info(f"Species model weights loaded from {species_model_path}")
        else:
            logger.error(f"Species model file not found: {species_model_path}")

        if os.path.exists(disease_model_path):
            self.disease_model.load_state_dict(torch.load(disease_model_path, map_location=self.device))
            logger.info(f"Disease model weights loaded from {disease_model_path}")
        else:
            logger.error(f"Disease model file not found: {disease_model_path}")
            
        if os.path.exists(characteristics_model_path):
            self.characteristics_model.load_state_dict(torch.load(characteristics_model_path, map_location=self.device))
            logger.info(f"Characteristics model weights loaded from {characteristics_model_path}")
        else:
            logger.error(f"Characteristics model file not found: {characteristics_model_path}")

        logger.info("Predictor initialized.")

        self.species_model.eval()
        self.disease_model.eval()
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


def load_predictor_from_metadata(
    dataset_name: str, 
    base_dataset_name: str = "base"
) -> UnifiedPredictor:
    device = "cuda" if torch.cuda.is_available() else "cpu"

    def find_path(prefix: str, suffix: str) -> Path:
        primary_path = config.MODELS_DIR / f"{prefix}_{dataset_name}{suffix}"
        if os.path.exists(primary_path):
            logger.info(f"Found specific model file: {primary_path}")
            return primary_path
        
        base_path = config.MODELS_DIR / f"{prefix}_{base_dataset_name}{suffix}"
        if os.path.exists(base_path):
            logger.warning(f"Specific model file not found at {primary_path}. Falling back to base: {base_path}")
            return base_path
            
        logger.error(f"Required model file not found for both '{dataset_name}' and '{base_dataset_name}': {primary_path}")
        raise FileNotFoundError(f"Required model file not found: {prefix}{suffix}")

    try:
        species_meta_path = find_path("species_metadata", ".json")
        disease_meta_path = find_path("diseases_metadata", ".json")
        chars_meta_path = find_path("characteristics_metadata", ".json")
        
        with open(species_meta_path, 'r', encoding='utf-8') as f:
            species_meta = json.load(f)
        with open(disease_meta_path, 'r', encoding='utf-8') as f:
            disease_meta = json.load(f)
        with open(chars_meta_path, 'r', encoding='utf-8') as f:
            chars_meta = json.load(f)
    except FileNotFoundError as e:
        logger.error(f"Failed to load metadata: {e}")
        raise
    
    species_model_path = find_path(f"best_species_model", ".pth")
    disease_model_path = find_path(f"best_diseases_model", ".pth")
    characteristics_model_path = find_path(f"best_characteristics_model", ".pth")
    
    return UnifiedPredictor(
        species_model_path=str(species_model_path),
        disease_model_path=str(disease_model_path),
        characteristics_model_path=str(characteristics_model_path),
        species_classes=species_meta['classes'],
        disease_classes=disease_meta['classes'],
        characteristic_names=chars_meta['characteristic_names'],
        embedding_dim=species_meta.get('embedding_dim', config.EMBEDDING_DIM),  
        device=device
    )
