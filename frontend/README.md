# DTL — frontend

Коротко о проекте

-   SPA на React + TypeScript. Интерфейс для загрузки фотографий, аннотирования (Annotorious + OpenSeadragon), просмотра статистики по растениям и запуска MLOps-задач (например, обучение моделей).

Ключевые технологии

-   React 19 + TypeScript
-   Vite (сборка и dev-server)
-   Ant Design 5 (UI)
-   Redux Toolkit
-   Annotorious + OpenSeadragon (аннотации)
-   2GIS / Yandex Maps для отображения геоданных

Предварительные требования

-   Node.js (рекомендуется LTS) и npm/pnpm/yarn
-   Git

Переменные окружения

-   Обязательная переменная для этого проекта:
    -   `VITE_BACKEND_API_URL` — базовый URL API (например, `https://api.example.com/api`).

Пример `.env` файлов

-   `.env.production` — для продакшен-сборки :

```env
VITE_BACKEND_API_URL=https://api.example.com/api
```

Использование в коде

-   В React/TS коде обращайтесь через `import.meta.env.VITE_BACKEND_API_URL`. Например:

```ts
const apiBase = import.meta.env.VITE_BACKEND_API_URL as string;
```

Docker / CI

-   При сборке Docker-образа передавайте значение `VITE_BACKEND_API_URL` как build-arg или создавайте `.env.production` в шаге CI перед запуском `npm run build`.

Пример (Dockerfile build-arg):

```dockerfile
# Dockerfile snippet
ARG VITE_BACKEND_API_URL
ENV VITE_BACKEND_API_URL=${VITE_BACKEND_API_URL}
```

Или в GitHub Actions/CI перед сборкой записать файл `.env.production` с нужными значениями.

Установка и запуск локально

1. Установите зависимости:

```powershell
npm install
# или: pnpm install
# или: yarn
```

2. Запустите dev-сервер (Vite):

```powershell
npm run dev
```

3. Собрать продакшен-версию и локально прогнать preview:

```powershell
npm run build
npm run preview
```

Скрипты (package.json)

-   `dev` — запуск Vite dev-server (горячая перезагрузка)
-   `build` — `tsc -b && vite build` (type-check + prod-билд)
-   `preview` — serve продакшен-бандла локально
-   `lint` — ESLint

Docker

-   В проекте есть Dockerfile для сборки фронтенда (`build-frontend/Dockerfile`) и Nginx-конфиг для сервера (`build-nginx/`).
-   Для локального запуска можно использовать `docker-compose.yaml` в корне проекта:

```powershell
docker-compose up --build
```

Структура репозитория (важные папки)

-   `src/` — исходники приложения
    -   `routes/` — страницы приложения (MapPage, MLOpsPage, Gallery и т.д.)
    -   `common/` — переиспользуемые компоненты (StatisticsCard, Grid, Uploader...)
    -   `services/` — API-слой, middlewares
    -   `contexts/`, `hooks/` — React-контексты и хуки
-   `public/` — статические ресурсы
-   `build-frontend/`, `build-nginx/` — Docker-файлы для сборки и размещения
