.PHONY: help up up-backend down seed cluster-up cluster-down

COMPOSE = docker compose -f infra/docker-compose.yml

help:
	@echo "FlowForge development commands:"
	@echo "  make up           - Start all services (backend, frontend, infrastructure)"
	@echo "  make up-backend   - Start backend services only (postgres, redis, backend)"
	@echo "  make down         - Stop all services"
	@echo "  make seed         - Seed initial data"
	@echo "  make cluster-up   - Create Kind Kubernetes cluster"
	@echo "  make cluster-down - Destroy Kind Kubernetes cluster"

up:
	$(COMPOSE) up --build -d

up-backend:
	$(COMPOSE) up --build -d postgres redis backend

down:
	$(COMPOSE) down

seed:
	@echo "Seeding initial data..."
	@echo "TODO: Implement database seeding"

cluster-up:
	@echo "Creating Kind cluster..."
	@echo "TODO: Implement Kind cluster creation"

cluster-down:
	@echo "Destroying Kind cluster..."
	@echo "TODO: Implement Kind cluster destruction"
