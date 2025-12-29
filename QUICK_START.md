# Быстрый старт Infinity Roguelike RPG

## Установка и запуск за 5 минут

### 1. Установка зависимостей
```bash
npm install
```

### 2. Инициализация базы данных
```bash
npm run db:init
npm run db:migrate
```

### 3. Запуск приложения

#### Вариант A: Запуск в одном терминале (рекомендуется)
Откройте **два отдельных терминала**:

**Терминал 1 - Фронтенд:**
```bash
npm run dev
```

**Терминал 2 - Бэкенд:**
```bash
npm run server:dev
```

#### Вариант B: Запуск через один скрипт
```bash
npm run dev:full
```

### 4. Проверка работы

1. **Фронтенд:** Откройте браузер и перейдите по адресу:
   - [http://localhost:3000](http://localhost:3000)

2. **API сервер:** Проверьте работу API:
   - [http://localhost:3000/api/health](http://localhost:3000/api/health)

### 5. Тестирование API

Создание тестового пользователя:
```bash
curl -X POST http://localhost:3000/api/users ^
  -H "Content-Type: application/json" ^
  -d "{\"telegram_id\":\"test_user\",\"username\":\"test\",\"first_name\":\"Test\",\"last_name\":\"User\"}"
```

Получение профиля:
```bash
curl http://localhost:3000/api/users/test_user/profile
```

## Устранение проблем

### Если порт 3000 занят:
Измените порт в файле `.env`:
```
PORT=3001
```

### Если сервер не запускается:
1. Проверьте, что Node.js версии 18+ установлен:
   ```bash
   node --version
   ```

2. Переустановите зависимости:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Проверьте, что SQLite доступен:
   ```bash
   sqlite3 --version
   ```

### Для Windows:
Если возникают проблемы с командами:
1. Используйте PowerShell вместо CMD
2. Для API тестов используйте:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
   ```

## Готово!
Приложение должно быть доступно по адресу [http://localhost:3000](http://localhost:3000)