from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    file_path = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default="uploaded")  # uploaded, processing, processed, error
    statistics = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    research_photos = relationship("ResearchPhoto", back_populates="photo")

class Research(Base):
    __tablename__ = "researches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    research_photos = relationship("ResearchPhoto", back_populates="research")

class ResearchPhoto(Base):
    __tablename__ = "research_photos"

    id = Column(Integer, primary_key=True, index=True)
    research_id = Column(Integer, ForeignKey("researches.id"))
    photo_id = Column(Integer, ForeignKey("photos.id"))
    order_index = Column(Integer, default=0)

    research = relationship("Research", back_populates="research_photos")
    photo = relationship("Photo", back_populates="research_photos")