"""
Модуль `gemini_annotation.py` предназначен для автоматической разметки изображений с использованием
мультимодальной модели Google Gemini. Он загружает изображения из указанной директории,
отправляет их в Gemini для анализа и сохраняет полученные аннотации в формате JSON.
Скрипт также поддерживает дозагрузку, избегая повторной обработки уже размеченных изображений.
"""

import os
import json
import time
import typing
import enum

from PIL import Image
import google.generativeai as genai  # Изменено на google.generativeai
from google.generativeai import types  # Изменено на google.generativeai.types

from dotenv import load_dotenv

# --- Конфигурация и константы ---

load_dotenv() # Загружаем переменные окружения из файла .env

GEMINI_API_KEY = os.getenv('GEMINI_KEY')
MODEL_NAME = "gemini-2.5-flash"  # Используемая модель Gemini
IMAGE_DIRECTORY = 'crops_dataset/crops/'  # Директория с изображениями для разметки
OUTPUT_FILENAME = 'result.json'  # Имя файла для сохранения результатов аннотации
NUM_FILES_TO_PROCESS = 50  # Количество файлов для обработки за один запуск (для ограничения)
START_INDEX = 0  # Начальный индекс файла для обработки из списка
API_REQUEST_DELAY_SECONDS = 3  # Задержка между запросами к API Gemini во избежание превышения лимитов
MAX_RETRIES = 3  # Максимальное количество попыток отправки запроса в случае ошибки

# --- Определение схемы ответа (TypedDict и Enum для структурированного JSON) ---

class Disease(enum.Enum):
    """Перечисление возможных болезней растений."""
    STEM_ROT = "стволовая гниль"
    COMPLEX_DRYING = "комплексное усыхание"
    DUTCH_ELM_DISEASE = "голландская болезнь вяза"
    NATURAL_BRANCH_DIEBACK = "естественное отмирание ветвей"
    BIRCH_POLYPORE = "березовый трутовик"
    VERTICILLIUM_WILT = "вертициллезное увядание"
    HEART_ROT_WOOD_DESTROYING_FUNGI = "ядровая гниль, вызванная дереворазрушающими грибами"
    ROOT_OR_BUTT_ROT = "корневая или комлевая гниль"
    MECHANICAL_TRUNK_DAMAGE = "механическое повреждение ствола"
    CHALAROSIS_NECROSIS = "халаровый некроз"
    PHYLLOPHAGOUS_INSECT_DAMAGE = "повреждение насекомыми-филлофагами"
    RUST = "ржавчина"
    PHYTOPHTHORA = "фитофтороз"
    CANCER = "рак"
    ROOT_SPONGE = "корневая губка"
    POWDERY_MILDEW = "мучнистая роса"
    NO_DISEASE = "нет заболевания"
    OTHER = "другое"


class SpeciesProbability(typing.TypedDict):
    """Схема для вероятности определения вида растения."""
    species: str
    probability: float

class DiseaseProbability(typing.TypedDict):
    """Схема для вероятности определения болезни."""
    disease: Disease
    probability: float

class Annotation(typing.TypedDict):
    """Основная схема для аннотации одного объекта (растения) на изображении."""
    plant_class: str
    species_probabilities: typing.List[SpeciesProbability]
    stem_rot: float
    hollows: float
    cracks: float
    stem_damage: float
    crown_damage: float
    fruiting_bodies: float
    diseases_probabilities: typing.List[DiseaseProbability]
    dry_branches_percentage: int

class AnalysisResult(typing.TypedDict):
    """Схема для полного результата анализа одного изображения."""
    img_url: str
    annotations: typing.List[Annotation]

