# Деплой Infinity Roguelike RPG на Render.com

## Решение проблем с деплоем на Render

### Проблема 1: Ошибка импортов
**Ошибка:**
```
Could not resolve "./utils/gameEngine" from "App.tsx"
```

**Причина:** Проблема с путями импортов в TypeScript/React приложении. На Windows пути работают, но на Linux (который использует Render) могут быть проблемы с чувствительностью к регистру или относительными путями.

**Решение:** Исправлены все импорты с использованием абсолютных путей через алиас `@`.

### Проблема 2: Ошибка сборки
**Ошибка:**
```
bash: line 1: cd: backend: No such file or directory
```

**Причина:** В `render.yaml` была неправильная структура сервисов. Проект имеет единую структуру, а не раздельные фронтенд/бэкенд.

**Решение:** Обновлен `render.yaml` для единого сервиса с правильными командами сборки и запуска.

### Проблема 3: Vite не найден
**Ошибка:**
```
sh: 1: vite: not found
```

**Причина:** `vite` был установлен как `devDependency`, а на Render в продакшн режиме `devDependencies` не устанавливаются по умолчанию.

**Решение:**
1. Перемещен `vite` и `@vitejs/plugin-react` в `dependencies`
2. Обновлена команда сборки в `render.yaml`: `npm ci --include=dev`

## Исправления, которые были внесены:

### 1. Обновлены импорты во всех файлах:
- `App.tsx` - изменены все относительные импорты на `@/`
- `index.tsx` - изменен импорт App
- Все компоненты в `components/` - исправлены импорты
- `utils/gameEngine.ts` - исправлен импорт типов
- `services/api.ts` - исправлен импорт типов

### 2. Обновлена конфигурация Vite:
Алиас `@` настроен на корневую директорию проекта в `vite.config.ts`.

### 3. Добавлены скрипты для продакшн:
- `npm start` - для запуска продакшн версии
- Обновлен `render.yaml` для правильной конфигурации

## Инструкция по деплою на Render:

### Вариант 1: Использование render.yaml (рекомендуется)

1. **Загрузите проект на GitHub**
   - Убедитесь, что все исправления закоммичены
   - Запушьте изменения в ваш репозиторий

2. **Создайте новый Web Service на Render**
   - Перейдите на [render.com](https://render.com)
   - Нажмите "New +" → "Web Service"
   - Подключите ваш GitHub репозиторий

3. **Настройте сервис:**
   - **Name:** `world-of-jekardos` (или любое другое имя)
   - **Runtime:** `Node`
   - **Build Command:** `npm ci --include=dev && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `PORT`: `3000`
     - `HOST`: `0.0.0.0`
     - `DATABASE_URL`: `sqlite:./database.sqlite`
     - `JWT_SECRET`: (оставьте пустым, Render сгенерирует)
     - `TELEGRAM_BOT_TOKEN`: (ваш токен, установите вручную)
     - `TELEGRAM_BOT_USERNAME`: (имя бота, установите вручную)

4. **Нажмите "Create Web Service"**

**Важно:** Не используйте опцию "Auto-deploy from GitHub" пока не убедитесь, что `render.yaml` работает правильно.

### Вариант 2: Ручная настройка

Если `render.yaml` не работает, настройте вручную:

1. **Build Command:**
   ```
   npm install && npm run build
   ```

2. **Start Command:**
   ```
   npm start
   ```

3. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

4. **Health Check Path:**
   ```
   /api/health
   ```

## Проверка деплоя:

После успешного деплоя проверьте:

1. **Основное приложение:**
   ```
   https://your-service-name.onrender.com
   ```

2. **API Health Check:**
   ```
   https://your-service-name.onrender.com/api/health
   ```

3. **Тестовый пользователь:**
   ```
   https://your-service-name.onrender.com/api/users/test_123/profile
   ```

## Устранение проблем:

### Если деплой все еще не работает:

1. **Проверьте логи сборки:**
   - В панели Render перейдите в "Logs"
   - Ищите ошибки в разделе "Build"

2. **Распространенные проблемы:**

   **Проблема:** `Cannot find module`
   **Решение:** Убедитесь, что все зависимости в `package.json`

   **Проблема:** `TypeScript errors`
   **Решение:** Запустите локально `npm run build` для проверки

   **Проблема:** `Port already in use`
   **Решение:** Убедитесь, что переменная `PORT` установлена правильно

3. **Локальная проверка:**
   ```bash
   # Проверка сборки
   npm run build
   
   # Проверка TypeScript
   npx tsc --noEmit
   
   # Запуск продакшн версии
   npm run build
   npm start
   ```

## Структура проекта для Render:

```
infinity-roguelike-rpg/
├── render.yaml          # Конфигурация Render
├── package.json         # Зависимости и скрипты
├── vite.config.ts       # Конфигурация Vite
├── tsconfig.json        # Конфигурация TypeScript
├── dist/                # Собранное приложение (генерируется)
├── backend/             # Серверная часть
└── ...                  # Остальные файлы
```

## Дополнительные настройки:

### Для использования отдельного API сервера:
Если нужно запустить фронтенд и бэкенд отдельно, используйте конфигурацию из `render.yaml` с двумя сервисами.

### База данных:
Проект использует SQLite, который работает на Render. Файл базы данных будет создан автоматически при первом запуске.

### Telegram WebApp:
После деплоя обновите WebApp URL в @BotFather:
```
https://your-service-name.onrender.com
```

## Готово!
После успешного деплоя ваше приложение будет доступно по предоставленному Render URL.