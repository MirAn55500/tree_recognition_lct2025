import json
import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import transforms
from transformers import AutoImageProcessor, AutoModel
from tqdm import tqdm

from backend.core import config
from backend.core.logging_config import logger
from backend.data.datasets import AnnotationDataset
from backend.models.architectures import LinearClassifier, RegressionModel

class ModelTrainer:
    def __init__(self, device: str = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.feature_extractor = None
        self.embedding_dim = config.EMBEDDING_DIM
        logger.info(f"ModelTrainer initialized on device: {self.device}")

    def _get_feature_extractor(self):
        if self.feature_extractor is None:
            logger.info(f"Loading feature extractor: {config.HF_MODEL_NAME}")
            processor = AutoImageProcessor.from_pretrained(config.HF_MODEL_NAME)
            model = AutoModel.from_pretrained(config.HF_MODEL_NAME).to(self.device)
            for param in model.parameters():
                param.requires_grad = False
            self.feature_extractor = {'processor': processor, 'model': model}
        return self.feature_extractor

    @torch.no_grad()
    def _extract_embeddings(self, images_tensor: torch.Tensor) -> torch.Tensor:
        extractor = self._get_feature_extractor()
        
        pil_images = [transforms.ToPILImage()(img) for img in images_tensor.cpu()]
        
        inputs = extractor['processor'](images=pil_images, return_tensors="pt").to(self.device)
        outputs = extractor['model'](**inputs)
        return outputs.last_hidden_state[:, 0, :]

    def _run_training_pipeline(self, dataset_name: str, model_type: str, epochs: int, batch_size: int, lr: float, val_split: float):
        logger.info(f"Starting fine-tuning for {model_type} model on dataset '{dataset_name}'.")
        
        annotations_dir = config.ANNOTATIONS_DIR / dataset_name
        images_dir = config.IMAGES_DIR / dataset_name
        
        if not (os.path.exists(annotations_dir) and os.path.exists(images_dir)):
            raise FileNotFoundError(f"Dataset '{dataset_name}' not found.")

        base_metadata_path = config.MODELS_DIR / f"{model_type}_metadata_base.json"
        if not os.path.exists(base_metadata_path):
            raise FileNotFoundError(f"Base metadata for '{model_type}' not found at {base_metadata_path}. Cannot proceed with fine-tuning.")
        
        with open(base_metadata_path, 'r', encoding='utf-8') as f:
            base_metadata = json.load(f)
        
        if model_type in ["species", "diseases"]:
            all_classes = base_metadata['classes']
            num_classes = len(all_classes)
            model = LinearClassifier(self.embedding_dim, num_classes).to(self.device)
        else: # characteristics
            all_characteristic_names = config.CHARACTERISTIC_NAMES
            output_dim = len(all_characteristic_names)
            model = RegressionModel(self.embedding_dim, output_dim).to(self.device)

        base_model_path = config.MODELS_DIR / f"best_{model_type}_model_base.pth"
        if os.path.exists(base_model_path):
            logger.info(f"Loading base weights for fine-tuning from {base_model_path}")
            try:
                model.load_state_dict(torch.load(base_model_path, map_location=self.device))
                logger.info("Base model weights loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load base model weights: {e}. Fine-tuning will start from a randomly initialized model head.")
        else:
            logger.warning(f"Base model weights not found at {base_model_path}. Fine-tuning will start from a randomly initialized model head.")

        train_transforms = transforms.Compose([
            transforms.Resize((224, 224)), transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15), transforms.ColorJitter(brightness=0.2, contrast=0.2),
            transforms.ToTensor(), transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        val_transforms = transforms.Compose([
            transforms.Resize((224, 224)), transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        full_dataset = AnnotationDataset(annotations_dir, images_dir, model_type, train_transforms)
        if not full_dataset:
            raise ValueError(f"No data found for model type '{model_type}' in dataset '{dataset_name}'.")

        if model_type == "species":
            full_dataset.species_classes = all_classes
            full_dataset.species_to_idx = {cls: i for i, cls in enumerate(all_classes)}
        elif model_type == "diseases":
            full_dataset.disease_classes = all_classes
            full_dataset.disease_to_idx = {cls: i for i, cls in enumerate(all_classes)}
        
        train_size = int((1 - val_split) * len(full_dataset))
        val_size = len(full_dataset) - train_size
        if val_size == 0 and train_size > 0:
            train_dataset = full_dataset
            val_dataset = []
        else:
            train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
            val_dataset.transform = val_transforms
        
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

        is_classification = model_type in ["species", "diseases"]
        criterion = nn.CrossEntropyLoss() if is_classification else nn.MSELoss()
        optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
        best_metric = 0.0 if is_classification else float('inf')
        
        # Training Loop
        for epoch in range(epochs):
            model.train()
            train_loss = 0.0
            total_correct = 0
            total_samples = 0

            for images, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs} [Train]"):
                if is_classification and -1 in labels: continue
                
                images, labels = images.to(self.device), labels.to(self.device)
                embeddings = self._extract_embeddings(images)
                
                optimizer.zero_grad()
                outputs = model(embeddings)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                train_loss += loss.item() * images.size(0)
                if is_classification:
                    _, predicted = torch.max(outputs.data, 1)
                    total_samples += labels.size(0)
                    total_correct += (predicted == labels).sum().item()
            
            if len(train_loader.dataset) > 0:
                train_loss /= len(train_loader.dataset)
            if total_samples > 0:
                train_acc = total_correct / total_samples
            else:
                train_acc = 0.0

            # Validation Loop
            model.eval()
            val_loss = 0.0
            total_correct = 0
            total_samples = 0
            
            with torch.no_grad():
                for images, labels in val_loader:
                    if is_classification and -1 in labels: continue

                    images, labels = images.to(self.device), labels.to(self.device)
                    embeddings = self._extract_embeddings(images)
                    
                    outputs = model(embeddings)
                    loss = criterion(outputs, labels)
                    val_loss += loss.item() * images.size(0)
                    
                    if is_classification:
                        _, predicted = torch.max(outputs.data, 1)
                        total_samples += labels.size(0)
                        total_correct += (predicted == labels).sum().item()

            if len(val_loader.dataset) > 0:
                val_loss /= len(val_loader.dataset)
            if total_samples > 0:
                val_acc = total_correct / total_samples
            else:
                val_acc = 0.0
            
            metric = val_acc if is_classification else val_loss
            log_msg = f"Epoch {epoch+1}/{epochs} | Train Loss: {train_loss:.4f}"
            if is_classification: log_msg += f" | Train Acc: {train_acc:.4f} | Val Acc: {val_acc:.4f}"
            else: log_msg += f" | Val Loss: {val_loss:.4f}"
            logger.info(log_msg)

            # Save Best Model
            if (is_classification and metric >= best_metric) or (not is_classification and metric < best_metric):
                best_metric = metric
                model_path = config.MODELS_DIR / f"best_{model_type}_model_fine_tuned.pth"
                torch.save(model.state_dict(), model_path)
                logger.info(f"  -> Fine-tuned model saved. New best validation metric: {best_metric:.4f}")
        
        # Save Metadata
        metadata = {
            "embedding_dim": self.embedding_dim,
            "fine_tuned_from_dataset": dataset_name,
        }
        if is_classification:
            metadata["model_type"] = model_type
            metadata["classes"] = all_classes
            metadata["best_accuracy"] = best_metric
        else:
            metadata["model_type"] = "characteristics"
            metadata["characteristic_names"] = all_characteristic_names
            metadata["best_loss"] = best_metric
        
        metadata_path = config.MODELS_DIR / f"{model_type}_metadata_fine_tuned.json"
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
            
        return best_metric

    def train_species_model(self, dataset_name, epochs, batch_size, lr, val_split):
        return self._run_training_pipeline(dataset_name, "species", epochs, batch_size, lr, val_split)

    def train_diseases_model(self, dataset_name, epochs, batch_size, lr, val_split):
        return self._run_training_pipeline(dataset_name, "diseases", epochs, batch_size, lr, val_split)

    def train_characteristics_model(self, dataset_name, epochs, batch_size, lr, val_split):
        return self._run_training_pipeline(dataset_name, "characteristics", epochs, batch_size, lr, val_split)