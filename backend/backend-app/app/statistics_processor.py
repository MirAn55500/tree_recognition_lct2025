from typing import List, Dict, Any, Optional
from collections import Counter
import statistics

class StatisticsProcessor:
    @staticmethod
    def calculate_average_statistics(photos_statistics: List[Dict]) -> Dict[str, Any]:
        """
        Усредняет статистики по всем фотографиям исследования
        """
        if not photos_statistics:
            return {}
        
        # Собираем все аннотации из всех фото
        all_annotations = []
        for photo_stats in photos_statistics:
            if photo_stats and 'results' in photo_stats:
                all_annotations.extend(photo_stats['results'])
        
        if not all_annotations:
            return {}
        
        # Усредняем аннотации
        averaged_annotations = StatisticsProcessor._average_annotations(all_annotations)
        
        return averaged_annotations
    
    @staticmethod
    def _average_annotations(annotations: List[Dict]) -> Dict[str, Any]:
        """
        Усредняет список аннотаций в одну усредненную аннотацию
        """
        if not annotations:
            return {}
        
        # Обрабатываем строковые поля - находим наиболее частое значение
        class_values = [ann.get('class_name') for ann in annotations if ann.get('class_name')]
        most_common_class = StatisticsProcessor._get_most_common(class_values) if class_values else None
        
        # Усредняем числовые поля
        hollows_values = [ann.get('hollows') for ann in annotations if ann.get('hollows') is not None]
        cracks_values = [ann.get('cracks') for ann in annotations if ann.get('cracks') is not None]
        stem_damage_values = [ann.get('stem_damage') for ann in annotations if ann.get('stem_damage') is not None]
        crown_damage_values = [ann.get('crown_damage') for ann in annotations if ann.get('crown_damage') is not None]
        fruiting_bodies_values = [ann.get('fruiting_bodies') for ann in annotations if ann.get('dry_branches_percentage') is not None]
        dry_branches_values = [ann.get('dry_branches_percentage') for ann in annotations if ann.get('dry_branches_percentage') is not None]

        # Обрабатываем species_probabilities
        species_values = [ann.get('species')[0] for ann in annotations if ann.get('species')]
        averaged_species = StatisticsProcessor._get_most_common(species_values) if species_values else None
        
        # Обрабатываем diseases
        diseases_values = [ann.get('diseases')[0] for ann in annotations if ann.get('diseases')]
        averaged_diseases = StatisticsProcessor._get_most_common(diseases_values) if diseases_values else None
        
        return {
            'bbox': None,  # Ббокс не имеет смысла для усреднения
            'class_name': most_common_class,
            'species_probabilities': averaged_species,
            'hollows': StatisticsProcessor._average_numeric(hollows_values),
            'cracks': StatisticsProcessor._average_numeric(cracks_values),
            'stem_damage': StatisticsProcessor._average_numeric(stem_damage_values),
            'crown_damage': StatisticsProcessor._average_numeric(crown_damage_values),
            'fruiting_bodies': StatisticsProcessor._average_numeric(fruiting_bodies_values),
            'diseases': averaged_diseases,
            'dry_branches_percentage': StatisticsProcessor._average_numeric(dry_branches_values)
        }
    
    @staticmethod
    def _average_probability_lists(probability_lists: List[List[Dict]], key_field: str = 'species') -> List[Dict]:
        """
        Усредняет списки вероятностей (species_probabilities или diseases)
        """
        if not probability_lists:
            return []
        
        # Собираем все уникальные ключи (виды или болезни)
        all_keys = set()
        for prob_list in probability_lists:
            if prob_list:
                for item in prob_list:
                    if key_field in item:
                        all_keys.add(item[key_field])
        
        if not all_keys:
            return []
        
        # Для каждого ключа вычисляем среднюю вероятность
        averaged_list = []
        for key in all_keys:
            probabilities = []
            for prob_list in probability_lists:
                if prob_list:
                    for item in prob_list:
                        if item.get(key_field) == key and 'probability' in item:
                            probabilities.append(item['probability'])
            
            if probabilities:
                avg_probability = statistics.mean(probabilities)
                averaged_list.append({
                    key_field: key,
                    'probability': round(avg_probability, 4)
                })
        
        # Сортируем по убыванию вероятности
        averaged_list.sort(key=lambda x: x['probability'], reverse=True)
        
        return averaged_list
    
    @staticmethod
    def _average_numeric(values: List[Any]) -> Optional[float]:
        """
        Вычисляет среднее значение для числового списка
        """
        numeric_values = [v for v in values if v is not None and isinstance(v, (int, float))]
        if not numeric_values:
            return None
        return round(statistics.mean(numeric_values), 4)
    
    @staticmethod
    def _get_most_common(values: List[Any]) -> Any:
        """
        Возвращает наиболее частое значение из списка
        """
        if not values:
            return None
        counter = Counter(values)
        return counter.most_common(1)[0][0]

# Создаем экземпляр процессора
statistics_processor = StatisticsProcessor()