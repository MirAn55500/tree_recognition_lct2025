from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


import json

def point_in_polygon(point, polygon):
    """
    Проверяет, находится ли точка внутри полигона используя алгоритм ray casting.
    
    Args:
        point: tuple (x, y) с координатами точки
        polygon: список координат вершин полигона в формате [[x1,y1], [x2,y2], ...]
        
    Returns:
        bool: True если точка внутри полигона, False если снаружи
    """
    x, y = point
    n = len(polygon)
    inside = False
    
    # Начальная точка
    p1x, p1y = polygon[0]
    
    # Проходим через все вершины полигона
    for i in range(n + 1):
        # Получаем следующую вершину (замыкаем полигон)
        p2x, p2y = polygon[i % n]
        
        # Проверяем пересечение луча с ребром полигона
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        # Вычисляем x-координату пересечения
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    
                    # Точка на вертикальной линии или слева от пересечения
                    if p1x == p2x or x <= xinters:
                        inside = not inside
                        
        p1x, p1y = p2x, p2y

    return inside

def point_in_multipolygon(point, multipolygon):
    """
    Проверяет, находится ли точка внутри мультиполигона.
    
    Args:
        point: tuple (x, y) с координатами точки
        multipolygon: список полигонов из extracted_data['coordinates']
        
    Returns:
        bool: True если точка внутри хотя бы одного полигона
    """
    # Разворачиваем все вложенные полигоны в один список точек
    flattened_polygons = []
    for polygon in multipolygon:
        if isinstance(polygon[0][0], list):
            # Если полигон содержит вложенные массивы, добавляем все точки
            for inner_polygon in polygon:
                flattened_polygons.append(inner_polygon)
        else:
            # Если это простой полигон, добавляем как есть
            flattened_polygons.append(polygon)
            
    return any(point_in_polygon(point, polygon) for polygon in flattened_polygons)


def find_areas_for_point(x, y, area_points_list, area_labels):
    belongs = []
    test_point = (x, y)
    for polygon, label in zip(area_points_list, area_labels):
        if point_in_multipolygon(test_point, polygon):
            belongs.append(label)
    return belongs

with open('app/init_data/extracted_data.json', 'r', encoding='utf-8') as f:
    extracted_data = json.load(f)

area_points_list = [data['coordinates'] for data in extracted_data]
area_labels = [data['n_area'] for data in extracted_data]

area_ids = [i for i in range(len(extracted_data))]

areas_info = []

for data in extracted_data:
    areas_info.append({
        "area_id": data['n_area'],
        "area_name": data['name'],
        "type": data['type'],
        "coordinates": data['coordinates']  # this will become a list of tuples
    })