import os
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks

from backend.core import config
from backend.models.schemas import TrainingConfig
from backend.services import training_service

router = APIRouter(tags=["training"])

training_tasks = {}

@router.post("/api/training/start")
async def start_training(config: TrainingConfig, background_tasks: BackgroundTasks):
    task_id = f"training_{config.dataset_name}_{config.model_type}"
    training_tasks[task_id] = {"status": "running", "config": config.dict()}

    background_tasks.add_task(
        training_service.train_model_task, 
        config,
        task_id,
        training_tasks,
    )
    return {"message": "Training started in the background.", "task_id": task_id}

@router.get("/api/training/status/{task_id}")
async def get_training_status(task_id: str):
    task = training_tasks.get(task_id)
    if not task:
        return {"status": "not_found"}
    return task

@router.get("/api/models")
async def list_models():
    models = []
    for file in os.listdir(config.MODELS_DIR):
        if file.endswith('.pth'):
            file_path = os.path.join(config.MODELS_DIR, file)
            created_timestamp = os.path.getctime(file_path)
            created_at = datetime.fromtimestamp(created_timestamp).strftime("%Y-%m-%d %H:%M:%S")
            
            models.append({
                "name": file,
                "type": "species" if "species" in file else "diseases" if "disease" in file else "characteristics",
                "created_at": created_at
            })
    return {"models": models}