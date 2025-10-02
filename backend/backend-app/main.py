from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from PIL import Image, ImageDraw, ImageFont
from typing import List
import uuid
from pydantic import BaseModel
import tempfile
import json
import os
import io

from app import crud, models, schemas, minio_client, image_processor
from app.database import SessionLocal, engine, get_db
from app.statistics_processor import statistics_processor

# Создаем таблицы
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Сервис определения заболеваний деревьев", version="1.0.0")


origins = [
    "http://127.0.0.1",
    "http://51.250.113.243",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/upload_photo", response_model=schemas.UploadPhotoResponse)
async def upload_photo(
    file: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    db: Session = Depends(get_db)
):
    # Генерируем уникальное имя файла
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    
    # Читаем файл
    contents = await file.read()
    
    # Загружаем в MinIO
    if not minio_client.upload_image(contents, filename):
        raise HTTPException(status_code=500, detail="Failed to upload image to storage")
    
    # Сохраняем в базу данных
    photo_create = schemas.PhotoCreate(
        filename=filename,
        file_path=filename,  # В MinIO путь совпадает с именем файла
        latitude=latitude,
        longitude=longitude
    )
    
    db_photo = crud.create_photo(db, photo_create)
    
    return schemas.UploadPhotoResponse(
        photo_id=db_photo.id,
        message="Photo uploaded successfully"
    )

@app.post("/api/process_photo", response_model=schemas.ProcessPhotoResponse)
async def process_photo(
    photo_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    db_photo = crud.get_photo(db, photo_id)
    if not db_photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    local_path = minio_client.download_image(db_photo.filename)

    # Обновляем статус
    crud.update_photo_status(db, photo_id, "processing")
    
    # Запускаем обработку в фоне
    background_tasks.add_task(process_photo_background, photo_id, local_path, db)
    
    return schemas.ProcessPhotoResponse(message="Photo processing started")

async def process_photo_background(photo_id: int, image_path: str, db: Session):
    """Фоновая задача обработки фото"""
    try:
        # Обрабатываем изображение
        statistics = await image_processor.process_image_async(image_path)
        
        # Обновляем статус и статистику
        crud.update_photo_status(db, photo_id, "processed", statistics)
        
    except Exception as e:
        # В случае ошибки обновляем статус
        crud.update_photo_status(db, photo_id, "error")
        print(f"Error processing photo {photo_id}: {e}")

@app.get("/api/photo_status/{photo_id}", response_model=schemas.PhotoStatusResponse)
async def photo_status(photo_id: int, db: Session = Depends(get_db)):
    db_photo = crud.get_photo(db, photo_id)
    if not db_photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return schemas.PhotoStatusResponse(
        status=db_photo.status,
        statistics=db_photo.statistics
    )


@app.get("/api/photos", response_model=List[schemas.Photo])
async def get_all_photos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Получение списка всех фото с пагинацией
    """
    photos = db.query(models.Photo).offset(skip).limit(limit).all()
    return photos

@app.get("/api/photo_ids")
async def get_all_photo_ids(db: Session = Depends(get_db)):
    """
    Получение только ID всех фото
    """
    photos = db.query(models.Photo.id, models.Photo.filename, models.Photo.status).all()
    return {
        "photo_ids": [
            {
                "id": photo.id,
                "filename": photo.filename,
                "status": photo.status
            } for photo in photos
        ],
        "total_count": len(photos)
    }

@app.get("/api/photo/{photo_id}/file")
async def get_photo_file(photo_id: int, db: Session = Depends(get_db)):
    """
    Получение файла фото по ID
    """
    # Находим фото в базе данных
    db_photo = crud.get_photo(db, photo_id)
    if not db_photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    try:
        # Получаем файл из MinIO
        response = minio_client.get_image_file(db_photo.filename)
        
        # Определяем content-type на основе расширения файла
        file_extension = os.path.splitext(db_photo.filename)[1].lower()
        content_type = _get_content_type(file_extension)
        
        # Возвращаем файл как StreamingResponse
        return StreamingResponse(
            io.BytesIO(response.read()),
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename={db_photo.filename}",
                "Content-Type": content_type
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving photo file: {str(e)}")
    finally:
        response.close()
        response.release_conn()

def _get_content_type(file_extension: str) -> str:
    """
    Определяет content-type на основе расширения файла
    """
    content_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.tiff': 'image/tiff',
        '.svg': 'image/svg+xml'
    }
    return content_types.get(file_extension, 'application/octet-stream')


@app.post("/api/create_research", response_model=schemas.CreateResearchResponse)
async def create_research(research: schemas.ResearchCreate, db: Session = Depends(get_db)):
    # Проверяем существование всех фото
    for photo_id in research.photo_ids:
        if not crud.get_photo(db, photo_id):
            raise HTTPException(status_code=404, detail=f"Photo with id {photo_id} not found")
    
    db_research = crud.create_research(db, research)
    
    return schemas.CreateResearchResponse(
        research_id=db_research.id,
        message="Research created successfully"
    )

@app.get("/api/get_researches", response_model=list[schemas.Research])
async def get_researches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    researches = crud.get_researches(db, skip=skip, limit=limit)
    return researches

@app.get("/api/get_research/{research_id}", response_model=schemas.ResearchWithStatistics)
async def get_research(research_id: int, db: Session = Depends(get_db)):
    db_research = crud.get_research_with_photos(db, research_id)
    if not db_research:
        raise HTTPException(status_code=404, detail="Research not found")
    
    # Собираем статистики всех обработанных фото
    photos_statistics = []
    for research_photo in db_research.research_photos:
        photo = research_photo.photo
        if photo.status == "processed" and photo.statistics:
            photos_statistics.append(photo.statistics)
    
    # Вычисляем усредненные статистики
    average_statistics = None
    if photos_statistics:
        average_statistics = statistics_processor.calculate_average_statistics(photos_statistics)
    
    # Создаем ответ
    research_response = schemas.ResearchWithStatistics(
        id=db_research.id,
        name=db_research.name,
        description=db_research.description,
        created_at=db_research.created_at,
        photos=[schemas.Photo.from_orm(photo.photo) for photo in db_research.research_photos],
        average_statistics=average_statistics
    )
    
    return research_response


@app.get("/api/get_map")
async def get_map(db: Session = Depends(get_db)):
    """Заглушка для карты с областями и статистиками"""
    photos = crud.get_all_photos_with_coordinates(db)
    
    areas = []
    for photo in photos:
        area_stats = {
            "coordinates": {
                "latitude": photo.latitude,
                "longitude": photo.longitude
            },
            "photo_id": photo.id,
            "statistics": photo.statistics or {}
        }
        areas.append(area_stats)
    
    return {"areas": areas}


class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float

class BoundingBoxRequest(BaseModel):
    photo_id: int
    bounding_boxes: List[BoundingBox]

@app.get("/api/photo/{photo_id}/draw_boxes")
async def draw_bounding_boxes(
    photo_id: int,
    db: Session = Depends(get_db)
):
    """
    Отрисовка bounding box'ов на изображении с подписями в виде номеров
    """
    # Находим фото в базе данных
    db_photo = crud.get_photo(db, photo_id)
    if not db_photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    bounding_boxes = []
    results = db_photo.statistics.get("results", [])
    for result in results:
        bounding_boxes.append({
            "x_min": result["bbox"][0],
            "y_min": result["bbox"][1],
            "x_max": result["bbox"][2],
            "y_max": result["bbox"][3],
        })

    try:
        # Получаем файл из MinIO
        response = minio_client.get_image_file(db_photo.filename)
        
        # Создаем временный файл для изображения
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(db_photo.filename)[1]) as temp_file:
            temp_file.write(response.read())
            temp_file_path = temp_file.name
        
        try:
            # Открываем изображение
            image = Image.open(temp_file_path)
            
            # Конвертируем в RGB если нужно
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Отрисовываем bounding box'ы
            image_with_boxes = draw_boxes_on_image(image, bounding_boxes)

            output_buffer = io.BytesIO()
            
            # Сохраняем результат в bytes
            # Сохраняем в том же формате, что и исходное изображение
            file_extension = os.path.splitext(db_photo.filename)[1].lower()
            if file_extension in ['.jpg', '.jpeg']:
                image_with_boxes.save(output_buffer, format='JPEG', quality=95)
            elif file_extension == '.png':
                image_with_boxes.save(output_buffer, format='PNG')
            elif file_extension == '.webp':
                image_with_boxes.save(output_buffer, format='WEBP')
            else:
                image_with_boxes.save(output_buffer, format='JPEG', quality=95)  # fallback
            
            output_buffer.seek(0)
            
            # Определяем content-type
            file_extension = os.path.splitext(db_photo.filename)[1].lower()
            content_type = _get_content_type(file_extension)
            
            # Возвращаем результат
            return StreamingResponse(
                output_buffer,
                media_type=content_type,
                headers={
                    "Content-Disposition": f"inline; filename=annotated_{db_photo.filename}",
                    "Content-Type": content_type
                }
            )
            
        finally:
            # Удаляем временный файл
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing photo: {str(e)}")
    finally:
        response.close()
        response.release_conn()


def draw_boxes_on_image(image: Image.Image, bounding_boxes: List[BoundingBox]) -> Image.Image:
    """
    Отрисовывает bounding box'ы на изображении с подписями
    Координаты в абсолютных значениях пикселей
    """
    # Создаем копию изображения для рисования
    image_copy = image.copy()
    draw = ImageDraw.Draw(image_copy)
    
    # Параметры для рисования
    box_colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'magenta']
    box_width = 3
    
    try:
        # Пытаемся загрузить шрифт
        try:
            # Попробуем разные варианты шрифтов
            font_paths = [
                "arial.ttf",
                "Arial.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
            ]
            font = None
            for font_path in font_paths:
                try:
                    font = ImageFont.truetype(font_path, 24)
                    break
                except:
                    continue
            if font is None:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
    except:
        font = None
    
    for i, bbox in enumerate(bounding_boxes):
        # Конвертируем координаты в целые числа
        x_min = int(bbox["x_min"])
        y_min = int(bbox["y_min"])
        x_max = int(bbox["x_max"])
        y_max = int(bbox["y_max"])
        
        # Проверяем валидность координат
        img_width, img_height = image_copy.size
        if x_min < 0 or y_min < 0 or x_max > img_width or y_max > img_height:
            # Если координаты выходят за границы, логируем но продолжаем
            print(f"Warning: Bounding box {i} coordinates out of image bounds")
            # Ограничиваем координаты границами изображения
            x_min = max(0, min(x_min, img_width))
            y_min = max(0, min(y_min, img_height))
            x_max = max(0, min(x_max, img_width))
            y_max = max(0, min(y_max, img_height))
        
        # Выбираем цвет для текущего бокса
        color = box_colors[i % len(box_colors)]
        
        # Рисуем прямоугольник
        draw.rectangle([x_min, y_min, x_max, y_max], outline=color, width=box_width)
        
        # Подпись с номером бокса
        label = str(i + 1)
        
        # Определяем размеры текста
        if font:
            try:
                text_bbox = draw.textbbox((0, 0), label, font=font)
                text_width = text_bbox[2] - text_bbox[0]
                text_height = text_bbox[3] - text_bbox[1]
            except:
                # Fallback для старых версий PIL
                text_width, text_height = 20, 20
        else:
            text_width, text_height = 20, 20
        
        # Позиция для текста (левый верхний угол бокса)
        text_x = x_min
        text_y = y_min - text_height - 5
        
        # Если текст выходит за верхнюю границу, размещаем внутри бокса
        if text_y < 0:
            text_y = y_min + 5
        
        # Рисуем фон для текста
        draw.rectangle(
            [text_x - 2, text_y - 2, text_x + text_width + 2, text_y + text_height + 2],
            fill=color
        )
        
        # Рисуем текст
        if font:
            draw.text((text_x, text_y), label, fill='white', font=font)
        else:
            draw.text((text_x, text_y), label, fill='white')
    
    return image_copy
    

@app.get("/")
async def root():
    return {"message": "Plant Disease Detection Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}