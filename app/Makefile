.PHONY: help dev dev-no-build prod prod-no-build setup-dev-env setup-prod-env fe down logs restart clean seed-report seed-report-auto build-fe-prod deploy-certs

# По умолчанию показываем help
.DEFAULT_GOAL := help

# docker compose (v2 plugin) или legacy docker-compose — на сервере часто только второе
ifeq ($(shell docker compose version >/dev/null 2>&1 && echo ok),ok)
  COMPOSE := docker compose
else
  COMPOSE := docker-compose
endif

# Переменные из .env (setup-*-env копирует .env.development / .env.production → .env)
COMPOSE_DEV = $(COMPOSE)
COMPOSE_PROD = $(COMPOSE) -f docker-compose.yaml -f docker-compose.prod.yaml

help: ## Показать справку по доступным командам
	@echo "Доступные команды:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

setup-dev-env: ## Скопировать dev env-файлы в рабочие .env
	cp .env.development .env
	cp frontend/.env.development frontend/.env

setup-prod-env: ## Скопировать prod env-файлы в рабочие .env
	@test -f .env.production || (echo "Создайте .env.production из .env.production.example" && exit 1)
	cp .env.production .env
	cp frontend/.env.production frontend/.env

dev: setup-dev-env ## Запустить development окружение с пересборкой
	@echo "🚀 Запуск development окружения с пересборкой..."
	$(COMPOSE_DEV) up -d --build
	@echo "✅ Готово! Проверьте логи: make logs"

dev-no-build: setup-dev-env ## Запустить development окружение без пересборки
	@echo "🚀 Запуск development окружения без пересборки..."
	$(COMPOSE_DEV) up -d
	@echo "✅ Готово! Проверьте логи: make logs"

prod: setup-prod-env build-fe-prod ## Запустить production окружение с пересборкой
	@echo "🚀 Запуск production окружения с пересборкой..."
	$(COMPOSE_PROD) up -d --build
	@echo "✅ Готово! Проверьте логи: make logs COMPOSE='$(COMPOSE_PROD)'"

prod-no-build: setup-prod-env build-fe-prod ## Запустить production окружение без пересборки backend
	@echo "🚀 Запуск production окружения без пересборки..."
	$(COMPOSE_PROD) up -d
	@echo "✅ Готово!"

build-fe-prod: setup-prod-env ## Собрать frontend для production (dist/)
	@echo "🎨 Сборка frontend для production..."
	@NPM_REG=$$(grep -E '^NPM_REGISTRY=' .env.production 2>/dev/null | cut -d= -f2- | tr -d ' "'); \
	if [ -z "$$NPM_REG" ]; then \
		echo "NPM_REGISTRY не задан в .env.production"; exit 1; \
	fi; \
	echo "npm registry: $$NPM_REG"; \
	cd frontend && npm config set registry "$$NPM_REG" && npm config set strict-ssl false && \
	npm install --no-audit --no-fund && npm run build
	@echo "✅ Frontend собран в frontend/dist"

deploy-certs: setup-prod-env ## Выпуск/обновление TLS-сертификатов на сервере
	./scripts/deploy-cert.sh production

fe: ## Запустить frontend в dev режиме (npm run start в директории frontend)
	@echo "🎨 Запуск frontend dev сервера..."
	cp frontend/.env.development frontend/.env
	cd frontend && npm run start

down: ## Остановить все контейнеры (docker-compose down)
	@echo "🛑 Остановка контейнеров..."
	@if [ -f .env.production ] && grep -q '^NODE_ENV=production' .env 2>/dev/null; then \
		$(COMPOSE_PROD) down; \
	else \
		$(COMPOSE_DEV) down; \
	fi

stop: ## Остановить контейнеры без удаления (docker-compose stop)
	@echo "⏸️  Остановка контейнеров..."
	@if [ -f .env.production ] && grep -q '^NODE_ENV=production' .env 2>/dev/null; then \
		$(COMPOSE_PROD) stop; \
	else \
		$(COMPOSE_DEV) stop; \
	fi

