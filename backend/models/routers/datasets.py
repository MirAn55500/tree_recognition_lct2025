import os
import json
import shutil
from datetime import datetime
from typing import List

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from PIL import Image

from backend.core import config
from backend.core.logging_config import logger
from backend.models.schemas import ImageAnnotation
from backend.services import annotation_service

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

class CreateDatasetRequest(BaseModel):
    name: str
    description: str | None = None

@router.get("")
async def list_datasets():
    datasets = []
    for item in os.listdir(config.IMAGES_DIR):
        if os.path.isdir(config.IMAGES_DIR / item):
            images_count = len([f for f in os.listdir(config.IMAGES_DIR / item) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
            annotations_count = len([f for f in os.listdir(config.ANNOTATIONS_DIR / item) if f.endswith('.json')])
            
            dataset_path = config.IMAGES_DIR / item
            created_timestamp = os.path.getctime(dataset_path)
            created_at = datetime.fromtimestamp(created_timestamp).strftime("%Y-%m-%d %H:%M:%S")
            
            datasets.append({
                "name": item,
                "description": f"Dataset {item}",
                "images_count": images_count,
                "annotations_count": annotations_count,
                "created_at": created_at
            })
    return {"datasets": datasets}

@router.post("")
async def create_dataset(request_data: CreateDatasetRequest):
    name = request_data.name
    
    if os.path.exists(config.IMAGES_DIR / name):
        raise HTTPException(status_code=400, detail="Dataset with this name already exists.")
    
    os.makedirs(config.IMAGES_DIR / name, exist_ok=True)
    os.makedirs(config.ANNOTATIONS_DIR / name, exist_ok=True)
    
    return {"message": f"Dataset '{name}' created successfully."}

@router.post("/{dataset_name}/upload")
async def upload_images(dataset_name: str, files: List[UploadFile] = File(..., alias="files")): 
    dataset_path = config.IMAGES_DIR / dataset_name
    if not os.path.exists(dataset_path):
        raise HTTPException(status_code=404, detail="Dataset not found.")
    
    uploaded_files = []
    for file in files:
        if file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            file_path = dataset_path / file.filename
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            uploaded_files.append(file.filename)
    
    return {"uploaded_files": uploaded_files}

@router.post("/{dataset_name}/upload-annotations")
async def upload_annotations(dataset_name: str, files: List[UploadFile] = File(..., alias="files")):
    annotation_dir = config.ANNOTATIONS_DIR / dataset_name
    if not os.path.exists(annotation_dir):
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_name}' not found.")

    uploaded_files = []
    for file in files:
        if file.filename.lower().endswith('.json'):
            file_path = annotation_dir / file.filename
            try:
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                uploaded_files.append(file.filename)
            except Exception as e:
                logger.error(f"Failed to save annotation file {file.filename}: {e}")
                continue
        else:
            logger.warning(f"Skipped non-json file during annotation upload: {file.filename}")
    
    if not uploaded_files:
        raise HTTPException(status_code=400, detail="No valid .json files were uploaded.")

    return {"uploaded_files": uploaded_files, "message": "Annotations uploaded successfully."}

@router.get("/{dataset_name}/images")
async def list_images(dataset_name: str):
    dataset_path = config.IMAGES_DIR / dataset_name
    if not os.path.exists(dataset_path):
        raise HTTPException(status_code=404, detail="Dataset not found.")
    
    images = [
        {
            "filename": f,
            "has_annotation": os.path.exists(config.ANNOTATIONS_DIR / dataset_name / f"{os.path.splitext(f)[0]}.json")
        }
        for f in os.listdir(dataset_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
    ]
    return {"images": images}

@router.get("/{dataset_name}/images/{image_name}")
async def get_image_annotation(dataset_name: str, image_name: str):
    image_path = config.IMAGES_DIR / dataset_name / image_name
    annotation_path = config.ANNOTATIONS_DIR / dataset_name / f"{os.path.splitext(image_name)[0]}.json"
    
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found.")
    
    with Image.open(image_path) as img:
        width, height = img.size
    
    annotation_data = {"img_path": image_name, "annotations": []}
    if os.path.exists(annotation_path):
        with open(annotation_path, "r", encoding="utf-8") as f:
            annotation_data = json.load(f)
    
    static_image_path = config.STATIC_DIR / "images" / dataset_name / image_name
    os.makedirs(os.path.dirname(static_image_path), exist_ok=True)
    if not os.path.exists(static_image_path):
        shutil.copy2(image_path, static_image_path)
    
    return {
        "image_url": f"/static/images/{dataset_name}/{image_name}",
        "width": width, "height": height, "annotation": annotation_data
    }

@router.get("/{dataset_name}/images/{image_name}/file")
async def get_image_file(dataset_name: str, image_name: str):
    image_path = config.IMAGES_DIR / dataset_name / image_name
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found.")
    return FileResponse(image_path)

@router.post("/{dataset_name}/images/{image_name}/annotation")
async def save_annotation(dataset_name: str, image_name: str, annotation: ImageAnnotation):
    try:
        annotation_path = config.ANNOTATIONS_DIR / dataset_name / f"{os.path.splitext(image_name)[0]}.json"
        os.makedirs(os.path.dirname(annotation_path), exist_ok=True)
        
        with open(annotation_path, "w", encoding="utf-8") as f:
            json.dump(annotation.dict(), f, ensure_ascii=False, indent=2)
        
        logger.info(f"Annotation saved: {annotation_path}")
        return {"message": "Annotation saved successfully."}
    except Exception as e:
        logger.error(f"Error saving annotation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{dataset_name}/images/{image_name}/generate")
async def generate_annotation(dataset_name: str, image_name: str):
    image_path = config.IMAGES_DIR / dataset_name / image_name
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found.")

    parsed_json = annotation_service.generate_annotation_from_vlm(image_path)
    parsed_json['img_path'] = image_name

    annotation_path = config.ANNOTATIONS_DIR / dataset_name / f"{os.path.splitext(image_name)[0]}.json"
    with open(annotation_path, "w", encoding="utf-8") as f:
        json.dump(parsed_json, f, ensure_ascii=False, indent=2)
    
    return {"annotation": parsed_json, "message": "Annotation generated and saved successfully."}

@router.delete("/{dataset_name}")
async def delete_dataset(dataset_name: str):
    dataset_images_path = config.IMAGES_DIR / dataset_name
    dataset_annotations_path = config.ANNOTATIONS_DIR / dataset_name

    if not os.path.exists(dataset_images_path) and not os.path.exists(dataset_annotations_path):
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_name}' not found.")

    try:
        if os.path.exists(dataset_images_path):
            shutil.rmtree(dataset_images_path)
        if os.path.exists(dataset_annotations_path):
            shutil.rmtree(dataset_annotations_path)
        logger.info(f"Dataset '{dataset_name}' deleted successfully.")
        return {"message": f"Dataset '{dataset_name}' deleted successfully."}
    except Exception as e:
        logger.error(f"Error deleting dataset '{dataset_name}': {e}")
        raise HTTPException(status_code=500, detail="Failed to delete dataset.")
