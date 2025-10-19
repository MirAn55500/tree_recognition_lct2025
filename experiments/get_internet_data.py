"""
Модуль для сбора изображений из интернета по заданным спискам видов деревьев, кустарников и болезней.
Использует Google Images для поиска и загружает изображения, отфильтровывая их по минимальному размеру.
"""

import os
import re
import requests
import io

from PIL import Image
import matplotlib.pyplot as plt

# Флаг для включения/выключения отображения загруженных изображений
DISPLAY_IMAGES = False

# --- Списки для поиска изображений ---

trees = [
    "берёза повислая",
    "липа мелколистная",
    "липа крупнолистная",
    "рябина обыкновенная",
    "ива плакучая",
    "тополь белый",
    "дуб черешчатый",
    "дуб красный",
    "ель европейская",
    "черёмуха обыкновенная",
    "яблоня садовая",
    "сирень обыкновенная",
    "вишня обыкновенная",
    "клён платановидный",
    "клён-явор",
    "каштан конский",
    "ясень обыкновенный",
]

shrubs = [
    "Кизильник блестящий", "Спирея серая", "Чубушник венечный",
    "Дёрен пестролистный", "Боярышник однопестичный"
]

diseases = [
    'стволовая гниль',
    'комплексное усыхание дерева',
    'голландская болезнь вяза',
    'естественное отмирание ветвей',
    'березовый трутовик',
    'вертициллезное увядание',
    'ядровая гниль, вызванная дереворазрушающими грибами',
    'корневая гниль дерева',
    'корневая гниль кустарника',
    'комлевая гниль',
    'механическое повреждение ствола дерева',
    'халаровый некроз',
    'повреждение дерева насекомыми-филлофагами',
    'повреждение кустарника насекомыми-филлофагами',
    'ржавчина на дереве',
    'ржавчина на кустарнике',
    'фитофтороз кустарника',
    'фитофтороз дерева',
    'рак дерева',
    'рак кустарника',
    'корневая губка',
    'мучнистая роса дерева',
    'мучнистая роса кустарника',
]

def download_filtered_images(species_list: list, parent_folder: str, min_size: int = 256):
    """
    Загружает изображения для каждого элемента из species_list,
    сохраняя их в подпапки внутри parent_folder. Изображения фильтруются
    по минимальному размеру (min_size x min_size).

    Args:
        species_list (list): Список строк с названиями видов или болезней для поиска.
        parent_folder (str): Путь к основной папке, где будут созданы подпапки для каждого вида/болезни.
        min_size (int): Минимальная длина одной из сторон изображения для сохранения (в пикселях).
    """
    # Создаем корневую папку, если она еще не существует
    if not os.path.exists(parent_folder):
        os.makedirs(parent_folder)

    for species in species_list:
        # Создаем подпапку для текущего вида/болезни
        species_folder = os.path.join(parent_folder, species)
        if not os.path.exists(species_folder):
            os.makedirs(species_folder)

        print(f"\n--- Поиск изображений для: {species} ---")
        # Формируем поисковый запрос для Google Images
        search_query = species.replace(" ", "+")
        url = f"https://www.google.com/search?q={search_query}&tbm=isch"

        # Заголовки для имитации запроса от браузера
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        try:
            # Отправляем HTTP GET запрос
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # Проверяем на ошибки HTTP

            # Извлекаем URL прямых изображений из HTML-ответа
            # Используем регулярное выражение для поиска ссылок на jpg, jpeg, png
            image_urls = re.findall(r'"(https?://[^\s"]+\.(?:jpg|jpeg|png))"', response.text)
            # Удаляем дубликаты, сохраняя порядок
            unique_urls = list(dict.fromkeys(image_urls))

            if not unique_urls:
                print(f"  - Не удалось найти прямые ссылки на изображения для '{species}'.")
                continue

            print(f"Найдено {len(unique_urls)} потенциальных ссылок. Начинаю загрузку и фильтрацию...")
            
            count = 0  # Счетчик успешно загруженных изображений
            first_image_path = None  # Путь к первому успешно загруженному изображению
            url_index = 0

            # Итерируемся по найденным URL, пока не обработаем все или не достигнем лимита (если бы он был)
            while url_index < len(unique_urls):
                img_url = unique_urls[url_index]
                url_index += 1  # Переходим к следующему URL

                try:
                    # Загружаем содержимое изображения
                    image_data = requests.get(img_url, timeout=10).content
                    
                    # Открываем изображение из байтов для проверки его свойств
                    image_file = io.BytesIO(image_data)
                    image = Image.open(image_file)
                    
                    # Проверяем размеры изображения
                    width, height = image.size
                    if width >= min_size and height >= min_size:
                        # Если изображение соответствует минимальным требованиям, сохраняем его
                        # Формируем имя файла из названия вида и порядкового номера
                        image_path = os.path.join(species_folder, f"{species.replace(' ', '_')}_{count+1}.jpg")
                        with open(image_path, 'wb') as f:
                            f.write(image_data)
                        
                        print(f"  (Изображение №{count+1}) Сохранено: {os.path.basename(image_path)} (размер {width}x{height})")
                        
                        if first_image_path is None:
                            first_image_path = image_path  # Сохраняем путь к первому изображению для отображения
                        
                        count += 1
                    else:
                        # Если изображение слишком маленькое, пропускаем его
                        print(f"  - Пропущено: размер {width}x{height} меньше {min_size}x{min_size} (URL: {img_url[:40]}...)")

                except requests.exceptions.RequestException as req_e:
                    print(f"  - Ошибка сети или запроса для URL {img_url[:40]}...: {req_e}")
                except Image.UnidentifiedImageError:
                    print(f"  - Пропущено: Не удалось идентифицировать изображение по URL {img_url[:40]}...")
                except Exception as e:
                    print(f"  - Непредвиденная ошибка при обработке URL {img_url[:40]}...: {e}")

            print(f"Загружено {count} подходящих изображений для '{species}'.")

            # Отображение первого успешно загруженного изображения (если DISPLAY_IMAGES = True)
            if DISPLAY_IMAGES and first_image_path:
                print(f"Отображаю первое изображение для {species}...")
                try:
                    img = Image.open(first_image_path)
                    plt.imshow(img)
                    plt.title(species)
                    plt.axis('off')
                    plt.show()
                except Exception as display_e:
                    print(f"  - Не удалось отобразить изображение '{first_image_path}': {display_e}")

        except requests.exceptions.RequestException as req_e:
            print(f"Ошибка сети при запросе для '{species}': {req_e}")
        except Exception as e:
            print(f"Непредвиденная ошибка при обработке '{species}': {e}")


# --- Основная часть скрипта ---
if __name__ == "__main__":
    # Загружаем изображения для деревьев в папку "Деревья"
    download_filtered_images(trees, "Деревья")
    # Загружаем изображения для кустарников в папку "Кустарники"
    download_filtered_images(shrubs, "Кустарники")
    # Загружаем изображения для болезней в папку "Болезни деревьев и кустарников"
    download_filtered_images(diseases, "Болезни деревьев и кустарников")

    print("\nСоздание датасета завершено.")