# Системные инструкции для модели Gemini, определяющие её роль и формат ответа.
SYSTEM_INSTRUCTION = """
Ты — эксперт-арборист и фитопатолог. Проведи детальный анализ фотографии городских зеленых насаждений.
Твоя задача — вернуть JSON.

Определи для основного растения на снимке:
- `plant_class`: "дерево" или "кустарник".
- `species_probabilities`: массив из двух наиболее вероятных пород с их вероятностями.
- `stem_rot`, `hollows`, `cracks`, `stem_damage`, `crown_damage`, `fruiting_bodies`: вероятности от 0.0 до 1.0.
- `diseases_probabilities`: массив из двух наиболее вероятных болезней с их вероятностями.
- `dry_branches_percentage`: процент сухих ветвей.

Список возможных болезней. Бери только отсюда. Не нужно давать дополнительные комментарии.

стволовая гниль; комплексное усыхание; голландская болезнь вяза; естественное отмирание ветвей;
березовый трутовик; вертициллезное увядание; ядровая гниль, вызванная дереворазрушающими грибами;
корневая или комлевая гниль; механическое повреждение ствола; халаровый некроз;
повреждение насекомыми-филлофагами; ржавчина; фитофтороз; рак; корневая губка;
мучнистая роса; нет заболевания; другое.

Список пород. Бери только отсюда. Не нужно давать дополнительные комментарии. 

Боярышник однопестичный, Дёрен пестролистный, Кизильник блестящий, Спирея серая,
Чубушник венечный, берёза повислая, вишня обыкновенная, дуб красный,
дуб черешчатый, ель европейская, ива плакучая, каштан конский, клён платановидный,
клён-явор, липа крупнолистная, липа мелколистная, рябина обыкновенная, сирень обыкновенная,
тополь белый, черёмуха обыкновенная, яблоня садовая, ясень обыкновенный, другой.

Вся текстовая информация в ответе должна быть на русском языке.
"""

def analyze_image_with_gemini(image_path: str) -> typing.List[Annotation] | None:
    """
    Отправляет изображение в модель Gemini для анализа и получения структурированных аннотаций.

    Args:
        image_path (str): Путь к изображению для анализа.

    Returns:
        typing.List[Annotation] | None: Список аннотаций, если запрос успешен,
                                     иначе None в случае ошибок или неудачных попыток.
    """
    print(f"Загрузка изображения: {image_path}...")
    try:
        # Открываем изображение с помощью PIL (Pillow)
        img = Image.open(image_path)
    except IOError as e:
        print(f"Ошибка: Не удалось загрузить изображение по пути '{image_path}'. {e}")
        return None

    # Конфигурация для инструмента Google Search (хотя в данном случае не используется напрямую)
    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )

    # Настройка генерации контента для модели Gemini
    generation_config = {
        "temperature": 0.1,  # Температура для предсказуемости ответов (0.1 - более детерминированный)
        "system_instruction": SYSTEM_INSTRUCTION,  # Системные инструкции, определяющие роль и формат.
        "tools": [grounding_tool],  # Список доступных инструментов
        "response_schema": Annotation,  # Ожидаемая схема ответа в формате TypedDict
    }

    for attempt in range(MAX_RETRIES):
        # Инициализация клиента Gemini API на каждой попытке, чтобы избежать потенциальных проблем с соединениями
        genai.configure(api_key=GEMINI_API_KEY) # Конфигурация API ключа
        client = genai.GenerativeModel(model_name=MODEL_NAME) # Использование GenerativeModel
        try:
            print(f"Отправка запроса в модель {MODEL_NAME} (попытка {attempt + 1}/{MAX_RETRIES})...")
            response = client.generate_content(
                contents=[img],
                generation_config=generation_config,
            )
            
            # Выводим полный текст ответа для отладки
            # print(response.text)
            
            # Извлекаем только JSON-часть из ответа, удаляя маркдаун-блоки
            json_string = response.text.strip()
            if json_string.startswith("```json") and json_string.endswith("```"):
                json_string = json_string[len("```json"): -len("```")].strip()
            elif json_string.startswith("`") and json_string.endswith("`"):
                json_string = json_string[1:-1].strip()

            # Декодируем JSON-строку в Python-объект
            return json.loads(json_string)

        except json.JSONDecodeError as e:
            print(f"Ошибка декодирования JSON в ответе модели: {e}")
            print(f"Полученный текст ответа: {response.text if 'response' in locals() else 'Ответ не получен'}")
        except Exception as e:
            print(f"Произошла непредвиденная ошибка при запросе к Gemini: {e}")
        
        # Если это не последняя попытка, ждем перед повтором
        if attempt < MAX_RETRIES - 1:
            time.sleep(API_REQUEST_DELAY_SECONDS)

    print(f"Не удалось получить валидный ответ от Gemini после {MAX_RETRIES} попыток.")
    return None


