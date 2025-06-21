@echo off
REM Development script for PC Store (Windows)
REM Usage: dev.bat [command]

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="restart-apps" goto restart_apps
if "%1"=="rebuild-apps" goto rebuild_apps
if "%1"=="logs" goto logs
if "%1"=="clean" goto clean
if "%1"=="clean-apps" goto clean_apps
if "%1"=="rebuild" goto rebuild
if "%1"=="status" goto status
goto usage

:start
echo Starting development environment...
docker-compose -f docker-compose.dev.yml up --build -d
echo Development environment started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo Keycloak: http://localhost:8080
echo MongoDB: localhost:27017
goto end

:stop
echo Stopping development environment...
docker-compose -f docker-compose.dev.yml down
echo Development environment stopped!
goto end

:restart
echo Restarting development environment...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d
echo Development environment restarted!
echo Note: Keycloak configuration is preserved!
goto end

:restart_apps
echo Restarting only applications (preserving Keycloak and MongoDB)...
docker-compose -f docker-compose.dev.yml restart backend frontend
echo Applications restarted! Keycloak and MongoDB unchanged.
goto end

:rebuild_apps
echo Rebuilding only applications...
docker-compose -f docker-compose.dev.yml stop backend frontend
docker-compose -f docker-compose.dev.yml build --no-cache backend frontend
docker-compose -f docker-compose.dev.yml up -d backend frontend
echo Applications rebuilt and started! Keycloak and MongoDB unchanged.
goto end

:logs
echo Showing logs...
docker-compose -f docker-compose.dev.yml logs -f
goto end

:clean
echo Cleaning up Docker resources...
echo WARNING: This will remove ALL data including Keycloak configuration!
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" goto clean_confirmed
echo Cleanup cancelled.
goto end
:clean_confirmed
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
echo Cleanup completed!
goto end

:clean_apps
echo Cleaning up only application data (preserving Keycloak and MongoDB)...
docker-compose -f docker-compose.dev.yml down
docker volume rm pc-store_backend-npm-cache pc-store_frontend-npm-cache 2>nul
docker system prune -f
echo Application cleanup completed! Keycloak and MongoDB preserved.
goto end

:rebuild
echo Rebuilding containers...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
echo Containers rebuilt and started!
echo Note: Keycloak configuration is preserved!
goto end

:status
echo Container status:
docker-compose -f docker-compose.dev.yml ps
goto end

:usage
echo Usage: dev.bat [command]
echo.
echo Commands:
echo   start         - Start development environment
echo   stop          - Stop development environment
echo   restart       - Restart all services (preserves Keycloak data)
echo   restart-apps  - Restart only backend/frontend (preserves Keycloak/MongoDB)
echo   rebuild-apps  - Rebuild only backend/frontend (preserves Keycloak/MongoDB)
echo   logs          - Show logs
echo   status        - Show container status
echo   clean         - Clean up ALL data (including Keycloak config)
echo   clean-apps    - Clean up only app data (preserves Keycloak/MongoDB)
echo   rebuild       - Rebuild all containers (preserves Keycloak data)
echo.
echo Tip: Use 'restart-apps' or 'rebuild-apps' to avoid losing Keycloak configuration!
goto end

:end 