from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

from .inference import load_all_models, run_inference_pipeline
from .model import ApiResponse, PredictionResult

app = FastAPI(title="Tree Pathology API", description="Анализ изображений деревьев")

@app.on_event("startup")
def startup_event():
    load_all_models()

@app.post("/predict", response_model=ApiResponse, summary="Анализ изображения")
async def predict(file: UploadFile = File(..., description="Файл изображения (jpg, png)")):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Неверный тип файла. Пожалуйста, загрузите изображение.")
        
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Не удалось прочитать файл изображения.")

    try:
        inference_results = run_inference_pipeline(image)

        print(inference_results)
        
        response_results = [PredictionResult(**res) for res in inference_results]
        
        return ApiResponse(filename=file.filename, results=response_results)
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"filename": file.filename, "results": [], "error": f"Внутренняя ошибка сервера: {str(e)}"}
        )

@app.get("/", summary="Проверка состояния")
def read_root():
    return {"status": "API работает"}