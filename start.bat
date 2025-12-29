@echo off
echo ========================================
echo Infinity Roguelike RPG - Запуск приложения
echo ========================================
echo.

echo Шаг 1: Проверка Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: Node.js не установлен или не найден в PATH
    echo Установите Node.js версии 18 или выше
    pause
    exit /b 1
)
echo Node.js найден

echo.
echo Шаг 2: Проверка зависимостей...
if not exist "node_modules" (
    echo Установка зависимостей...
    call npm install
) else (
    echo Зависимости уже установлены
)

echo.
echo Шаг 3: Проверка базы данных...
if not exist "database.sqlite" (
    echo Инициализация базы данных...
    call npm run db:init
    call npm run db:migrate
) else (
    echo База данных уже существует
)

echo.
echo Шаг 4: Запуск приложения...
echo.
echo Откройте два отдельных окна терминала и выполните:
echo.
echo Окно 1 (Фронтенд):
echo   npm run dev
echo.
echo Окно 2 (Бэкенд):
echo   npm run server:dev
echo.
echo ИЛИ используйте один скрипт:
echo   npm run dev:full
echo.
echo После запуска откройте в браузере:
echo   http://localhost:3000
echo.
echo Проверка API:
echo   http://localhost:3000/api/health
echo.
pause