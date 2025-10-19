from PIL import Image, ImageDraw, ImageFont
from typing import List
from pydantic import BaseModel

class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float

class BoundingBoxRequest(BaseModel):
    photo_id: int
    bounding_boxes: List[BoundingBox]

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