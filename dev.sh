#!/bin/bash

# Development script for PC Store
# Usage: ./dev.sh [command]
# Commands: start, stop, restart, restart-apps, rebuild-apps, logs, clean, clean-apps, rebuild, status

@echo off
if "%1"=="restart-apps" goto restart_apps
goto end

:restart_apps
echo Restarting only applications (preserving Keycloak and MongoDB)...
docker-compose -f docker-compose.dev.yml restart backend frontend
echo Applications restarted! Keycloak and MongoDB unchanged.
goto end

:end

case "$1" in
  "start")
    echo "🚀 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
    echo "✅ Development environment started!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:5000"
    echo "🔐 Keycloak: http://localhost:8080"
    echo "🗄️  MongoDB: localhost:27017"
    ;;
  "stop")
    echo "🛑 Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    echo "✅ Development environment stopped!"
    ;;
  "restart")
    echo "🔄 Restarting development environment..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml up --build -d
    echo "✅ Development environment restarted!"
    echo "📝 Note: Keycloak configuration is preserved!"
    ;;
  "rebuild-apps")
    echo "🔨 Rebuilding only applications..."
    docker-compose -f docker-compose.dev.yml stop backend frontend
    docker-compose -f docker-compose.dev.yml build --no-cache backend frontend
    docker-compose -f docker-compose.dev.yml up -d backend frontend
    echo "✅ Applications rebuilt and started! Keycloak and MongoDB unchanged."
    ;;
  "logs")
    echo "📋 Showing logs..."
    docker-compose -f docker-compose.dev.yml logs -f
    ;;
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    echo "⚠️  This will remove ALL data including Keycloak configuration!"
    read -p "Are you sure? (y/N): " confirm
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
      docker-compose -f docker-compose.dev.yml down -v
      docker system prune -f
      echo "✅ Cleanup completed!"
    else
      echo "❌ Cleanup cancelled."
    fi
    ;;
  "clean-apps")
    echo "🧹 Cleaning up only application data (preserving Keycloak and MongoDB)..."
    docker-compose -f docker-compose.dev.yml down
    docker volume rm pc-store_backend-npm-cache pc-store_frontend-npm-cache 2>/dev/null || true
    docker system prune -f
    echo "✅ Application cleanup completed! Keycloak and MongoDB preserved."
    ;;
  "rebuild")
    echo "🔨 Rebuilding containers..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Containers rebuilt and started!"
    echo "📝 Note: Keycloak configuration is preserved!"
    ;;
  "status")
    echo "📊 Container status:"
    docker-compose -f docker-compose.dev.yml ps
    ;;
  *)
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start         - Start development environment"
    echo "  stop          - Stop development environment"
    echo "  restart       - Restart all services (preserves Keycloak data)"
    echo "  restart-apps  - Restart only backend/frontend (preserves Keycloak/MongoDB)"
    echo "  rebuild-apps  - Rebuild only backend/frontend (preserves Keycloak/MongoDB)"
    echo "  logs          - Show logs"
    echo "  status        - Show container status"
    echo "  clean         - Clean up ALL data (including Keycloak config)"
    echo "  clean-apps    - Clean up only app data (preserves Keycloak/MongoDB)"
    echo "  rebuild       - Rebuild all containers (preserves Keycloak data)"
    echo ""
    echo "💡 Tip: Use 'restart-apps' or 'rebuild-apps' to avoid losing Keycloak configuration!"
    ;;
esac 