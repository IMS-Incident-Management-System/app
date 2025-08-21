 # 🚀 IMS Project Makefile

.PHONY: dev down frontend logs clean

# 🌐 Запуск frontend
frontend:
	@echo "🌐 Запускаем Frontend..."
	cd frontend && npm start

# 🚀 Full development - backend + frontend with logs
dev:
	@echo "🚀 Starting full Development mode..."
	@echo "Backend and Frontend logs will be shown together"
	# Start backend in background
	docker compose up -d --build
	# Wait for backend to start
	@echo "⏳ Waiting for backend to start..."
	sleep 8
	# Show backend logs in background
	@echo "📋 Showing logs from Backend and Frontend (Ctrl+C to stop all):"
	docker compose logs -f ims-backend &
	# Start frontend in foreground to see its logs
	@echo "🌐 Starting Frontend..."
	cd frontend && npm start

# 📋 Логи backend
logs:
	@echo "📋 Логи Backend (Ctrl+C для выхода):"
	docker compose logs -f ims-backend

# 🛑 Остановить все
down:
	@echo "🛑 Останавливаем все контейнеры..."
	docker compose down

# 🧹 Полная очистка
clean:
	@echo "🧹 Полная очистка контейнеров и volumes..."
	docker compose down -v
	docker system prune -f
	@echo "✅ Очистка завершена"

# 🔧 Пересборка только backend
rebuild-backend:
	@echo "🔧 Пересборка Backend..."
	docker compose build --no-cache ims-backend

# 📦 Установка зависимостей frontend
install-frontend:
	@echo "📦 Установка зависимостей Frontend..."
	cd frontend && npm install

# 🔍 Статус сервисов  
status:
	@echo "🔍 Статус сервисов:"
	docker compose ps