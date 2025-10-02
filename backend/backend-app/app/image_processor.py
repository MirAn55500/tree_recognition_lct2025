import os
import requests
from app.schemas import ImageStatistics

predict_api_url = 'http://model_backend:7000/predict'


def process_image_stub(image_path: str) -> dict:
    print(f"Image path: {image_path}")
    try:
        # Открываем файл изображения
        with open(image_path, 'rb') as file:
            files = {'file': (os.path.basename(image_path), file, 'image/jpeg')}
            
            # Отправляем POST запрос
            response = requests.post(predict_api_url, files=files, timeout=300)
            
            # Проверяем статус ответа
            if response.status_code == 200:
                print("Success processing photo")
                return response.json()
            else:
                print(f"Ошибка: {response.status_code} - {response.text}")
                return None
                
    except FileNotFoundError:
        print(f"Файл не найден: {image_path}")
        return None
    except Exception as e:
        print(f"Произошла ошибка: {str(e)}")
        return None

async def process_image_async(image_path: str) -> dict:
    """Асинхронная версия обработки изображения"""
    return process_image_stub(image_path)