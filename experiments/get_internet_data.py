import os
import re
import requests
import io

from PIL import Image
import matplotlib.pyplot as plt
DISPLAY_IMAGES = False

# Списки деревьев и кустарников
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

def download_filtered_images(species_list, parent_folder, min_size=256):
    """
    Загружает изображения, фильтруя их по минимальному размеру, и отображает первое.
    """
    if not os.path.exists(parent_folder):
        os.makedirs(parent_folder)

    for species in species_list:
        species_folder = os.path.join(parent_folder, species)
        if not os.path.exists(species_folder):
            os.makedirs(species_folder)

        print(f"\n--- Поиск изображений для: {species} ---")
        search_query = species.replace(" ", "+")
        url = f"https://www.google.com/search?q={search_query}&tbm=isch"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()

            # Находим все потенциальные URL изображений
            image_urls = re.findall(r'"(https?://[^\s"]+\.(?:jpg|jpeg|png))"', response.text)
            unique_urls = list(dict.fromkeys(image_urls))

            if not unique_urls:
                print(f"  - Не удалось найти прямые ссылки на изображения для '{species}'.")
                continue

            print(f"Найдено {len(unique_urls)} потенциальных ссылок. Начинаю загрузку и фильтрацию...")
            
            count = 0
            first_image_path = None
            url_index = 0

            # Цикл будет работать, пока не наберем num_images или пока не закончатся ссылки
            while url_index < len(unique_urls):
                img_url = unique_urls[url_index]
                url_index += 1 # Сразу переходим к следующему индексу

                try:
                    # Загружаем данные изображения
                    image_data = requests.get(img_url, timeout=10).content
                    
                    # Создаем объект изображения в памяти для проверки
                    image_file = io.BytesIO(image_data)
                    image = Image.open(image_file)
                    
                    # Проверяем размеры
                    width, height = image.size
                    if width >= min_size and height >= min_size:
                        # Если качество подходит, сохраняем
                        image_path = os.path.join(species_folder, f"{species.replace(' ', '_')}_{count+1}.jpg")
                        with open(image_path, 'wb') as f:
                            f.write(image_data)
                        
                        print(f"  (Изображение №{count+1}) Сохранено: {os.path.basename(image_path)} (качество {width}x{height})")
                        
                        if first_image_path is None: # Сохраняем путь к первому качественному изображению
                            first_image_path = image_path
                        
                        count += 1
                    else:
                        # Иначе - выводим сообщение и ищем дальше
                        print(f"  - Пропущено: качество {width}x{height} < {min_size}x{min_size} (ссылка: {img_url[:40]}...)")

                except Exception as e:
                    print(f"  - Ошибка при обработке ссылки {img_url[:40]}...: {e}")

            print(f"Загружено {count} подходящих изображений для '{species}'.")

            # Отображение первого качественного изображения
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

        except Exception as e:
            print(f"Непредвиденная ошибка при обработке '{species}': {e}")


# Создание папок и загрузка изображений
# Сохраняем в новую папку, чтобы не смешивать результаты
download_filtered_images(trees, "Деревья")
download_filtered_images(shrubs, "Кустарники")
download_filtered_images(diseases, "Болезни деревьев и кустарников")

print("\nСоздание датасета завершено.")
