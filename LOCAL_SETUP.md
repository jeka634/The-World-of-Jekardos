# Локальная настройка Infinity Roguelike RPG - Telegram Mini App

## Предварительные требования

1. **Node.js** версии 18 или выше
2. **npm** или **yarn** для управления пакетами
3. **Telegram Bot Token** (для тестирования Mini App)
4. **SQLite3** (для базы данных)

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корневой директории:

```env
# Ключ API Gemini (опционально, для генерации контента)
GEMINI_API_KEY=your_gemini_api_key

# Настройки сервера
PORT=3000
HOST=localhost

# Настройки Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# Настройки базы данных
DATABASE_URL=sqlite:./database.sqlite
# или для PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Секретный ключ для JWT
JWT_SECRET=your_jwt_secret_key_change_this
```

### 3. Инициализация базы данных

```bash
npm run db:init
```

### 4. Запуск сервера разработки

#### Вариант A: Только фронтенд
```bash
npm run dev
```

#### Вариант B: Полный стек (фронтенд + бэкенд)
```bash
npm run dev:full
```

### 5. Запуск продакшн сборки

```bash
npm run build
npm start
```

## Структура проекта

```
infinity-roguelike-rpg/
├── frontend/              # React-приложение
│   ├── components/        # Компоненты интерфейса
│   ├── services/          # API-клиенты
│   └── ...
├── backend/              # Express.js сервер
│   ├── controllers/       # Контроллеры API
│   ├── models/           # Модели базы данных
│   ├── routes/           # Маршруты API
│   └── ...
├── database/             # Миграции и схемы БД
└── public/               # Статические файлы
```

## Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Настройте команды бота:
   ```
   /start - Начать игру
   /play - Открыть игру
   /profile - Профиль игрока
   /achievements - Достижения
   /chat - Открыть чат
   ```
4. Настройте WebApp:
   ```
   /setmenubutton - Добавить кнопку меню "Играть"
   ```

## Тестирование в Telegram

1. Запустите сервер на локальной машине
2. Используйте ngrok для туннелирования:
   ```bash
   ngrok http 3000
   ```
3. Настройте WebApp URL в @BotFather:
   ```
   https://your-ngrok-url.ngrok.io
   ```
4. Откройте бота в Telegram и нажмите "Играть"

## Доступные команды

```bash
# Разработка
npm run dev              # Запуск фронтенда
npm run server:dev      # Запуск бэкенда
npm run dev:full        # Запуск всего стека

# База данных
npm run db:init         # Инициализация БД
npm run db:migrate      # Применить миграции
npm run db:seed         # Заполнить тестовыми данными

# Сборка
npm run build           # Сборка фронтенда
npm run build:server    # Сборка бэкенда
npm start              # Запуск продакшн версии

# Тестирование
npm test               # Запуск тестов
npm run lint           # Проверка кода
```

## Устранение проблем

### 1. Порт уже занят
Измените порт в `.env` файле или остановите процесс, использующий порт 3000.

### 2. Ошибка базы данных
Убедитесь, что SQLite установлен и доступен. Для Windows можно установить через Chocolatey:
```bash
choco install sqlite
```

### 3. Telegram WebApp не загружается
- Проверьте, что сервер доступен из интернета (используйте ngrok)
- Убедитесь, что URL правильно настроен в @BotFather
- Проверьте консоль браузера на ошибки

### 4. Ошибки при сборке
Очистите кэш и переустановите зависимости:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Дополнительные настройки

### Для разработки с hot-reload
```bash
npm run dev:hot
```

### Для отладки API
Используйте инструменты вроде Postman или Insomnia:
- URL: `http://localhost:3000/api`
- Документация API: `http://localhost:3000/api/docs`

### Мониторинг базы данных
Для просмотра и управления базой данных SQLite можно использовать:
- **DB Browser for SQLite** (GUI)
- **sqlite3** (CLI):
  ```bash
  sqlite3 database.sqlite
  ```

## Поддержка

Если у вас возникли проблемы:
1. Проверьте логи сервера
2. Убедитесь, что все зависимости установлены
3. Проверьте версии Node.js и npm
4. Создайте issue в репозитории проекта

## Лицензия

MIT