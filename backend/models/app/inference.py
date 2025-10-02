import torch
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Optional, Tuple
from transformers import AutoImageProcessor, AutoModel
from ultralytics import YOLO
from skimage.transform import resize
import os

from .model import UnifiedPredictor

MODELS = {}
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

REGRESSION_HEADS = ['hollows', 'cracks', 'stem_damage', 'crown_damage', 'fruiting_bodies', 'dry_branches_percentage']

EMBEDDING_DIM = 384

DISEASES_LIST = [
    'Березовый трутовик', 'Вертициллезное увядание', 'Голландская болезнь вяза',
    'Другое', 'Естественное отмирание ветвей', 'Здоров', 'Комплексное усыхание',
    'Корневая губка', 'Корневая или комлевая гниль', 'Механическое повреждение ствола',
    'Мучнистая роса', 'Рак', 'Ржавчина', 'Стволовая гниль', 'Фитофтороз', 'Халаровый некроз',
    'Ядровая гниль вызванная дереворазрушающими грибами'
]

SPECIES_LIST = [
    'Берёза повислая', 'Боярышник однопестичный', 'Вишня обыкновенная', 'Вяз гладкий', 
    'Другой', 'Дуб красный', 'Дуб черешчатый', 'Дёрен пестролистный', 'Ель европейская',
    'Ива плакучая', 'Каштан конский', 'Кизильник блестящий', 'Клён платановидный',
    'Клён явор', 'Липа крупнолистная', 'Липа мелколистная', 'Липа сердцевидная', 
    'Осина', 'Рябина обыкновенная', 'Сирень обыкновенная', 'Сосна', 'Спирея',
    'Тополь', 'Тополь белый', 'Черёмуха обыкновенная', 'Чубушник венечный', 
    'Яблоня садовая', 'Ясень обыкновенный'
]


def load_all_models():
    if MODELS:
        return

    cache_directory = os.path.join(os.path.dirname(__file__), "models")

    MODELS['yolo'] = YOLO(os.path.join(cache_directory, "yolo_best_filter.pt"))
    MODELS['yolo'].to(DEVICE)

    DINOV3_ID = "facebook/dinov3-vits16-pretrain-lvd1689m"
    MODELS['dino_v3_processor'] = AutoImageProcessor.from_pretrained(
        DINOV3_ID, cache_dir=cache_directory)
    MODELS['dino_v3_model'] = AutoModel.from_pretrained(
        DINOV3_ID, cache_dir=cache_directory).to(DEVICE).eval()
    
    unified_model = UnifiedPredictor(
        species_model_path=os.path.join(cache_directory, "best_species_classifier_0.7.pth"),
        disease_model_path=os.path.join(cache_directory, "best_disease_classifier_0.64.pth"),
        characteristics_model_path=os.path.join(cache_directory, "best_characteristics_model.pth"),
        species_classes=SPECIES_LIST,
        disease_classes=DISEASES_LIST,
        characteristic_names=REGRESSION_HEADS,
        embedding_dim=EMBEDDING_DIM,
        device=DEVICE
    )

    MODELS['predictor'] = unified_model


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


def run_inference_pipeline(image: Image.Image) -> List[Dict[str, Any]]:
    detections = detect_objects_with_yolo(image)
    
    num_boxes = len(detections.get('boxes', []))

    if num_boxes == 0:
        return []

    results = []
    
    labels = detections.get('labels', [])
    scores = detections.get('scores', [])
    boxes = detections.get('boxes', [])

    for i, (bbox, label, score) in enumerate(zip(boxes, labels, scores)):
        cropped_object = crop_object_by_bbox(image, bbox)
        if cropped_object is None:
            continue
        
        embedding = get_dino_embedding(cropped_object)
        predictions = predict_all_attributes(embedding)
        
        species_topk = predictions.get("species_topk", [])
        diseases_topk = predictions.get("diseases_topk", [])
        characteristics = predictions.get("characteristics", {})        
        
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
    
    return results