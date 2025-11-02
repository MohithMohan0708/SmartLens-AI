@echo off
REM SmartLens AI - Local Docker Deployment Script (Windows)
REM This script builds and runs the application locally using Docker Compose

echo ================================
echo SmartLens AI - Local Deployment
echo ================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running
    echo Please start Docker Desktop
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo Warning: .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env file with your actual credentials
    pause
    exit /b 1
)

REM Stop existing containers
echo Stopping existing containers...
docker-compose down

REM Build images
echo.
echo Building Docker images...
docker-compose build --no-cache

REM Start containers
echo.
echo Starting containers...
docker-compose up -d

REM Wait for services
echo.
echo Waiting for services to start...
timeout /t 5 /nobreak >nul

REM Show container status
echo.
echo Container Status:
docker-compose ps

echo.
echo ================================
echo Deployment Complete!
echo ================================
echo Frontend: http://localhost
echo Backend:  http://localhost:5000
echo.
echo View logs: docker-compose logs -f
echo Stop:      docker-compose down
echo.
pause