restart: ## Перезапустить все контейнеры
	@echo "🔄 Перезапуск контейнеров..."
	@if [ -f .env.production ] && grep -q '^NODE_ENV=production' .env 2>/dev/null; then \
		$(COMPOSE_PROD) restart; \
	else \
		$(COMPOSE_DEV) restart; \
	fi
	@echo "✅ Готово!"

logs: ## Показать логи всех контейнеров
	@if [ -f .env.production ] && grep -q '^NODE_ENV=production' .env 2>/dev/null; then \
		$(COMPOSE_PROD) logs -f; \
	else \
		$(COMPOSE_DEV) logs -f; \
	fi

logs-backend: ## Показать логи backend
	@if [ -f .env.production ] && grep -q '^NODE_ENV=production' .env 2>/dev/null; then \
		$(COMPOSE_PROD) logs -f ims-backend; \
	else \
		$(COMPOSE_DEV) logs -f ims-backend; \
	fi

logs-frontend: ## Показать логи nginx (frontend)
	@if [ -f .env.production ] && grep -q '^NODE_ENV=production' .env 2>/dev/null; then \
		$(COMPOSE_PROD) logs -f ims-nginx; \
	else \
		$(COMPOSE_DEV) logs -f ims-nginx; \
	fi

logs-postgres: ## Показать логи PostgreSQL
	@if [ -f .env.production ] && grep -q '^NODE_ENV=production' .env 2>/dev/null; then \
		$(COMPOSE_PROD) logs -f ims-postgres; \
	else \
		$(COMPOSE_DEV) logs -f ims-postgres; \
	fi

ps: ## Показать статус контейнеров
	@if [ -f .env.production ] && grep -q '^NODE_ENV=production' .env 2>/dev/null; then \
		$(COMPOSE_PROD) ps; \
	else \
		$(COMPOSE_DEV) ps; \
	fi

clean: ## Остановить и удалить все контейнеры, сети и volumes
	@echo "🧹 Очистка контейнеров и volumes..."
	$(COMPOSE_DEV) down -v
	@echo "✅ Очистка завершена!"

build: setup-dev-env ## Пересобрать все контейнеры (dev)
	@echo "🔨 Пересборка контейнеров..."
	$(COMPOSE_DEV) build
	@echo "✅ Сборка завершена!"

build-backend: setup-dev-env ## Пересобрать только backend
	@echo "🔨 Пересборка backend..."
	$(COMPOSE_DEV) build ims-backend
	@echo "✅ Сборка backend завершена!"

build-backend-no-cache: setup-dev-env ## Пересобрать только backend без кеша
	@echo "🔨 Пересборка backend без кеша..."
	$(COMPOSE_DEV) build --no-cache ims-backend
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

seed-report: ## Заполнить базу тестовыми данными для отчетов (интерактивно)
	@echo "🌱 Заполнение базы тестовыми данными для отчетов..."
	docker exec -it ims-backend npm run seed:report
	@echo "✅ Данные успешно добавлены!"

seed-report-auto: ## Заполнить базу тестовыми данными для отчетов (автоматически, без интерактивного режима)
	@echo "🌱 Заполнение базы тестовыми данными для отчетов..."
	docker exec ims-backend npm run seed:report
	@echo "✅ Данные успешно добавлены!"

install-backend: ## Установить зависимости backend (локально)
	cd backend && npm install

install-backend-docker: ## Установить зависимости backend внутри контейнера (нужно после добавления новых пакетов в package.json)
	@echo "📦 Установка зависимостей backend в контейнере..."
	docker exec ims-backend npm install
	@echo "✅ Готово! Перезапустите backend: make restart"

install-frontend: ## Установить зависимости frontend
	cd frontend && npm install

install: ## Установить все зависимости
	@echo "📦 Установка зависимостей backend..."
	cd backend && npm install
	@echo "📦 Установка зависимостей frontend..."
	cd frontend && npm install
	@echo "✅ Все зависимости установлены!"
