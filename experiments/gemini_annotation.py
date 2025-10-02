import os
import json
import time
import typing
import enum

from PIL import Image
import google.genai as genai
from google.genai import types

from dotenv import load_dotenv

# --- Шаг 1: Конфигурация и константы ---

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_KEY')
# Как вы и просили, используем лучшую доступную модель
MODEL_NAME = "gemini-2.5-flash"
# MODEL_NAME = "gemini-2.5-pro"
IMAGE_DIRECTORY = 'crops_dataset/crops/'
# Имя файла для красивого, отформатированного JSON
OUTPUT_FILENAME = 'result.json'
NUM_FILES_TO_PROCESS = 50
start_idx = 0
API_REQUEST_DELAY_SECONDS = 3
MAX_RETRIES = 3

# --- Шаг 2: Определение схемы ответа ---
# Схема не изменилась, она по-прежнему актуальна.

class Disease(enum.Enum):
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
    species: str
    probability: float

class DiseaseProbability(typing.TypedDict):
    disease: Disease
    probability: float

class Annotation(typing.TypedDict):
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
    img_url: str
    annotations: typing.List[Annotation]

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

# --- Шаг 3: Основная функция для анализа изображения ---

def analyze_image_with_gemini(image_path: str) -> list | None:
    """
    Анализирует изображение и возвращает список аннотаций.
    """
    print(f"Загрузка изображения: {image_path}...")
    try:
        img = Image.open(image_path)
    except IOError as e:
        print(f"Ошибка: Не удалось загрузить изображение. {e}")
        return None

    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )
    generation_config = {
        "temperature": 0.1,
        "system_instruction": SYSTEM_INSTRUCTION,
        "tools": [grounding_tool],
        "response_schema": Annotation,
    }

    for attempt in range(MAX_RETRIES):
        client = genai.Client(api_key=GEMINI_API_KEY)
        try:
            print(f"Отправка запроса в модель {MODEL_NAME} (попытка {attempt + 1}/{MAX_RETRIES})...")
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=[img],
                config=generation_config,
            )
            print(response.text)
            
            # Извлекаем только JSON-часть из ответа, убирая ```json и ```
            json_string = response.text.strip().strip('`').lstrip('json').strip()
            
            return json.loads(json_string)

        except json.JSONDecodeError as e:
            print(f"Ошибка декодирования JSON: {e}")
            print(f"Полученный текст ответа: {response.text if 'response' in locals() else 'Ответ не получен'}")
            return None
        
        except Exception as e:
            print(f"Произошла непредвиденная ошибка: {e}")
            return None

    return None


def load_previous_results(filename: str) -> tuple[list, set]:
    """
    Загружает предыдущие результаты из JSON-файла.
    Возвращает список всех результатов и множество URL уже обработанных изображений.
    """
    if not os.path.exists(filename):
        return [], set()
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            # Считываем весь файл как один JSON-объект (который должен быть списком)
            all_results = json.load(f)
            if not isinstance(all_results, list):
                print(f"Предупреждение: Файл {filename} имеет неверный формат (не является списком). Начинаем с чистого листа.")
                return [], set()

            processed_urls = {res.get('img_url') for res in all_results if 'img_url' in res}
            return all_results, processed_urls
    except (json.JSONDecodeError, IOError):
        print(f"Предупреждение: Файл {filename} поврежден или пуст. Начинаем с чистого листа.")
        return [], set()


# --- Шаг 4: Основной цикл выполнения ---

if __name__ == "__main__":
    if not GEMINI_API_KEY:
        print("Критическая ошибка: Переменная окружения GEMINI_API_KEY не установлена.")
        exit()

    if not os.path.isdir(IMAGE_DIRECTORY):
        print(f"Критическая ошибка: Директория с изображениями '{IMAGE_DIRECTORY}' не найдена.")
        exit()

    image_files = sorted([f for f in os.listdir(IMAGE_DIRECTORY) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])

    total_files = len(image_files)
    print(f"Найдено {total_files} изображений для обработки.")

    # Загружаем все предыдущие результаты в память
    all_analysis_results, processed_image_urls = load_previous_results(OUTPUT_FILENAME)
    print(f"Найдено {len(processed_image_urls)} уже обработанных изображений.")
    
    processed = 0
    for i, filename in enumerate(image_files[start_idx:]):
        full_path = os.path.join(IMAGE_DIRECTORY, filename)
        
        if full_path in processed_image_urls:
            print(f"[{i+1}/{total_files}] Пропуск: {full_path} (уже обработан).")
            continue
        
        print(f"--- [{i+1}/{total_files}] Обработка: {full_path} ---")
        annotations_list = analyze_image_with_gemini(full_path)
        
        if annotations_list is not None:
            final_result = {
                'img_url': full_path,
                'annotations': annotations_list
            }
            
            # Добавляем новый результат в общий список
            all_analysis_results.append(final_result)
            
            # Перезаписываем весь файл с красивым форматированием
            try:
                with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as f:
                    # json.dump с параметром indent=2 делает JSON читаемым
                    json.dump(all_analysis_results, f, ensure_ascii=False, indent=2)
                print(f"Результат для {full_path} успешно сохранен в {OUTPUT_FILENAME}")
            except IOError as e:
                print(f"Критическая ошибка: Не удалось записать в файл {OUTPUT_FILENAME}. {e}")
            processed += 1
            if processed == NUM_FILES_TO_PROCESS:
                break

        else:
            print(f"Не удалось получить результат для {full_path}. Файл пропущен.")
            break

        if i < total_files - 1:
            time.sleep(API_REQUEST_DELAY_SECONDS)

    print(f"\nОбработка завершена. Все результаты сохранены в {OUTPUT_FILENAME}")