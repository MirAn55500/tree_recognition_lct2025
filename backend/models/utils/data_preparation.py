import os
import json
from typing import List, Dict, Any

from backend.core import config
from backend.core.logging_config import logger

def process_annotations_for_training(dataset_name: str):
    annotations_dir = config.ANNOTATIONS_DIR / dataset_name
    output_dir = config.PROCESSED_DATA_DIR / dataset_name
    os.makedirs(output_dir, exist_ok=True)

    logger.info(f"Starting annotation processing for dataset: {dataset_name}")
    logger.info(f"Reading from: {annotations_dir}")
    logger.info(f"Writing to: {output_dir}")

    all_annotations = []
    for file_name in os.listdir(annotations_dir):
        if file_name.endswith('.json'):
            file_path = os.path.join(annotations_dir, file_name)
            with open(file_path, 'r', encoding='utf-8') as f:
                all_annotations.append(json.load(f))
    
    logger.info(f"Found {len(all_annotations)} annotation files to process.")

    species_data: List[Dict[str, Any]] = []
    disease_data: List[Dict[str, Any]] = []
    characteristics_data: List[Dict[str, Any]] = []
    
    for annotation_file in all_annotations:
        for ann in annotation_file.get('annotations', []):
            species_info = ann.get('species_probabilities', [{}])[0]
            if species_info.get('species'):
                species_data.append({
                    'image_path': annotation_file['img_path'],
                    'species': species_info['species'],
                    'bbox': ann.get('bbox')
                })
            
            for disease_info in ann.get('diseases', []):
                if disease_info.get('disease'):
                    disease_data.append({
                        'image_path': annotation_file['img_path'],
                        'disease': disease_info['disease'],
                        'bbox': ann.get('bbox')
                    })
            
            characteristics = {
                'hollows': ann.get('hollows', 0.0),
                'cracks': ann.get('cracks', 0.0),
                'stem_damage': ann.get('stem_damage', 0.0),
                'crown_damage': ann.get('crown_damage', 0.0),
                'fruiting_bodies': ann.get('fruiting_bodies', 0.0),
                'dry_branches_percentage': ann.get('dry_branches_percentage', 0.0) / 100.0
            }
            characteristics_data.append({
                'image_path': annotation_file['img_path'],
                'characteristics': characteristics,
                'bbox': ann.get('bbox')
            })
    
    def save_data(file_path: str, data: List):
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved {len(data)} records to {file_path}")

    save_data(output_dir / 'species_data.json', species_data)
    save_data(output_dir / 'disease_data.json', disease_data)
    save_data(output_dir / 'characteristics_data.json', characteristics_data)

    logger.info("Annotation processing complete.")