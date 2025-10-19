import cv2
import json
import torch
import torch.nn.functional as F

import numpy as np
from PIL import Image
from typing import List, Dict, Any, Optional, Tuple
from transformers import (
    AutoImageProcessor,
    AutoModel,
    CLIPSegProcessor,
    CLIPSegForImageSegmentation,
    Sam2Processor,
    Sam2Model,
)
from ultralytics import YOLO
from skimage.transform import resize
from torchvision import transforms
import os

from backend.core import config
from backend.core.logging_config import logger
from backend.models.predictor import UnifiedPredictor

MODELS = {}
PREDICTORS_CACHE = {}
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

def load_heavy_models():
    if MODELS:
        return
    
    logger.info("Loading heavy inference models...")

    cache_directory = config.MODELS_DIR

    MODELS['yolo'] = YOLO(os.path.join(cache_directory, "yolo_best_filter.pt"))
    MODELS['yolo'].to(DEVICE)

    DINOV3_ID = "facebook/dinov3-vits16-pretrain-lvd1689m"
    MODELS['dino_v3_processor'] = AutoImageProcessor.from_pretrained(
        DINOV3_ID, cache_dir=cache_directory, use_fast=True
    )
    MODELS['dino_v3_model'] = AutoModel.from_pretrained(
        DINOV3_ID, cache_dir=cache_directory
    ).to(DEVICE).eval()

    CLIPSEG_ID = "CIDAS/clipseg-rd64"
    MODELS['clipseg_processor'] = CLIPSegProcessor.from_pretrained(
        CLIPSEG_ID, use_fast=True
    )
    MODELS['clipseg_model'] = (
        CLIPSegForImageSegmentation.from_pretrained(CLIPSEG_ID).to(DEVICE).eval()
    )
    
    logger.info("Heavy inference models loaded.")

def get_predictor(model_type: str = "base") -> UnifiedPredictor:
    if model_type not in PREDICTORS_CACHE:
        logger.info(f"Loading '{model_type}' predictor...")
        
        def find_paths(m_type: str):
            meta_path = config.MODELS_DIR / f"{m_type}_metadata_{model_type}.json"
            weights_path = config.MODELS_DIR / f"best_{m_type}_model_{model_type}.pth"
            if not (os.path.exists(meta_path) and os.path.exists(weights_path)):
                logger.warning(f"Model '{m_type}_{model_type}' not found, falling back to 'base'.")
                meta_path = config.MODELS_DIR / f"{m_type}_metadata_base.json"
                weights_path = config.MODELS_DIR / f"best_{m_type}_model_base.pth"
            if not (os.path.exists(meta_path) and os.path.exists(weights_path)):
                raise FileNotFoundError(f"Base model '{m_type}_base' not found.")
            return str(weights_path), meta_path

        try:
            species_weights, species_meta_p = find_paths("species")
            diseases_weights, diseases_meta_p = find_paths("diseases")
            chars_weights, chars_meta_p = find_paths("characteristics")
            
            with open(species_meta_p, 'r', encoding='utf-8') as f:
                species_meta = json.load(f)
            with open(diseases_meta_p, 'r', encoding='utf-8') as f:
                diseases_meta = json.load(f)
            with open(chars_meta_p, 'r', encoding='utf-8') as f:
                chars_meta = json.load(f)

            predictor = UnifiedPredictor(
                species_model_path=species_weights,
                disease_model_path=diseases_weights,
                characteristics_model_path=chars_weights,
                species_classes=species_meta['classes'],
                disease_classes=diseases_meta['classes'],
                characteristic_names=chars_meta['characteristic_names'],
                embedding_dim=config.EMBEDDING_DIM,
                device=DEVICE
            )
            PREDICTORS_CACHE[model_type] = predictor
            logger.info(f"Predictor '{model_type}' loaded and cached.")
        except Exception as e:
            logger.error(f"Failed to load predictor for '{model_type}': {e}")
            raise e

    return PREDICTORS_CACHE[model_type]

