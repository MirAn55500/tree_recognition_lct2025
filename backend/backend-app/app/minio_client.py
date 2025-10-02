from minio import Minio
from minio.error import S3Error
import os
import io
from app.config import settings


# Инициализация клиента MinIO
client = Minio(
    settings.minio_endpoint,
    access_key=settings.minio_access_key,
    secret_key=settings.minio_secret_key,
    secure=False
)
bucket_name = settings.minio_bucket




def ensure_bucket_exists():
    """Создает bucket если он не существует"""
    try:
        if not client.bucket_exists(bucket_name):
            client.make_bucket(bucket_name)
            print(f"Bucket '{bucket_name}' created successfully")
    except S3Error as err:
        print(f"Error creating bucket: {err}")

# Гарантируем что bucket существует при импорте модуля
ensure_bucket_exists()



def upload_image(file_data: bytes, filename: str) -> bool:
    """Загружает изображение в MinIO"""
    try:
        file_stream = io.BytesIO(file_data)
        client.put_object(
            bucket_name,
            filename,
            file_stream,
            len(file_data)
        )
        print(f"Image '{filename}' uploaded successfully")
        return True
    except S3Error as err:
        print(f"Error uploading image: {err}")
        return False


def get_image_url(filename: str) -> str:
    """Получает URL для доступа к изображению"""
    try:
        return client.presigned_get_object(bucket_name, filename)
    except S3Error as err:
        print(f"Error getting image URL: {err}")
        return ""


def get_image_file(filename: str):
    """Получает файл изображения из MinIO"""
    try:
        return client.get_object(bucket_name, filename)
    except S3Error as err:
        print(f"Error getting image file: {err}")
        raise


def download_image(filename: str, local_dir: str = "downloads") -> str:
    """
    Скачивает файл из MinIO и сохраняет в локальную директорию
    
    Args:
        filename: Имя файла в MinIO
        local_dir: Локальная директория для сохранения (по умолчанию "downloads")
    
    Returns:
        str: Полный путь к сохраненному файлу или пустая строка в случае ошибки
    """
    try:
        # Создаем директорию, если она не существует
        os.makedirs(local_dir, exist_ok=True)
        
        # Полный путь к локальному файлу
        local_path = os.path.join(local_dir, filename)
        
        # Скачиваем файл из MinIO
        client.fget_object(bucket_name, filename, local_path)
        
        print(f"Image '{filename}' downloaded successfully to '{local_path}'")
        return local_path
        
    except S3Error as err:
        print(f"Error downloading image '{filename}': {err}")
        return ""
    except Exception as err:
        print(f"Unexpected error while downloading image '{filename}': {err}")
        return ""