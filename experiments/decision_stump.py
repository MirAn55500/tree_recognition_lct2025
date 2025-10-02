
import numpy as np

def decision_stump(X, y):

    best_Q = float('inf')
    best_j = None  # индекс признака по которому производился лучший сплит
    best_t = None  # порог с которым сравнивается признак
    best_left_ids = None # вектор со значениями True для объектов в левом поддереве, остальные False
    best_right_ids = None # вектор со значениями True для объектов в правом поддереве, остальные False
    y_preds_left = None # предсказание в левом поддерева
    y_preds_right = None # предсказание в правом поддерева

    n_samples, n_features = X.shape

    for j in range(n_features):
        # Получаем уникальные значения признака j для использования в качестве порогов
        thresholds = np.unique(X[:, j])
        for t in thresholds:
            # Разделение данных
            left_ids = X[:, j] <= t
            right_ids = X[:, j] > t

            # Если одно из поддеревьев пусто, пропускаем это разделение
            if np.sum(left_ids) == 0 or np.sum(right_ids) == 0:
                continue

            # Предсказания в поддеревьях (среднее значение y)
            y_left = y[left_ids]
            y_right = y[right_ids]

            pred_left = np.mean(y_left)
            pred_right = np.mean(y_right)

            # Вычисление MSE
            mse_left = np.mean((y_left - pred_left)**2)
            mse_right = np.mean((y_right - pred_right)**2)

            # Взвешенное MSE для текущего разделения
            current_Q = (np.sum(left_ids) / n_samples) * mse_left + \
                        (np.sum(right_ids) / n_samples) * mse_right

            # Обновление лучшего разделения, если текущее лучше
            if current_Q < best_Q:
                best_Q = current_Q
                best_j = j
                best_t = t
                best_left_ids = left_ids
                best_right_ids = right_ids
                y_preds_left = pred_left
                y_preds_right = pred_right

    result = [
        best_Q,
        best_j,
        best_t,
        best_left_ids.sum() if best_left_ids is not None else 0,
        best_right_ids.sum() if best_right_ids is not None else 0,
        y_preds_left,
        y_preds_right
    ]
    return result
