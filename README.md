# FlowForge

A mini internal data platform with a visual DAG builder and Spark-on-Kubernetes execution engine.

FlowForge is a self-hosted ETL orchestration platform that lets you design data pipelines visually and execute them at scale on Kubernetes. Combine a ReactFlow-powered DAG builder UI with a Django REST backend and Apache Spark operators to build, manage, and run distributed ETL workflows.

## Quick start

### Prerequisites
- Docker & Docker Compose
- Make
- kubectl (optional, for cluster management)
- Kind (optional, for local Kubernetes)

### Getting started

```bash
# Clone the repository
git clone https://github.com/yourusername/flowforge.git
cd flowforge

# Show available commands
make help

# Start all services (backend, frontend, infrastructure)
make up

# In another terminal, seed initial data
make seed

# Stop all services
make down
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:8000`.

### Local Kubernetes cluster (optional)

```bash
# Create a local Kind cluster with Spark Operator
make cluster-up

# Stop the cluster
make cluster-down
```

## Project structure

```
.
├── frontend/          # React/TypeScript UI with ReactFlow DAG builder
├── backend/           # Django REST API and orchestration engine
├── infra/             # Kubernetes configs, Helm charts, docker-compose
├── spark-jobs/        # PySpark job runners and templates
├── docs/              # Architecture and supplementary documentation
├── Makefile           # Development commands
├── .editorconfig      # Editor configuration
├── LICENSE            # MIT License
└── README.md          # This file
```

## Features (Roadmap)

- ✅ Visual DAG builder (Week 7-10)
- ✅ Spark on Kubernetes execution (Week 11-15)
- ✅ User authentication via Keycloak (Week 16-17)
- 🔄 Run status tracking and logs
- 🔄 Multi-tenant isolation
- 📋 See [ROADMAP.md](./ROADMAP.md) for the full 20-week development plan

## Tech stack

| Component | Technology |
|-----------|-----------|
| Frontend | React, TypeScript, ReactFlow, TanStack Query, Tailwind CSS, Vite |
| Backend | Django, Django REST Framework, Celery, Redis, PostgreSQL |
| Data Processing | PySpark, Spark Operator (Kubeflow) |
| Infrastructure | Kind, Kubernetes, Helm, Docker, MinIO (S3) |
| Auth | Keycloak (OIDC + JWT) |

## Development

See [ROADMAP.md](./ROADMAP.md) for the detailed 20-week development plan, including phase breakdowns, weekly goals, and deliverables.

## License

MIT License - see [LICENSE](./LICENSE) for details.
