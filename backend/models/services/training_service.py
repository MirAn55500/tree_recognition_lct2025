import traceback
from backend.models.schemas import TrainingConfig
from backend.models.trainer import ModelTrainer
from backend.core.logging_config import logger

async def train_model_task(config: TrainingConfig, task_id: str, tasks_db: dict):
    try:
        logger.info(f"Starting training for model '{config.model_type}' on dataset '{config.dataset_name}'")
        
        trainer = ModelTrainer()
        
        if config.model_type == "species":
            accuracy = trainer.train_species_model(
                config.dataset_name, config.epochs, config.batch_size, 
                config.learning_rate, config.validation_split
            )
            logger.info(f"Training complete. Final accuracy: {accuracy:.4f}")
            
        elif config.model_type == "diseases":
            accuracy = trainer.train_diseases_model(
                config.dataset_name, config.epochs, config.batch_size, 
                config.learning_rate, config.validation_split
            )
            logger.info(f"Training complete. Final accuracy: {accuracy:.4f}")
            
        elif config.model_type == "characteristics":
            loss = trainer.train_characteristics_model(
                config.dataset_name, config.epochs, config.batch_size, 
                config.learning_rate, config.validation_split
            )
            logger.info(f"Training complete. Final loss: {loss:.4f}")
        else:
            logger.warning(f"Unknown model type requested for training: {config.model_type}")

        tasks_db[task_id] = {"status": "completed", "config": config.dict(), "result": "Success"}

    except Exception as e:
        logger.error(f"An error occurred during model training: {e}")
        logger.error(traceback.format_exc())
        tasks_db[task_id] = {"status": "failed", "config": config.dict(), "error": str(e)}
