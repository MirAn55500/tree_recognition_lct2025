from fastapi import FastAPI, Path, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
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

from app.database import find_areas_for_point, area_points_list, area_ids, areas_info, area_labels
from app import crud, models, schemas, minio_client, image_processor, model_api
from app.database import SessionLocal, engine, get_db
from app.statistics_processor import statistics_processor
from app.draw import draw_boxes_on_image, BoundingBox, BoundingBoxRequest

# Создаем таблицы
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Сервис определения заболеваний деревьев", version="1.0.0")


origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Plant Disease Detection Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}



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
    
    if latitude is not None and longitude is not None:
        areas_numbers = find_areas_for_point(latitude, longitude, area_points_list, area_labels)
        if len(areas_numbers) == 0:
            area_number = None
        else:
            area_number = areas_numbers[0]
    else:
        area_number = None
        
    # Сохраняем в базу данных
    photo_create = schemas.PhotoCreate(
        filename=filename,
        file_path=filename,  # В MinIO путь совпадает с именем файла
        latitude=latitude,
        longitude=longitude,
        area_number=area_number
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
    photos = db.query(models.Photo).order_by(models.Photo.id.desc()).offset(skip).limit(limit).all()
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



@app.get("/api/get_map_points")
async def get_map_points(db: Session = Depends(get_db)):
    """
    Возвращает все точки (фото) для отображения на карте, с координатами и статистикой, если есть.
    Формат ответа:
    [
        {
            "photo_id": ...,
            "latitude": ...,
            "longitude": ...,
            "area_number": ...,
            "status": ...,
            "statistics": {...} | null
        },
        ...
    ]
    """
    photos = db.query(models.Photo).all()
    points = []
    for photo in photos:
        # Отдаем только если есть координаты
        if photo.latitude is not None and photo.longitude is not None:
            points.append({
                "photo_id": photo.id,
                "latitude": photo.latitude,
                "longitude": photo.longitude,
                "area_number": photo.area_number,
                "status": photo.status,
                "statistics": photo.statistics,
            })
    return points

@app.get("/api/get_areas")
async def get_areas():
    """
    Эндпоинт для получения всех ID областей и их координат (списка полигонов).
    Возвращает:
        Список словарей: { "area_id": ..., "area_name": ..., "coordinates": [...] }
    """
    return areas_info


@app.get("/api/get_area_statistics/{area_id}")
async def get_area_statistics(
    area_id: int = Path(..., description="ID области"),
    db: Session = Depends(get_db)
):
    """
    Возвращает для заданной области (area_id) следующую информацию:
    - Список идентификаторов всех фотографий, относящихся к данной области (photo_ids).
    - Усреднённые значения статистик по всем фото в области (average_statistics), которые имеют рассчитанные статистики. 
      Если таких фотографий нет, поле average_statistics будет равно null.

    Позволяет использовать эти данные, например, для отображения средней статистики заболеваний по выбранной области
    на карте или для фильтрации фотографий, относящихся к конкретному участку.

    Формат ответа:
    {
        "area_id": <int>,                # ID выбранной области
        "photo_ids": [<int>, ...],       # Массив идентификаторов фотографий, привязанных к этой области
        "average_statistics": {          # Словарь с усреднёнными значениями статистик или null
           ...                          # Пример: {"hollows": 0.24, "cracks": 0.61, ...}
        } | null
    }
    """
    # Получаем все фото в данной области
    photos = db.query(models.Photo).filter(models.Photo.area_number == area_id).all()
    photo_ids = [photo.id for photo in photos]

    # Собираем статистики с непустых фото
    statistics_list = [photo.statistics for photo in photos if photo.statistics is not None]

    # Вычисляем усредненные статистики
    average_statistics = None
    if statistics_list:
        average_statistics = statistics_processor.calculate_average_statistics(statistics_list)

    return {
        "area_id": area_id,
        "photo_ids": photo_ids,
        "average_statistics": average_statistics
    }


@app.post("/api/create_dataset", response_model=schemas.Dataset)
async def create_dataset(
    dataset: schemas.DatasetCreate,
    db: Session = Depends(get_db)
):
    """
    Создает новый датасет
    """
    db_dataset = crud.create_dataset(db, dataset)
    return db_dataset


@app.get("/api/datasets", response_model=List[schemas.Dataset])
async def get_datasets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Получает список всех датасетов с пагинацией
    """
    datasets = crud.get_datasets(db, skip=skip, limit=limit)
    return datasets


@app.get("/api/dataset/{dataset_id}", response_model=schemas.DatasetWithPhotos)
async def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    """
    Получает датасет по ID с ID всех фотографий в этом датасете
    """
    dataset = crud.get_dataset_with_photos(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset with id {dataset_id} not found")
    
    # Собираем ID фотографий из датасета
    photo_ids = [dp.photo_id for dp in dataset.dataset_photos]
    
    return schemas.DatasetWithPhotos(
        id=dataset.id,
        name=dataset.name,
        description=dataset.description,
        created_at=dataset.created_at,
        photo_ids=photo_ids
    )

@app.post("/api/dataset/add_photo", response_model=schemas.AddPhotoToDatasetResponse)
async def add_photo_to_dataset(
    request: schemas.AddPhotoToDatasetRequest,
    db: Session = Depends(get_db)
):
    """
    Добавляет фото к датасету (создает связь между фото и датасетом)
    """
    # Проверяем существование датасета
    dataset = crud.get_dataset(db, request.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset with id {request.dataset_id} not found")
    
    # Проверяем существование фото
    photo = crud.get_photo(db, request.photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail=f"Photo with id {request.photo_id} not found")
    
    # Добавляем связь
    crud.add_photo_to_dataset(db, request.dataset_id, request.photo_id)
    
    return schemas.AddPhotoToDatasetResponse(
        message="Photo successfully added to dataset",
        dataset_id=request.dataset_id,
        photo_id=request.photo_id
    )

@app.put("/api/photo/{photo_id}/statistics", response_model=schemas.UpdatePhotoStatisticsResponse)
async def update_photo_statistics(
    photo_id: int,
    request: schemas.UpdatePhotoStatisticsRequest,
    db: Session = Depends(get_db)
):
    """
    Обновляет статистики фото по его ID
    """
    # Проверяем существование фото
    photo = crud.get_photo(db, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail=f"Photo with id {photo_id} not found")
    
    # Обновляем статистики
    crud.update_photo_statistics(db, photo_id, request.statistics)

    # Обновляем статус на "annotated"
    crud.update_photo_status(db, photo_id, "annotated")
    
    return schemas.UpdatePhotoStatisticsResponse(
        message="Photo statistics successfully updated",
        photo_id=photo_id
    )

@app.post("/api/dataset/{dataset_id}/train", response_model=schemas.TrainModelResponse)
async def train_model_on_dataset(
    dataset_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Запускает дообучение моделей по датасету.
    Извлекает все фото из базы данных, скачивает из MinIO и отправляет в сервис моделей.
    """
    # Проверяем существование датасета
    dataset = crud.get_dataset_with_photos(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset with id {dataset_id} not found")
    
    if not dataset.dataset_photos:
        raise HTTPException(status_code=400, detail=f"Dataset {dataset_id} has no photos")
    
    # Запускаем обучение в фоне
    background_tasks.add_task(train_model_background, dataset_id, dataset, db)
    
    return schemas.TrainModelResponse(
        message=f"Model training started for dataset {dataset_id}",
        dataset_id=dataset_id,
        photos_count=len(dataset.dataset_photos)
    )


async def train_model_background(dataset_id: int, dataset, db: Session):
    """
    Фоновая задача для дообучения модели.
    
    Args:
        dataset_id: ID датасета
        dataset: Объект датасета с фотографиями
        db: Сессия базы данных
    """
    try:
        # Используем ID датасета в качестве имени
        dataset_name = str(dataset_id)
        
        print(f"=== Starting model training for dataset {dataset_id} ===")
        
        # 1. Создаем датасет в сервисе моделей
        try:
            await model_api.create_dataset(
                name=dataset_name,
                description=f"Dataset {dataset_id}"
            )
            print(f"Dataset {dataset_name} created in model service")
        except Exception as e:
            print(f"Error creating dataset (may already exist): {e}")
        
        # 2. Скачиваем все фото из MinIO и загружаем в сервис
        files_bytes = []
        filenames = []
        statistics_data = {}
        
        for dataset_photo in dataset.dataset_photos:
            photo = dataset_photo.photo
            try:
                # Скачиваем файл из MinIO в память
                file_obj = minio_client.get_image_file(photo.filename)
                file_bytes = file_obj.read()
                file_obj.close()
                file_obj.release_conn()
                
                files_bytes.append(file_bytes)
                filenames.append(photo.filename)
                
                # Собираем статистики для каждого фото
                if photo.statistics:
                    statistics_data[photo.filename] = photo.statistics
                    
                print(f"Downloaded photo {photo.filename} from MinIO")
            except Exception as e:
                print(f"Error downloading photo {photo.id}: {e}")
                continue
        
        # 3. Загружаем фото в датасет на сервисе моделей
        if files_bytes:
            try:
                result = await model_api.upload_images_to_dataset(
                    dataset_name=dataset_name,
                    files=files_bytes,
                    filenames=filenames
                )
                print(f"Uploaded {len(files_bytes)} images to model service")
                print(f"Upload result: {result}")
            except Exception as e:
                print(f"Error uploading images to model service: {e}")
                raise
        
        # 4. Отправляем статистики как JSON файл
        if statistics_data:
            try:
                # Создаем JSON файл со статистиками
                statistics_json = json.dumps(statistics_data, ensure_ascii=False, indent=2)
                statistics_bytes = statistics_json.encode('utf-8')
                
                result = await model_api.upload_dataset_annotations(
                    dataset_name=dataset_name,
                    annotation_files=[statistics_bytes],
                    filenames=["statistics.json"]
                )
                print(f"Uploaded statistics to model service")
                print(f"Statistics upload result: {result}")
            except Exception as e:
                print(f"Error uploading statistics: {e}")
        
        # 5. Запускаем дообучение
        try:
            result = await model_api.train_model(dataset_name=dataset_name)
            print(f"Model training started successfully")
            print(f"Training result: {result}")
        except Exception as e:
            print(f"Error starting model training: {e}")
            raise
        
        print(f"=== Model training completed for dataset {dataset_id} ===")
        
    except Exception as e:
        print(f"Error in train_model_background: {e}")
        # В случае ошибки можно было бы обновить статус датасета, если такой функционал есть
        raise


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

@app.get("/diseases", response_model=List[str], summary="Получить список болезней")
def get_diseases():
    """
    Возвращает список всех возможных болезней деревьев
    """
    return DISEASES_LIST

@app.get("/species", response_model=List[str], summary="Получить список видов деревьев") 
def get_species():
    """
    Возвращает список всех возможных видов деревьев
    """
    return SPECIES_LIST