def detect_objects_with_yolo(
    image: Image.Image,
    confidence_threshold: float = 0.3
) -> Dict[str, Any]:
    target_classes: List[str] = ["tree"]
    results = MODELS['yolo'].predict(image, conf=confidence_threshold, verbose=False)

    if not results:
        print("Empty results")
        return {}
    
    result = results[0]

    boxes = result.boxes.xyxy.cpu().tolist()
    scores = result.boxes.conf.cpu().tolist()
    
    class_indices = result.boxes.cls.cpu().tolist()
    labels = [target_classes[int(i)] for i in class_indices]

    return {
        "boxes": boxes,
        "scores": scores,
        "labels": labels
    }

def crop_object_by_bbox(image: Image.Image, bbox: List[int]) -> Optional[Image.Image]:
    try:
        crop_box = tuple(map(int, bbox))
        cropped_image = image.crop(crop_box)
        if cropped_image.width > 0 and cropped_image.height > 0:
            return cropped_image
        return None
    except Exception:
        return None

def get_dino_embedding(object_image: Image.Image) -> torch.Tensor:
    inputs = MODELS['dino_v3_processor'](
        images=object_image.convert("RGB"),
        return_tensors="pt"
    ).to(DEVICE)
    
    with torch.no_grad():
        outputs = MODELS['dino_v3_model'](**inputs)
    
    return outputs.last_hidden_state[:, 0, :].squeeze(0).cpu()

def predict_all_attributes(embedding: torch.Tensor) -> Dict[str, Any]:
    predictor = MODELS.get('predictor')
    if predictor is None:
        raise RuntimeError("Prediction error")
    return predictor.predict(embedding)

# def predict_all_attributes(image: Image.Image) -> Dict[str, Any]:
#     predictor = MODELS.get('predictor')
#     if predictor is None:
#         raise RuntimeError("Prediction error")
#     return predictor.predict(image)

def generate_initial_mask(
    model: CLIPSegForImageSegmentation,
    processor: CLIPSegProcessor,
    image: Image.Image,
    prompt: str,
    threshold: float = 0.5,
) -> np.ndarray:

    inputs = processor(
        text=[prompt], images=[image.convert("RGB")], return_tensors="pt"
    ).to(DEVICE)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.sigmoid(outputs.logits.unsqueeze(1))
        probs_upsampled = F.interpolate(
            probs, size=(image.height, image.width), mode="bilinear", align_corners=False
        )
        prob_map = probs_upsampled.squeeze().cpu().numpy()

    mask = (prob_map >= threshold).astype(np.uint8) * 255
    return mask

def mask_to_bbox(mask: np.ndarray, margin: int = 10) -> list[int] | None:
    ys, xs = np.where(mask > 0)
    if len(xs) == 0:
        return None

    x1 = xs.min()
    x2 = xs.max()
    y1 = ys.min()
    y2 = ys.max()

    x1 = max(0, x1 - margin)
    y1 = max(0, y1 - margin)
    x2 = min(mask.shape[1] - 1, x2 + margin)
    y2 = min(mask.shape[0] - 1, y2 + margin)

    return [int(x1), int(y1), int(x2), int(y2)]

def sample_points_from_mask(mask: np.ndarray, n_points: int = 5) -> list[list[int]]:
    ys, xs = np.where(mask > 0)
    if len(xs) == 0:
        return []
    indices = np.linspace(0, len(xs) - 1, min(n_points, len(xs)), dtype=int)
    
    return [[int(xs[i]), int(ys[i])] for i in indices]

