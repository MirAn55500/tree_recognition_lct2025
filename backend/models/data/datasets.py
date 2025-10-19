import os
import json
import torch
from torch.utils.data import Dataset
from PIL import Image

from backend.core import config
from backend.core.logging_config import logger

class AnnotationDataset(Dataset):
    def __init__(self, annotations_dir: str, images_dir: str, model_type: str, transform=None):
        self.images_dir = images_dir
        self.model_type = model_type
        self.transform = transform
        
        self.data = []
        species_classes = set()
        disease_classes = set()
        
        for file_name in os.listdir(annotations_dir):
            if not file_name.endswith('.json'):
                continue

            with open(os.path.join(annotations_dir, file_name), 'r', encoding='utf-8') as f:
                annotation_file = json.load(f)
            
            img_path = os.path.join(self.images_dir, annotation_file['img_path'])
            if not os.path.exists(img_path):
                logger.warning(f"Image file not found, skipping: {img_path}")
                continue
            
            for ann in annotation_file.get('annotations', []):
                self._process_annotation(ann, img_path, species_classes, disease_classes)
        
        self.species_classes = sorted(list(species_classes))
        self.disease_classes = sorted(list(disease_classes))
        self.species_to_idx = {cls: i for i, cls in enumerate(self.species_classes)}
        self.disease_to_idx = {disease: i for i, disease in enumerate(self.disease_classes)}
        logger.info(f"Dataset initialized for '{model_type}'. Found {len(self.data)} samples.")

    def _process_annotation(self, ann, img_path, species_classes, disease_classes):
        bbox = ann.get('bbox')
        if not bbox:
            logger.debug(f"Annotation in {img_path} missing bbox, skipping.")
            return

        if self.model_type == "species":
            species = ann.get('species_probabilities', [{}])[0].get('species')
            if species:
                self.data.append({'image_path': img_path, 'species': species, 'bbox': bbox})
                species_classes.add(species)
        
        elif self.model_type == "diseases":
            for disease_info in ann.get('diseases', []):
                disease = disease_info.get('disease')
                if disease:
                    self.data.append({'image_path': img_path, 'disease': disease, 'bbox': bbox})
                    disease_classes.add(disease)
        
        elif self.model_type == "characteristics":
            characteristics = {name: ann.get(name, 0.0) for name in config.CHARACTERISTIC_NAMES}
            characteristics['dry_branches_percentage'] /= 100.0  # Normalize to 0-1 range
            self.data.append({'image_path': img_path, 'characteristics': characteristics, 'bbox': bbox})

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        try:
            image = Image.open(item['image_path']).convert("RGB")
            image = image.crop(item['bbox'])
            
            if self.transform:
                image = self.transform(image)
            
            if self.model_type == "species":
                label = self.species_to_idx[item['species']]
                return image, label
            
            elif self.model_type == "diseases":
                label = self.disease_to_idx[item['disease']]
                return image, label
            
            elif self.model_type == "characteristics":
                labels = torch.tensor(
                    [item['characteristics'][name] for name in config.CHARACTERISTIC_NAMES],
                    dtype=torch.float32
                )
                return image, labels
                
        except Exception as e:
            logger.error(f"Error loading image {item['image_path']}: {e}")
            dummy_image = torch.zeros(3, 224, 224)
            if self.model_type == "characteristics":
                return dummy_image, torch.zeros(len(config.CHARACTERISTIC_NAMES))
            else:
                return dummy_image, -1 # Flag to skip this sample in the training loop