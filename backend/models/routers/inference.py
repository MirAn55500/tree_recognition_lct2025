from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image
import io
import urllib.parse
from typing import Literal

from backend.services import inference_service
from backend.models.schemas import ApiResponse
from backend.core.logging_config import logger

router = APIRouter(tags=["Inference"])

@router.on_event("startup")
def startup_event():
    inference_service.load_heavy_models()

@router.post("/predict", response_model=ApiResponse, summary="Analyze an image")
async def predict(
    model_type: Literal["base", "fine_tuned"] = Query("base", description="Which model to use: 'base' or 'fine_tuned'"),
    file: UploadFile = File(..., description="Image file (jpg, png)")
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
        
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        logger.error(f"Failed to read image file: {e}")
        raise HTTPException(status_code=400, detail="Could not read the image file.")

    try:
        inference_results, annotated_image = inference_service.run_inference_pipeline(image, model_type)

        response_data = ApiResponse(filename=file.filename, results=inference_results)
        json_string = response_data.model_dump_json()
        
        safe_header_value = urllib.parse.quote(json_string)
        headers = {
            "X-Prediction-Data": safe_header_value,
            "Content-Disposition": f'inline; filename="annotated_{file.filename}.png"',
        }

        buffer = io.BytesIO()
        annotated_image.save(buffer, format="PNG")
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="image/png",
            headers=headers,
        )
        
    except Exception as e:
        logger.exception("An error occurred during the inference pipeline.") # Логируем полный traceback
        return JSONResponse(
            status_code=500,
            content=ApiResponse(filename=file.filename, results=[], error=f"Internal server error: {e}").model_dump()
        )