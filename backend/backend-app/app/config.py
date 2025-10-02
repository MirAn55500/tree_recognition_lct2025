import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5500/plantdb")
    minio_endpoint: str = os.getenv("MINIO_ENDPOINT", "localhost:9200")
    minio_access_key: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    minio_secret_key: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    minio_bucket: str = os.getenv("MINIO_BUCKET", "images")
    
    class Config:
        env_file = ".env"

settings = Settings()