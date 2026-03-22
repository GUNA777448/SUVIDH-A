@echo off
REM Docker helper script for SUVIDHA project (Windows Batch)

setlocal enabledelayedexpansion

set "command=%1"
if "%command%"=="" set "command=help"

goto %command%

:help
echo SUVIDHA Docker Helper
echo.
echo Usage: .\scripts\docker-helper.bat [command]
echo.
echo Commands:
echo   build              Build all images
echo   up                 Start all services
echo   down               Stop all services
echo   restart            Restart all services
echo   logs               View logs from all services
echo   ps                 Show running containers
echo   health             Check health of all services
echo   db-backup          Backup PostgreSQL database
echo   db-reset           Reset database
echo   clean              Remove containers and volumes
echo   init               Initialize project (first-time setup^)
echo   help               Show this help message
echo.
echo Examples:
echo   scripts\docker-helper.bat up
echo   scripts\docker-helper.bat logs
echo   scripts\docker-helper.bat db-backup
goto :eof

:build
echo === Building all images ===
docker-compose build
echo Build complete
goto :eof

:up
echo === Starting all services ===
docker-compose up -d
timeout /t 3 /nobreak
docker-compose ps
goto :eof

:down
echo === Stopping all services ===
docker-compose down
goto :eof

:restart
echo === Restarting all services ===
docker-compose restart
goto :eof

:logs
echo === Viewing logs (Press Ctrl+C to exit) ===
docker-compose logs -f
goto :eof

:ps
docker-compose ps
goto :eof

:health
echo === Health Check Status ===
docker-compose ps
goto :eof

:db-backup
echo === Backing up PostgreSQL database ===
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
docker-compose exec -T postgres pg_dump -U user suvidha_auth > suvidha_backup_%mydate%_%mytime%.sql
echo Backup complete
goto :eof

:db-reset
echo === WARNING: This will DELETE all data from the database! ===
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    echo Resetting database...
    docker-compose down -v
    docker-compose up -d postgres redis
    timeout /t 5 /nobreak
    docker-compose up -d
    echo Database reset complete
) else (
    echo Database reset cancelled
)
goto :eof

:clean
echo === WARNING: This will DELETE all containers and volumes! ===
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    docker-compose down -v
    echo Cleanup complete
) else (
    echo Cleanup cancelled
)
goto :eof

:init
echo === Initializing SUVIDHA Docker setup ===
if not exist ".env.docker" (
    echo Creating .env.docker from .env.docker.example
    copy .env.docker.example .env.docker
    echo .env.docker created - please edit it with your configuration
) else (
    echo .env.docker already exists
)
echo.
echo === Building images ===
docker-compose build
echo.
echo === Starting services ===
docker-compose up -d
timeout /t 3 /nobreak
docker-compose ps
echo.
echo SUVIDHA is ready!
echo Access points:
echo   Client:       http://localhost:3000
echo   API Gateway:  http://localhost:4009
echo   Auth Service: http://localhost:5001
echo   Database:     localhost:5432
echo   Redis:        localhost:6379
goto :eof

:invalid
echo Unknown command: %command%
call :help
goto :eof

if "%command%"=="" (
    call :help
) else if "%command%"=="help" (
    call :help
) else if not exist "%command%" (
    call :invalid
)
