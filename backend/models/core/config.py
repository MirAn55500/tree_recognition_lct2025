import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATASETS_DIR = BASE_DIR / "datasets"
IMAGES_DIR = DATASETS_DIR / "images"
ANNOTATIONS_DIR = DATASETS_DIR / "annotations"
PROCESSED_DATA_DIR = DATASETS_DIR / "processed"

MODELS_DIR = BASE_DIR / "models"
STATIC_DIR = BASE_DIR / "static"
PROMPTS_DIR = BASE_DIR / "prompts"

HF_MODEL_NAME = "facebook/dinov3-vits16-pretrain-lvd1689m"
EMBEDDING_DIM = 384
CHARACTERISTIC_NAMES = [
    'hollows', 'cracks', 'stem_damage', 
    'crown_damage', 'fruiting_bodies', 'dry_branches_percentage'
]

def create_directories():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(ANNOTATIONS_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(STATIC_DIR, exist_ok=True)
    os.makedirs(STATIC_DIR / "images", exist_ok=True)

VLM_PROMPT_PATH = PROMPTS_DIR / "vlm_annotation.txt"
OPENROUTER_API_KEY = "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"
VLM_MODEL_NAME = "qwen/qwen2.5-vl-32b-instruct:free"

SEGMENTATION_TASKS = [
    {
        "characteristic": "hollows",
        "prompt": "hollow",
        "output_key": "hollow",
        "threshold": 0.5,
    },
    {
        "characteristic": "stem_damage",
        "prompt": "trunk",
        "output_key": "stem_damage",
        "threshold": 0.5,
    },
    {
        "characteristic": "crown_damage",
        "prompt": "leaves",
        "output_key": "crown_damage",
        "threshold": 0.5,
    },
]

MASK_COLORS = {
    "hollow": (255, 0, 0),
    "stem_damage": (255, 255, 0),
    "crown_damage": (0, 128, 255),
}