def run_inference_pipeline(
    image: Image.Image,
    model_type: str = "base",
    alpha: float = 0.6,
) -> List[Dict[str, Any]]:
    canvas = np.array(image.convert("RGB"))

    try:
        predictor = get_predictor(model_type)
    except FileNotFoundError as e:
        logger.error(f"Cannot run pipeline: {e}")
        return [], image

    logger.info("Starting object detection...")
    detections = detect_objects_with_yolo(image)
    
    num_boxes = len(detections.get('boxes', []))
    logger.info(f"Object detection completed. Found {num_boxes} BBoxes.")
    
    if num_boxes == 0:
        logger.info("No objects found. Stopping pipeline.")
        return []

    results = []
    
    labels = detections.get('labels', [])
    scores = detections.get('scores', [])
    boxes = detections.get('boxes', [])

    for i, (bbox, label, score) in enumerate(zip(boxes, labels, scores)):
        logger.info(f"Processing object #{i+1} (Class: '{label}', Confidence: {score:.2f})")
        logger.info(f"Bbox: {bbox}")

        logger.info("Cropping image by bbox...")
        cropped_object = crop_object_by_bbox(image, bbox)
        if cropped_object is None:
            logger.error(f"Failed to crop object #{i+1}. Skipping.")
            continue
        logger.info(f"Object cropped. Size: {cropped_object.size}")
        
        logger.info("Getting DINOv3 embedding...")
        embedding = get_dino_embedding(cropped_object)
        logger.info(f"DINOv3 embedding obtained. Size: {embedding.shape}")
        
        logger.info("Predicting all attributes with UnifiedPredictor...")
        # predictions = predict_all_attributes(cropped_object)
        predictions = predictor.predict(embedding)
        logger.info("Attributes predicted.")
        
        species_topk = predictions.get("species_topk", [])
        diseases_topk = predictions.get("diseases_topk", [])
        characteristics = predictions.get("characteristics", {})      
        
        logger.info("Checking conditions for mask generation...")

        for task in config.SEGMENTATION_TASKS:
            characteristic_name = task["characteristic"]
            prompt = task["prompt"]
            output_key = task["output_key"]
            threshold = task["threshold"]
            
            score = characteristics.get(characteristic_name, 0.0)
            if score > threshold:
                logger.info(
                    f"Condition for '{characteristic_name}' met (score={score:.2f}). "
                    f"Mask generation by prompt: '{prompt}'..."
                )

                try:
                    initial_mask = generate_initial_mask(
                        MODELS["clipseg_model"],
                        MODELS["clipseg_processor"],
                        cropped_object,
                        prompt,
                        threshold=0.3
                    )

                    x1, y1, x2, y2 = map(int, bbox)
                    color = config.MASK_COLORS.get(output_key, (255, 255, 255))
                    color_bgr = color[::-1] 
                    roi = canvas[y1:y2, x1:x2]
                    overlay = np.zeros_like(roi, dtype=np.uint8)
                    overlay[initial_mask > 0] = color_bgr
                    blended_roi = cv2.addWeighted(roi, 1, overlay, alpha, 0)
                    canvas[y1:y2, x1:x2] = blended_roi
                except Exception as e:
                    print(e)
                    
        result = {
            "bbox": [int(c) for c in bbox],
            "class_name": label,
            "species": [name for name, conf in species_topk],
            "species_confidence": [round(conf, 2) for name, conf in species_topk],
            "diseases": [name for name, conf in diseases_topk],
            "disease_confidence": [round(conf, 2) for name, conf in diseases_topk],

            "hollows": round(characteristics.get("hollows", 0.0), 2),
            "cracks": round(characteristics.get("cracks", 0.0), 2),
            "stem_damage": round(characteristics.get("stem_damage", 0.0), 2),
            "crown_damage": round(characteristics.get("crown_damage", 0.0), 2),
            "fruiting_bodies": round(characteristics.get("fruiting_bodies", 0.0), 2),
            "dry_branches_percentage": round(characteristics.get("dry_branches_percentage", 0.0), 2),
        }
        results.append(result)
        logger.info(f"Object #{i+1} processed successfully.")
    
    logger.info("Inference pipeline completed.")
    return results, Image.fromarray(canvas)