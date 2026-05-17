# FlowForge Work Log

## Week 1 — Monorepo + tooling

### Session 1 (2026-05-18)
- ✅ Created monorepo directory structure: `frontend/`, `backend/`, `infra/`, `spark-jobs/`, `docs/`
- ✅ Added `.gitignore` with Python, Node, Docker, and IDE exclusions
- ✅ Added `.editorconfig` with formatting rules for Python, JavaScript, YAML, and JSON
- ✅ Added MIT `LICENSE` file
- ✅ Created `Makefile` with placeholder targets: `up`, `down`, `seed`, `cluster-up`, `cluster-down`
- ✅ Updated `README.md` with project description, quick start instructions, and tech stack
- **Next:** Week 2 — Backend skeleton (Django + Postgres in Docker Compose)

## Week 2 — Backend skeleton (Django + Postgres in Docker Compose)

### Session 1 (2026-05-18)
- ✅ Created `backend/requirements.txt` (Django 5.1, DRF, psycopg2-binary, Celery, Redis, gunicorn)
- ✅ Scaffolded Django project: `manage.py`, `flowforge/` package, `settings.py`, `urls.py`, `wsgi.py`, `asgi.py`
- ✅ Created `apps/workflows/` stub app with `AppConfig`
- ✅ Added `GET /api/health/` endpoint returning `{"status": "ok"}`
- ✅ Created `backend/Dockerfile` (python:3.12-slim, gunicorn)
- ✅ Created `infra/docker-compose.yml` with `postgres`, `redis`, and `backend` services (with healthchecks)
- ✅ Updated `Makefile`: `make up-backend` starts backend services; `make up`/`make down` now wired to docker compose
- **Next:** Week 3 — Frontend skeleton (React + TS + Tailwind + TanStack Query)

## Week 3 — Frontend skeleton (React + TS + Tailwind + TanStack Query)

### Session 1 (2026-05-18)
- ✅ Created `frontend/package.json` (React 18, Vite 5, Tailwind CSS 3, TanStack Query 5, TypeScript 5)
- ✅ Created `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- ✅ Created `vite.config.ts` with `/api` proxy (env-driven: `BACKEND_URL`, defaults to `localhost:8000`)
- ✅ Created `tailwind.config.ts` and `postcss.config.js`
- ✅ Created `index.html`, `src/main.tsx` (QueryClientProvider), `src/App.tsx`, `src/index.css`
- ✅ Created `src/pages/Dashboard.tsx` — fetches `/api/health/` via TanStack Query, shows status badge
- ✅ Created `frontend/Dockerfile.dev` (node:20-alpine, hot-reload via volume mount)
- ✅ Wired frontend into `infra/docker-compose.yml` with `src/` volume for hot reload
- **Next:** Week 4 — Core data models (Workflow, WorkflowVersion, Run, RunNodeStatus)

## Week 4 — Core data models

### Session 1 (2026-05-18)
- ✅ Created `apps/workflows/models.py`: `Workflow`, `WorkflowVersion`, `Run` (UUID pk, status choices), `RunNodeStatus`
- ✅ Created `apps/workflows/admin.py`: all four models registered with sensible list_display/search
- ✅ Created `apps/workflows/migrations/0001_initial.py`: hand-written initial migration
- **Next:** Week 5 — REST API

## Week 5 — REST API

### Session 1 (2026-05-18)
- ✅ Created `apps/workflows/serializers.py`: `WorkflowSerializer`, `WorkflowVersionSerializer`, `RunSerializer` (with nested `RunNodeStatusSerializer`)
- ✅ Updated `apps/workflows/views.py`: `WorkflowViewSet` (full CRUD + `runs` action), `RunViewSet` (read-only)
- ✅ Created `apps/workflows/urls.py`: DRF DefaultRouter wiring workflows + runs + health check
- ✅ Updated `flowforge/urls.py`: routes all `/api/*` through the app urls
- **Next:** Week 6 — Frontend ↔ backend wiring

## Week 6 — Frontend ↔ backend wiring

### Session 1 (2026-05-18)
- ✅ Added `react-router-dom ^6.28` to `frontend/package.json`
- ✅ Created `src/types/workflow.ts`: `Workflow`, `PaginatedResponse<T>`, `Run`, `RunStatus`
- ✅ Created `src/api/client.ts`: typed `apiFetch` wrapper
- ✅ Created `src/hooks/useWorkflows.ts`, `useWorkflow.ts`, `useCreateWorkflow.ts`
- ✅ Created `src/pages/WorkflowsList.tsx`: list view with "New workflow" button, navigate on click
- ✅ Created `src/pages/WorkflowDetail.tsx`: detail view with DAG canvas placeholder
- ✅ Updated `src/App.tsx`: React Router with `/` → `/workflows`, `/workflows/:id`
- **Next:** Week 7 — ReactFlow canvas on WorkflowDetail
