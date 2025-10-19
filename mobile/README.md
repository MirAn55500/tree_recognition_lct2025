# DTL Mobile

Клиентское мобильное приложение (React Native + Expo/EAS).

Коротко: приложение разработано на TypeScript с использованием Expo и собирается через EAS (Expo Application Services).

Подробнее: это приложение служит мобильным интерфейсом для работы с полевыми исследованиями и фотографиями (research/photo management). Основные сценарии включают создание исследований, привязку и загрузку фотографий, просмотр галерей, аннотацию изображений и сбор метаданных локации. Приложение оптимизировано для работы в условиях ограниченной сети: реализована обработка очередей/повторных попыток и индикаторы состояния загрузки.

Ключевые возможности:

- Создание и управление исследованиями
- Загрузка и аннотирование фотографий из галереи или камеры
- Offline-friendly поведение

Краткая архитектура:

Исходники находятся в `src/`. Приложение организовано по папкам: `hooks` для пользовательских хуков, `services` для сетевого взаимодействия и работы со стором, `slices` для управления состоянием (redux/toolkit), и `screens` для UI-экранов. Это упрощает расширение фич и поддержку тестов.

## Стек

-   React Native + Expo
-   TypeScript
-   EAS (для production сборок Android)

## Требования (prerequisites)

-   Node.js (рекомендуется LTS)
-   npm или yarn
-   Expo CLI / EAS CLI (локально или через npx)
-   JDK (OpenJDK) — Java 11+ рекомендуется
-   Android SDK (для запуска на эмуляторе или локальной сборки через Gradle)

Установка CLI (опционально глобально):

```powershell
npm install -g expo-cli eas-cli
# или через npx: npx expo, npx eas
```

## Быстрый старт (локальная разработка)

1. Клонируйте репозиторий и перейдите в папку проекта:

```powershell
git clone <repo-url>
cd D:/projects/dtl/mobile
```

2. Установите зависимости:

```powershell
npm install
# или
yarn install
```

3. Запустите Metro/Dev server:

```powershell
npx expo start
```

4. Запуск на устройстве/эмуляторе:

-   Откройте Android эмулятор (Android Studio) и в терминале нажмите `a` в интерфейсе Expo CLI, либо выполните:

```powershell
npx expo run:android
```

Примечание: в проекте есть папка `android/` — если вы используете bare workflow, вы можете запускать приложение обычными средствами Android Studio или `./gradlew`.

## Сборка production APK (EAS)

Для production сборок мы используем EAS. Пример команды, которую вы уже использовали:

```powershell
npx eas build --platform android --profile production
```

Процесс создаст сборку в облаке EAS и вернёт ссылку на артефакт (APK или AAB) в терминале и в EAS Dashboard. Если у вас нет доступа/ключей, EAS предложит их сгенерировать или загрузить существующий keystore.

Команды для работы со сборками в EAS:

```powershell
npx eas build:list
npx eas build:inspect <build-id>
npx eas build:download --platform android --id <build-id>
```

Управление Android-ключами (keystore):

```powershell
npx eas credentials -p android
```

Если нужно явно настроить/передать keystore, используйте инструкции в `eas.json` или команду выше.

## Локальная сборка APK через Gradle

Если хотите собрать APK локально (требуется установленный JDK и Android SDK):

```powershell
cd android
.\gradlew assembleRelease
# результат: android\app\build\outputs\apk\release\app-release.apk
```

Для отладочной сборки:

```powershell
.\gradlew assembleDebug
# результат: android\app\build\outputs\apk\debug\app-debug.apk
```

## Полезные файлы в репозитории

-   `app.json` / `eas.json` — конфигурация Expo / EAS
-   `android/` — нативный android проект (Gradle)
-   `src/` — исходники приложения (TypeScript/React Native)