def load_previous_results(filename: str) -> typing.Tuple[typing.List[AnalysisResult], typing.Set[str]]:
    """
    Загружает ранее сохраненные результаты аннотации из JSON-файла.
    
    Args:
        filename (str): Путь к JSON-файлу с предыдущими результатами.

    Returns:
        typing.Tuple[typing.List[AnalysisResult], typing.Set[str]]: Кортеж, содержащий:
            - Список всех загруженных результатов анализа (AnalysisResult).
            - Множество URL изображений, которые уже были обработаны.
            Если файл не найден, поврежден или имеет неверный формат, возвращает пустые структуры.
    """
    if not os.path.exists(filename):
        return [], set()
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            all_results = json.load(f)
            if not isinstance(all_results, list):
                print(f"Предупреждение: Файл '{filename}' имеет неверный формат (не является списком). Начинаем с чистого листа.")
                return [], set()

            # Извлекаем URL всех уже обработанных изображений для быстрого поиска
            processed_urls = {res.get('img_url') for res in all_results if 'img_url' in res}
            return all_results, processed_urls
    except (json.JSONDecodeError, IOError) as e:
        print(f"Предупреждение: Файл '{filename}' поврежден или недоступен ({e}). Начинаем с чистого листа.")
        return [], set()

def save_results(results_list: typing.List[AnalysisResult], filename: str):
    """
    Сохраняет список результатов анализа в JSON-файл с красивым форматированием.

    Args:
        results_list (typing.List[AnalysisResult]): Список результатов для сохранения.
        filename (str): Путь к файлу, в который будут сохранены результаты.
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results_list, f, ensure_ascii=False, indent=2)
        print(f"Результаты успешно сохранены в '{filename}'")
    except IOError as e:
        print(f"Критическая ошибка: Не удалось записать в файл '{filename}'. {e}")

# --- Основной цикл выполнения скрипта ---

if __name__ == "__main__":
    # Проверяем наличие API ключа
    if not GEMINI_API_KEY:
        print("Критическая ошибка: Переменная окружения 'GEMINI_KEY' не установлена. Пожалуйста, укажите API ключ Gemini в файле .env.")
        exit(1) # Выход с кодом ошибки

    # Проверяем доступность директории с изображениями
    if not os.path.isdir(IMAGE_DIRECTORY):
        print(f"Критическая ошибка: Директория с изображениями '{IMAGE_DIRECTORY}' не найдена. Проверьте путь.")
        exit(1)

    # Получаем список всех изображений в директории
    image_files = sorted([
        f for f in os.listdir(IMAGE_DIRECTORY)
        if f.lower().endswith(('.png', '.jpg', '.jpeg'))
    ])

    total_files = len(image_files)
    print(f"Найдено {total_files} изображений для обработки.")

    # Загружаем предыдущие результаты, чтобы не обрабатывать одно и то же изображение дважды
    all_analysis_results, processed_image_urls = load_previous_results(OUTPUT_FILENAME)
    print(f"Найдено {len(processed_image_urls)} изображений, уже обработанных ранее.")
    
    files_processed_this_run = 0
    # Итерируемся по изображениям, начиная с указанного индекса
    for i, filename in enumerate(image_files[START_INDEX:]):
        full_path = os.path.join(IMAGE_DIRECTORY, filename)
        
        # Проверяем, было ли изображение уже обработано
        if full_path in processed_image_urls:
            print(f"[{START_INDEX + i + 1}/{total_files}] Пропуск: '{full_path}' (уже обработан ранее).")
            continue
        
        print(f"--- [{START_INDEX + i + 1}/{total_files}] Обработка изображения: '{full_path}' ---")
        annotations_list = analyze_image_with_gemini(full_path)
        
        if annotations_list is not None:
            # Формируем итоговый объект результата
            final_result = {
                'img_url': full_path,
                'annotations': annotations_list
            }
            
            # Добавляем новый результат в общий список
            all_analysis_results.append(final_result)
            
            # Сохраняем все результаты в JSON файл
            save_results(all_analysis_results, OUTPUT_FILENAME)
            files_processed_this_run += 1

            # Прерываем обработку, если достигнут лимит файлов за один запуск
            if NUM_FILES_TO_PROCESS and files_processed_this_run >= NUM_FILES_TO_PROCESS:
                print(f"Достигнут лимит на количество обрабатываемых файлов ({NUM_FILES_TO_PROCESS}). Завершение работы.")
                break
        else:
            print(f"Не удалось получить валидные аннотации для '{full_path}'. Файл пропущен.")
            # Если возникла проблема, возможно, стоит остановиться или пропустить несколько файлов
            # Здесь можно добавить логику для пропуска нескольких файлов перед остановкой
            # или для увеличения задержки.
            # break # Закомментировано, чтобы не останавливать весь процесс из-за одной ошибки

        # Задержка между запросами к API
        if (START_INDEX + i + 1) < total_files:
            time.sleep(API_REQUEST_DELAY_SECONDS)

    print(f"\nОбработка завершена. Все обработанные результаты сохранены в '{OUTPUT_FILENAME}'.")