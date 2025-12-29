# Infinity Roguelike RPG - Инструкция для запуска на домашнем ПК

## Решение проблем, с которыми вы столкнулись

Вы получили ошибки:
1. `Cannot find module 'C:\...\backend\scripts\initDB.js'` - файл не существовал
2. `Cannot find module 'C:\...\backend\server.js'` - файл был пустым

**Я уже исправил эти проблемы!** Созданы все необходимые файлы для работы бэкенда.

## Быстрый старт (3 шага)

### Шаг 1: Инициализация базы данных
```bash
npm run db:init
```

### Шаг 2: Запуск полного стека (фронтенд + бэкенд)
```bash
npm run dev:full
```

### Шаг 3: Открыть в браузере
Перейдите по адресу: [http://localhost:3000](http://localhost:3000)

## Подробная инструкция

### 1. Проверка установки
Убедитесь, что у вас установлены:
- Node.js версии 18 или выше
- npm (обычно устанавливается вместе с Node.js)

Проверьте версии:
```bash
node --version
npm --version
```

### 2. Установка зависимостей (если еще не установлены)
```bash
npm install
```

### 3. Настройка переменных окружения
Файл `.env` уже создан с настройками:
```
PORT=3000
HOST=localhost
TELEGRAM_BOT_TOKEN=8236300982:AAHocoqjtV3qnlQIMYPaBptqPux3cPcMoHY
TELEGRAM_BOT_USERNAME=JekardosAIbot
DATABASE_URL=sqlite:./database.sqlite
```

### 4. Инициализация базы данных
```bash
npm run db:init
```
**Ожидаемый результат:**
```
Initializing database...
Database initialized successfully!
Test user created
Database connection closed.
```

### 5. Запуск приложения

#### Вариант A: Полный стек (рекомендуется)
```bash
npm run dev:full
```
Этот скрипт запускает:
- Фронтенд (Vite dev server) на порту 3000
- Бэкенд (Express.js сервер) на порту 3000

#### Вариант B: Только фронтенд
```bash
npm run dev
```

#### Вариант C: Только бэкенд
```bash
npm run server:dev
```

### 6. Проверка работы

1. **Фронтенд:** [http://localhost:3000](http://localhost:3000)
2. **API Health check:** [http://localhost:3000/api/health](http://localhost:3000/api/health)
3. **Пользовательский API:** [http://localhost:3000/api/users/test_123/profile](http://localhost:3000/api/users/test_123/profile)

## Структура созданных файлов

```
backend/
├── server.js                    # Основной сервер Express.js
├── scripts/
│   ├── initDB.js               # Инициализация базы данных
│   └── migrateDB.js            # Миграции базы данных
├── controllers/
│   └── userController.js       # Контроллер пользователей
└── routes/
    └── api.js                  # API маршруты
```

## Доступные API эндпоинты

### Пользователи
- `POST /api/users` - Создать/получить пользователя
- `GET /api/users/:telegram_id/profile` - Получить профиль
- `PUT /api/users/:telegram_id/stats` - Обновить статистику
- `GET /api/leaderboard` - Таблица лидеров

### Игра
- `GET /api/game/monsters` - Список монстров
- `POST /api/game/battle` - Начать битву

### Инвентарь
- `GET /api/users/:telegram_id/inventory` - Инвентарь игрока

### Чат
- `GET /api/chat/messages` - Получить сообщения
- `POST /api/chat/messages` - Отправить сообщение

## Тестирование API

### Создание тестового пользователя
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": "test_user_1",
    "username": "test_user",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Получение профиля
```bash
curl http://localhost:3000/api/users/test_user_1/profile
```

## Устранение неполадок

### 1. Порт 3000 занят или сервер не слушает порт
Измените порт в файле `.env`:
```
PORT=3001
```

**Если сервер запускается, но не отвечает на запросы:**
- Проверьте брандмауэр Windows
- Запустите сервер от имени администратора
- Проверьте, не блокирует ли антивирус

### 2. Ошибка с SQLite
Убедитесь, что SQLite доступен. Для Windows можно установить:
- Через Chocolatey: `choco install sqlite`
- Или скачать с официального сайта
- Или использовать встроенный SQLite из Node.js (уже работает)

### 3. Ошибки при запуске
Очистите кэш и переустановите зависимости:
```bash
# В PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### 4. Файлы не найдены
Убедитесь, что вы находитесь в правильной директории:
```bash
cd C:\Users\Jekardos\Downloads\infinity-roguelike-rpg
```

### 5. Сервер запускается, но API не работает
Попробуйте запустить в отдельных терминалах:

**Терминал 1 (фронтенд):**
```bash
npm run dev
```

**Терминал 2 (бэкенд):**
```bash
npm run server:dev
```

### 6. Проблемы с командами curl в Windows
Используйте PowerShell команды:
```powershell
# Вместо curl используйте:
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET

# Для POST запросов:
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method POST -Body '{"telegram_id":"test"}' -ContentType "application/json"
```

## Полезные команды

```bash
# Проверить состояние сервера
curl http://localhost:3000/api/health

# Запустить миграции базы данных
npm run db:migrate

# Собрать проект для продакшена
npm run build

# Запустить продакшн версию
npm start

# Проверить установленные зависимости
npm list --depth=0
```

## Мониторинг

### Логи сервера
При запуске `npm run dev:full` вы увидите:
- Сообщение о запуске Vite сервера
- Сообщение о запуске Express сервера
- Логи подключения клиентов через Socket.IO

### Проверка базы данных
Для просмотра базы данных SQLite:
```bash
sqlite3 database.sqlite
.tables
SELECT * FROM users;
.quit
```

## Дополнительные настройки

### Для разработки с горячей перезагрузкой
Файлы автоматически перезагружаются при изменениях.

### Для отладки
Используйте инструменты разработчика в браузере (F12):
- Console - для ошибок JavaScript
- Network - для мониторинга API запросов

## Контакты для поддержки

Если возникли проблемы:
1. Проверьте логи в терминале
2. Убедитесь, что все шаги выполнены
3. Проверьте, что порт 3000 свободен

## Готово!

После успешного запуска вы увидите:
- Фронтенд приложение в браузере по адресу [http://localhost:3000](http://localhost:3000)
- Работающий API сервер
- Базу данных с тестовыми данными

### Для удобства созданы скрипты запуска:

1. **start.bat** - BAT файл для Windows CMD
2. **start.ps1** - PowerShell скрипт с меню выбора

### Быстрая проверка работы:

1. Откройте браузер и перейдите по адресу: [http://localhost:3000](http://localhost:3000)
2. Проверьте API: [http://localhost:3000/api/health](http://localhost:3000/api/health)
3. Проверьте тестового пользователя: [http://localhost:3000/api/users/test_123/profile](http://localhost:3000/api/users/test_123/profile)

### Если что-то не работает:

1. Убедитесь, что порт 3000 свободен
2. Проверьте, что все процессы Node.js завершены
3. Запустите скрипт `start.ps1` от имени администратора
4. Проверьте брандмауэр Windows

Приложение готово к использованию и тестированию!