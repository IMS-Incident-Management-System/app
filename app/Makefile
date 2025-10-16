.PHONY: help dev dev-no-build fe down logs restart clean

# По умолчанию показываем help
.DEFAULT_GOAL := help

help: ## Показать справку по доступным командам
	@echo "Доступные команды:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

dev: ## Запустить development окружение с пересборкой контейнеров (docker-compose up -d --build)
	@echo "🚀 Запуск development окружения с пересборкой..."
	docker-compose up -d --build
	@echo "✅ Готово! Проверьте логи: make logs"

dev-no-build: ## Запустить development окружение без пересборки (docker-compose up -d)
	@echo "🚀 Запуск development окружения без пересборки..."
	docker-compose up -d
	@echo "✅ Готово! Проверьте логи: make logs"

fe: ## Запустить frontend в dev режиме (npm run start в директории frontend)
	@echo "🎨 Запуск frontend dev сервера..."
	cd frontend && npm run start

down: ## Остановить все контейнеры (docker-compose down)
	@echo "🛑 Остановка контейнеров..."
	docker-compose down

stop: ## Остановить контейнеры без удаления (docker-compose stop)
	@echo "⏸️  Остановка контейнеров..."
	docker-compose stop

restart: ## Перезапустить все контейнеры
	@echo "🔄 Перезапуск контейнеров..."
	docker-compose restart
	@echo "✅ Готово!"

logs: ## Показать логи всех контейнеров
	docker-compose logs -f

logs-backend: ## Показать логи backend
	docker-compose logs -f ims-backend

logs-frontend: ## Показать логи nginx (frontend)
	docker-compose logs -f ims-nginx

logs-postgres: ## Показать логи PostgreSQL
	docker-compose logs -f ims-postgres

ps: ## Показать статус контейнеров
	docker-compose ps

clean: ## Остановить и удалить все контейнеры, сети и volumes
	@echo "🧹 Очистка контейнеров и volumes..."
	docker-compose down -v
	@echo "✅ Очистка завершена!"

build: ## Пересобрать все контейнеры
	@echo "🔨 Пересборка контейнеров..."
	docker-compose build
	@echo "✅ Сборка завершена!"

build-backend: ## Пересобрать только backend
	@echo "🔨 Пересборка backend..."
	docker-compose build ims-backend
	@echo "✅ Сборка backend завершена!"

shell-backend: ## Открыть shell в контейнере backend
	docker exec -it ims-backend sh

shell-postgres: ## Открыть psql в контейнере PostgreSQL
	docker exec -it ims-postgres psql -U admin -d ims

migrate-status: ## Показать статус миграций
	@echo "📊 Статус миграций:"
	docker exec -it ims-backend npm run migrate:status

migrate-up: ## Применить миграции вручную
	@echo "🔄 Применение миграций..."
	docker exec -it ims-backend npm run migrate:up

install-backend: ## Установить зависимости backend
	cd backend && npm install

install-frontend: ## Установить зависимости frontend
	cd frontend && npm install

install: ## Установить все зависимости
	@echo "📦 Установка зависимостей backend..."
	cd backend && npm install
	@echo "📦 Установка зависимостей frontend..."
	cd frontend && npm install
	@echo "✅ Все зависимости установлены!"

