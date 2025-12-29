Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Infinity Roguelike RPG - Запуск приложения" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Проверка Node.js
Write-Host "Шаг 1: Проверка Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js найден: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ОШИБКА: Node.js не установлен или не найден в PATH" -ForegroundColor Red
    Write-Host "  Установите Node.js версии 18 или выше с сайта: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Шаг 2: Проверка зависимостей
Write-Host ""
Write-Host "Шаг 2: Проверка зависимостей..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  Установка зависимостей..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Ошибка при установке зависимостей" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Зависимости установлены" -ForegroundColor Green
} else {
    Write-Host "✓ Зависимости уже установлены" -ForegroundColor Green
}

# Шаг 3: Проверка базы данных
Write-Host ""
Write-Host "Шаг 3: Проверка базы данных..." -ForegroundColor Yellow
if (-not (Test-Path "database.sqlite")) {
    Write-Host "  Инициализация базы данных..." -ForegroundColor Yellow
    npm run db:init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Ошибка при инициализации базы данных" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "  Применение миграций..." -ForegroundColor Yellow
    npm run db:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Ошибка при применении миграций" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ База данных создана" -ForegroundColor Green
} else {
    Write-Host "✓ База данных уже существует" -ForegroundColor Green
}

# Шаг 4: Запуск приложения
Write-Host ""
Write-Host "Шаг 4: Запуск приложения..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Выберите вариант запуска:" -ForegroundColor Cyan
Write-Host "  1. Запустить полный стек (фронтенд + бэкенд)" -ForegroundColor White
Write-Host "  2. Запустить только фронтенд" -ForegroundColor White
Write-Host "  3. Запустить только бэкенд" -ForegroundColor White
Write-Host "  4. Открыть два отдельных окна" -ForegroundColor White
Write-Host "  5. Выход" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Введите номер варианта (1-5)"

switch ($choice) {
    "1" {
        Write-Host "Запуск полного стека..." -ForegroundColor Green
        npm run dev:full
    }
    "2" {
        Write-Host "Запуск фронтенда..." -ForegroundColor Green
        Write-Host "Откройте в браузере: http://localhost:3000" -ForegroundColor Cyan
        npm run dev
    }
    "3" {
        Write-Host "Запуск бэкенда..." -ForegroundColor Green
        Write-Host "API будет доступно по адресу: http://localhost:3000/api/health" -ForegroundColor Cyan
        npm run server:dev
    }
    "4" {
        Write-Host "Инструкция для запуска в двух окнах:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Окно 1 (Фронтенд):" -ForegroundColor Yellow
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "Окно 2 (Бэкенд):" -ForegroundColor Yellow
        Write-Host "  npm run server:dev" -ForegroundColor White
        Write-Host ""
        Write-Host "После запуска откройте в браузере:" -ForegroundColor Cyan
        Write-Host "  http://localhost:3000" -ForegroundColor White
        Write-Host ""
        Read-Host "Нажмите Enter для продолжения"
    }
    "5" {
        Write-Host "Выход..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Неверный выбор. Выход..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Приложение запущено!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Полезные ссылки:" -ForegroundColor Yellow
Write-Host "  • Фронтенд: http://localhost:3000" -ForegroundColor White
Write-Host "  • API Health: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "  • Тестовый пользователь: http://localhost:3000/api/users/test_123/profile" -ForegroundColor White
Write-Host ""
Write-Host "Для остановки приложения нажмите Ctrl+C" -ForegroundColor Yellow