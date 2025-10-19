# Система определения заболеваний деревьев

## Описание проекта

Это backend-часть системы для автоматического определения заболеваний деревьев на основе фотографий. Система использует машинное обучение для обнаружения и классификации дефектов на стволах деревьев (дупла, трещины, гнили и т.д.).

## Архитектура системы

Система состоит из **4 микросервисов**, работающих в Docker-контейнерах:

### 1. Backend API (FastAPI) - порт 8000

**Основной функционал:**
- Управление загрузкой и хранением фотографий
- Работа с базой данных (PostgreSQL)
- Управление исследованиями и датасетами
- Координация работы с ML-моделями
- REST API для фронтенда

**Хранимые данные:**
- **Photos** - метаданные фотографий (координаты, статус обработки, статистика дефектов)
- **Researches** - исследования, объединяющие группы фотографий
- **Datasets** - датасеты для дообучения моделей
- Связи между фотографиями, исследованиями и датасетами

**Основные endpoints:**

#### Работа с фотографиями
- `POST /api/upload_photo` - загрузка фото с координатами
- `POST /api/process_photo` - запуск обработки фото ML-моделями
- `GET /api/photo_status/{photo_id}` - получение статуса обработки
- `GET /api/photos` - список всех фото с пагинацией
- `GET /api/photo_ids` - получение ID всех фото
- `GET /api/photo/{photo_id}/file` - скачивание файла фото
- `GET /api/photo/{photo_id}/draw_boxes` - фото с отрисованными bounding box'ами
- `PUT /api/photo/{photo_id}/statistics` - обновление статистик фото

#### Работа с исследованиями
- `POST /api/create_research` - создание исследования с группой фото
- `GET /api/get_researches` - список всех исследований
- `GET /api/get_research/{research_id}` - детали исследования с усредненной статистикой

#### Работа с датасетами
- `POST /api/create_dataset` - создание датасета
- `GET /api/datasets` - список всех датасетов
- `GET /api/dataset/{dataset_id}` - получение датасета с ID фотографий
- `POST /api/dataset/add_photo` - добавление фото к датасету
- `POST /api/dataset/{dataset_id}/train` - запуск дообучения моделей

#### Работа с картой
- `GET /api/get_map_points` - все точки с координатами для карты
- `GET /api/get_areas` - полигоны областей для отображения на карте
- `GET /api/get_area_statistics/{area_id}` - статистика по области

**Технологии:**
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL
- MinIO (хранилище изображений)
- Pydantic (валидация данных)

---

### 2. Model Backend (ML Inference) - порт 7000

**Основной функционал:**
- Инференс ML-моделей для анализа фотографий
- Обнаружение дефектов на деревьях
- Классификация типов дефектов
- Определение характеристик деревьев

**Используемые модели:**
- YOLO - детекция объектов (bounding boxes)
- Классификатор видов деревьев
- Классификатор заболеваний
- Модель определения характеристик

**Возвращаемые данные:**
```json
{
  "results": [
    {
      "bbox": [x_min, y_min, x_max, y_max],
      "species": "береза",
      "disease": "гниль",
      "characteristics": {...}
    }
  ],
  "statistics": {
    "hollows": 0.24,
    "cracks": 0.61,
    "rot": 0.15
  }
}
```

**Технологии:**
- PyTorch
- YOLO
- FastAPI

---

### 3. PostgreSQL Database - порт 5500

**Назначение:** Основная реляционная база данных для хранения структурированной информации.

**Таблицы:**

#### `photos`
Хранит метаданные всех загруженных фотографий:
- `id` - уникальный идентификатор
- `filename` - имя файла
- `file_path` - путь в MinIO
- `latitude`, `longitude` - GPS координаты
- `area_number` - номер области на карте
- `status` - статус обработки (uploaded, processing, processed, error)
- `statistics` - JSON с результатами анализа
- `created_at` - дата загрузки

#### `researches`
Группы фотографий для совместного анализа:
- `id` - уникальный идентификатор
- `name` - название исследования
- `description` - описание
- `created_at` - дата создания

#### `research_photos`
Связь между исследованиями и фотографиями:
- `research_id` - ID исследования
- `photo_id` - ID фото
- `order_index` - порядок в исследовании

#### `datasets`
Датасеты для дообучения моделей:
- `id` - уникальный идентификатор
- `name` - название датасета
- `description` - описание
- `created_at` - дата создания

#### `dataset_photos`
Связь между датасетами и фотографиями:
- `dataset_id` - ID датасета
- `photo_id` - ID фото

**Параметры подключения:**
- База: `plantdb`
- Пользователь: `user`
- Пароль: `password`
- Хост: `db:5432` (внутри Docker)
- Внешний порт: `5500`

---

### 4. MinIO Object Storage - порты 9200, 9201

**Назначение:** S3-совместимое хранилище для файлов изображений.

**Основной функционал:**
- Хранение оригинальных фотографий деревьев
- Высокопроизводительный доступ к изображениям
- Версионирование файлов
- Web-консоль для управления (порт 9201)

**Bucket:** `images`

**Доступ:**
- API: http://localhost:9200
- Web-консоль: http://localhost:9201
- Credentials: `minioadmin / minioadmin`

**Технологии:**
- MinIO (S3-compatible storage)

---

## Структура проекта

