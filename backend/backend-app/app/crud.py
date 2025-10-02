import sqlalchemy.orm
from sqlalchemy.orm import Session
from app import models, schemas
from sqlalchemy.orm import joinedload

def create_photo(db: Session, photo: schemas.PhotoCreate):
    db_photo = models.Photo(**photo.dict())
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo

def get_photo(db: Session, photo_id: int):
    return db.query(models.Photo).filter(models.Photo.id == photo_id).first()

def update_photo_status(db: Session, photo_id: int, status: str, statistics: dict = None):
    db_photo = get_photo(db, photo_id)
    if db_photo:
        db_photo.status = status
        if statistics is not None:
            db_photo.statistics = statistics
        db.commit()
        db.refresh(db_photo)
    return db_photo

def create_research(db: Session, research: schemas.ResearchCreate):
    db_research = models.Research(
        name=research.name,
        description=research.description
    )
    db.add(db_research)
    db.commit()
    db.refresh(db_research)
    
    # Add photos to research
    for i, photo_id in enumerate(research.photo_ids):
        research_photo = models.ResearchPhoto(
            research_id=db_research.id,
            photo_id=photo_id,
            order_index=i
        )
        db.add(research_photo)
    
    db.commit()
    return db_research

def get_researches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Research)\
        .options(
            joinedload(models.Research.research_photos)
            .joinedload(models.ResearchPhoto.photo)
        )\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_research(db: Session, research_id: int):
    return db.query(models.Research).filter(models.Research.id == research_id).first()

def get_all_photos_with_coordinates(db: Session):
    return db.query(models.Photo).filter(
        models.Photo.latitude.isnot(None),
        models.Photo.longitude.isnot(None)
    ).all()


def get_research_with_photos(db: Session, research_id: int):
    """
    Получает исследование с связанными фотографиями
    """
    return db.query(models.Research).\
        filter(models.Research.id == research_id).\
        options(
            sqlalchemy.orm.joinedload(models.Research.research_photos).
            joinedload(models.ResearchPhoto.photo)
        ).first()


def get_all_photo_ids(db: Session):
    """
    Получает все ID и имена файлов фото
    """
    return db.query(models.Photo.id, models.Photo.filename, models.Photo.status).all()

def get_all_photos(db: Session, skip: int = 0, limit: int = 100):
    """
    Получает все фото с пагинацией
    """
    return db.query(models.Photo).offset(skip).limit(limit).all()