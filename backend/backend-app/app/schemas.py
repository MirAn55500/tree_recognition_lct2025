from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Photo schemas
class PhotoBase(BaseModel):
    filename: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_number: Optional[int] = None

class PhotoCreate(PhotoBase):
    pass

class Photo(PhotoBase):
    id: int
    status: str
    statistics: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

## Research schemas
class ResearchBase(BaseModel):
    name: str
    description: Optional[str] = None

class ResearchCreate(ResearchBase):
    photo_ids: List[int] = []

class ResearchPhotoInfo(BaseModel):
    id: int
    photo_id: int
    order_index: int
    photo: Photo  # Добавляем полную информацию о фото
    
    class Config:
        from_attributes = True

class Research(ResearchBase):
    id: int
    created_at: datetime
    research_photos: List[ResearchPhotoInfo] = []  # Меняем поле photos на research_photos

    class Config:
        from_attributes = True

# Response schemas
class UploadPhotoResponse(BaseModel):
    photo_id: int
    message: str

class ProcessPhotoResponse(BaseModel):
    message: str

class PhotoStatusResponse(BaseModel):
    status: str
    statistics: Optional[Dict[str, Any]] = None

class CreateResearchResponse(BaseModel):
    research_id: int
    message: str

# Image statistics schema
class ImageStatistics(BaseModel):
    img_path: str
    annotations: List[Dict[str, Any]]


class ResearchWithStatistics(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    photos: List[Photo] = []
    average_statistics: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class PhotoID(BaseModel):
    id: int
    filename: str
    status: str

class PhotoIDsResponse(BaseModel):
    photo_ids: List[PhotoID]
    total_count: int

# Dataset schemas
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None

class DatasetCreate(DatasetBase):
    pass

class Dataset(DatasetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetWithPhotos(DatasetBase):
    id: int
    created_at: datetime
    photo_ids: List[int]

    class Config:
        from_attributes = True

class AddPhotoToDatasetRequest(BaseModel):
    dataset_id: int
    photo_id: int

class AddPhotoToDatasetResponse(BaseModel):
    message: str
    dataset_id: int
    photo_id: int

class UpdatePhotoStatisticsRequest(BaseModel):
    statistics: Dict[str, Any]

class UpdatePhotoStatisticsResponse(BaseModel):
    message: str
    photo_id: int

class TrainModelResponse(BaseModel):
    message: str
    dataset_id: int
    photos_count: int