```
backend/
├── backend-app/          # Основной API сервис
│   ├── app/
│   │   ├── config.py           # Конфигурация
│   │   ├── database.py         # Подключение к БД
│   │   ├── models.py           # SQLAlchemy модели
│   │   ├── schemas.py          # Pydantic схемы
│   │   ├── crud.py             # CRUD операции
│   │   ├── image_processor.py  # Обработка изображений
│   │   ├── statistics_processor.py  # Усреднение статистик
│   │   ├── minio_client.py     # Клиент MinIO
│   │   ├── draw.py             # Отрисовка bounding boxes
│   │   └── init_data/          # Начальные данные (GeoJSON)
│   ├── main.py           # Основное приложение FastAPI
│   ├── requirements.txt
│   └── Dockerfile
│
├── models/               # ML-сервис
│   ├── app/
│   │   ├── inference.py        # Инференс моделей
│   │   ├── model.py            # Загрузка и управление моделями
│   │   ├── main.py             # FastAPI приложение
│   │   └── models/             # Веса моделей (.pth, .pt)
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml    # Оркестрация всех сервисов
└── README.md            # Эта документация
```

---

## Инструкция по развертыванию

### 1. Установите Docker и Docker Compose

#### Для Ubuntu/Debian:

```bash
# Обновление пакетов
sudo apt update

# Установка Docker
sudo apt install docker.io

# Установка Docker Compose
sudo apt install docker-compose

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
```

#### Для CentOS/RHEL:

```bash
# Установка Docker
sudo yum install docker

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Запуск Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Проверка установки

```bash
docker --version
docker-compose --version
```

### 3. Запуск приложения

```bash
# Клонирование репозитория (если еще не сделано)
git clone <repository-url>
cd backend

# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down
```

### 4. Проверка работы

После запуска будут доступны следующие интерфейсы:

- **API Documentation (Swagger):** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health
- **MinIO Console:** http://localhost:9201 (minioadmin / minioadmin)
- **PostgreSQL:** localhost:5500 (user / password / plantdb)
- **Model Backend:** http://localhost:7000

---

## Типичные сценарии использования

### 1. Загрузка и обработка фото

```bash
# 1. Загрузка фото
curl -X POST "http://localhost:8000/api/upload_photo" \
  -F "file=@tree.jpg" \
  -F "latitude=55.7558" \
  -F "longitude=37.6173"

# Ответ: {"photo_id": 1, "message": "Photo uploaded successfully"}

# 2. Запуск обработки
curl -X POST "http://localhost:8000/api/process_photo?photo_id=1"

# 3. Проверка статуса
curl -X GET "http://localhost:8000/api/photo_status/1"
```

### 2. Создание исследования

```bash
curl -X POST "http://localhost:8000/api/create_research" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Исследование парка Сокольники",
    "description": "Анализ состояния деревьев",
    "photo_ids": [1, 2, 3, 4, 5]
  }'
```

### 3. Создание датасета для обучения

```bash
# 1. Создание датасета
curl -X POST "http://localhost:8000/api/create_dataset" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Training Set v1",
    "description": "Первый датасет для дообучения"
  }'

# 2. Добавление фото к датасету
curl -X POST "http://localhost:8000/api/dataset/add_photo" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": 1,
    "photo_id": 1
  }'

# 3. Запуск обучения
curl -X POST "http://localhost:8000/api/dataset/1/train"
```

---

## Модель данных

### Основные сущности:

```
Photo (фотография)
  ├── coordinates (GPS)
  ├── statistics (результаты ML)
  └── связи с:
      ├── ResearchPhoto (участие в исследованиях)
      └── DatasetPhoto (участие в датасетах)

Research (исследование)
  └── research_photos[]
      └── photo (множество фотографий)

Dataset (датасет)
  └── dataset_photos[]
      └── photo (множество фотографий)
```

---

## Расширенная конфигурация

### Переменные окружения (docker-compose.yml)

**Backend:**
- `DATABASE_URL` - строка подключения к PostgreSQL
- `MINIO_ENDPOINT` - адрес MinIO сервера
- `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` - credentials для MinIO
- `MINIO_BUCKET` - имя bucket для хранения изображений

**Database:**
- `POSTGRES_DB` - имя базы данных
- `POSTGRES_USER` - пользователь БД
- `POSTGRES_PASSWORD` - пароль БД

**MinIO:**
- `MINIO_ROOT_USER` - root пользователь
- `MINIO_ROOT_PASSWORD` - root пароль

---

## Разработка

### Запуск в режиме разработки

```bash
# Backend API
cd backend-app
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Model Backend
cd models
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 7000
```

### Работа с базой данных

```bash
# Подключение к PostgreSQL
psql -h localhost -p 5500 -U user -d plantdb

# Просмотр таблиц
\dt

# Пример запроса
SELECT id, filename, status FROM photos LIMIT 10;
```

---

## Производительность и масштабирование

### Рекомендуемые ресурсы:

- **Backend API:** 2 CPU, 4GB RAM
- **Model Backend:** 4 CPU, 8GB RAM (или GPU)
- **PostgreSQL:** 2 CPU, 4GB RAM, SSD
- **MinIO:** 2 CPU, 2GB RAM, достаточно дискового пространства

---

## Мониторинг

Все сервисы имеют health-check endpoints:

- Backend: `http://localhost:8000/health`
- Model Backend: `http://localhost:7000/health`
- PostgreSQL: автоматический health-check
- MinIO: `http://localhost:9200/minio/health/live`

---

## Поддержка и документация

- **Swagger UI:** http://localhost:8000/docs - интерактивная документация API


