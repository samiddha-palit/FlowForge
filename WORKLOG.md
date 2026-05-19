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

## Week 7 — ReactFlow canvas

### Session 1 (2026-05-18)
- ✅ Added `reactflow ^11.11.4` and `lucide-react ^0.468.0` to `frontend/package.json`
- ✅ Created `src/components/DagCanvas.tsx`: ReactFlow canvas with Background (dots), Controls, MiniMap, drag-and-drop, cycle-checked edge connections
- ✅ One hardcoded Source node seeded when spec is empty; canvas loads from `workflow.spec_json`
- ✅ Updated `src/pages/WorkflowDetail.tsx`: replaced placeholder div with `<DagCanvas />`
- **Next:** Week 8 — Custom node types + sidebar palette

## Week 8 — Custom node types

### Session 1 (2026-05-18)
- ✅ Created `src/components/nodes/SourceNode.tsx`: blue header, Database icon, shows path preview, source handle bottom
- ✅ Created `src/components/nodes/TransformNode.tsx`: purple header, Code2 icon, shows SQL preview, handles top+bottom
- ✅ Created `src/components/nodes/SinkNode.tsx`: emerald header, HardDrive icon, shows path preview, target handle top
- ✅ Created `src/components/NodePalette.tsx`: left sidebar with draggable Source/Transform/Sink tiles
- ✅ Wired all three types into DagCanvas `nodeTypes` map; drop-to-canvas positions node at cursor
- **Next:** Week 9 — Edge validation + config panel

## Week 9 — Edges & node config panel

### Session 1 (2026-05-18)
- ✅ Created `src/utils/dagUtils.ts`: `hasCycle` (DFS), `specToFlow`, `flowToSpec`
- ✅ Self-loop guard and cycle guard in `onConnect` — alerts user and rejects the edge
- ✅ Created `src/components/ConfigPanel.tsx`: right drawer that appears on node click; path field for source/sink, textarea for transform SQL; closes on × or pane click
- **Next:** Week 10 — Persist DAG to backend

## Week 10 — Persist DAG to backend

### Session 1 (2026-05-18)
- ✅ Defined `DagSpec`, `DagNode`, `DagEdge`, `NodeType`, `NodeConfig` TypeScript types in `src/types/workflow.ts`
- ✅ Created `src/hooks/useUpdateWorkflow.ts`: `PATCH /api/workflows/{id}/` mutation, invalidates query on success
- ✅ "Save" button in DagCanvas toolbar serializes ReactFlow state → DagSpec via `flowToSpec` and calls the mutation
- ✅ `specToFlow` deserializes stored spec back into ReactFlow nodes/edges on page load (refresh-safe)
- ✅ Added `validate_dag_spec` to `backend/apps/workflows/serializers.py`: validates node types, edge references, self-loops, and cycles via DFS
- **Next:** Week 11 — Kind cluster + Spark Operator install

## Week 11 — Kind cluster + Spark Operator install

### Session 1 (2026-05-18)
- ✅ Created `infra/kind-config.yaml`: 3-node cluster (1 control-plane + 2 workers), named `flowforge`
- ✅ Created `infra/helm/spark-operator-values.yaml`: minimal values for `kubeflow/spark-operator` chart (webhook + metrics disabled for dev)
- ✅ Created `infra/examples/spark-pi.yaml`: canonical SparkApplication for Scala SparkPi smoke test
- ✅ Updated `Makefile`: `cluster-up` creates Kind cluster + binds `spark` ServiceAccount; `cluster-down` deletes it; `spark-operator-install` via Helm; `spark-pi` submits smoke test
- **Next:** Week 12 — PySpark job template

## Week 12 — PySpark job template

### Session 1 (2026-05-18)
- ✅ Created `spark-jobs/runner.py`: reads base64 DAG spec from `DAG_SPEC` env var or CLI arg; executes nodes in topological order (Kahn's algorithm); supports source/transform/sink operators
- ✅ Created `spark-jobs/requirements.txt`: empty (PySpark provided by base image)
- ✅ Created `spark-jobs/Dockerfile`: based on `apache/spark:3.5.1-python3`; downloads `hadoop-aws` + `aws-java-sdk-bundle` JARs at build time for S3A/MinIO support
- ✅ Created `infra/examples/flowforge-runner-test.yaml`: SparkApplication to smoke-test the runner image against a single-node source DAG
- ✅ Updated `Makefile`: `spark-runner-build` and `spark-runner-load` targets
- **Next:** Week 13 — MinIO + NYC taxi sample dataset

## Week 13 — MinIO + NYC taxi sample dataset

### Session 1 (2026-05-18)
- ✅ Created `infra/helm/minio-values.yaml`: standalone MinIO, pre-creates `flowforge-data` bucket, exposes API on ClusterIP:9000
- ✅ Created `infra/scripts/seed-minio.sh`: port-forwards MinIO, uses `mc` to create bucket and upload NYC taxi sample CSV
- ✅ Created `infra/examples/verify-minio.yaml`: 3-node SparkApplication (source → transform SQL → sink Parquet) against the seeded data
- ✅ Updated `Makefile`: `minio-install` and `seed-data` targets
- **Next:** Week 14 — Dynamic SparkApplication YAML generation

## Week 14 — Dynamic SparkApplication YAML generation

### Session 1 (2026-05-18)
- ✅ Created `backend/apps/workflows/spark.py`: `build_spark_application(workflow_version, run_id) -> dict` — encodes spec_json as base64, injects as `DAG_SPEC` driver env var, wires MinIO S3A hadoopConf
- ✅ Created `backend/apps/workflows/tests/__init__.py` and `tests/test_spark.py`: 7 unit tests covering kind/apiVersion, name format, DAG spec encoding, MinIO hadoopConf, driver serviceAccount, executor count
- **Next:** Week 15 — Celery worker submits to Kubernetes

## Week 15 — Celery worker submits to Kubernetes

### Session 1 (2026-05-18)
- ✅ Added `kubernetes==31.0.0` to `backend/requirements.txt`
- ✅ Created `backend/flowforge/celery.py`: Celery app with `autodiscover_tasks()`; configured via `CELERY_*` settings
- ✅ Updated `backend/flowforge/__init__.py`: imports `celery_app` so Django loads Celery on startup
- ✅ Created `backend/apps/workflows/tasks.py`: `submit_workflow_run` shared task — loads in-cluster or kubeconfig, builds manifest via `build_spark_application`, submits via `CustomObjectsApi`, persists `k8s_job_name` on Run; retries up to 3× on failure
- ✅ Updated `backend/apps/workflows/views.py`: `POST /api/workflows/{id}/runs/` now enqueues `submit_workflow_run.delay(run_id)` after creating the Run row
- ✅ Updated `infra/docker-compose.yml`: added `celery-worker` service (same image as backend; mounts `~/.kube` read-only so it can reach the Kind cluster from the host)
- **Next:** Week 16 — Keycloak in Docker Compose

## Week 16 — Keycloak in Docker Compose

### Session 1 (2026-05-19)
- ✅ Created `infra/keycloak/realm-flowforge.json`: `flowforge` realm with `flowforge-frontend` (public, PKCE) and `flowforge-backend` (confidential, bearer-only) clients; one test user (`testuser` / `testpass`)
- ✅ Updated `infra/docker-compose.yml`: added `keycloak` service (`quay.io/keycloak/keycloak:26.0`, `start-dev --import-realm`, realm JSON mounted at `/opt/keycloak/data/import/`); healthcheck polls OIDC discovery endpoint
- **Next:** Week 17 — Django + React OIDC integration

## Week 17 — Django + React OIDC integration

### Session 1 (2026-05-19)
- ✅ Added `mozilla-django-oidc==4.0.1` to `backend/requirements.txt`
- ✅ Updated `backend/flowforge/settings.py`: added `mozilla_django_oidc` + `corsheaders` to INSTALLED_APPS; added `OIDCAuthentication` + `IsAuthenticated` as DRF defaults; added `OIDC_RP_*` / `OIDC_OP_*` settings (env-driven); added `AUTHENTICATION_BACKENDS`
- ✅ Updated `backend/flowforge/urls.py`: added `path("oidc/", include("mozilla_django_oidc.urls"))`
- ✅ Updated `backend/apps/workflows/views.py`: removed `AllowAny` from viewsets (now use `IsAuthenticated` default); kept `AllowAny` on `health_check`
- ✅ Added `react-oidc-context ^3.2.0` and `oidc-client-ts ^3.1.0` to `frontend/package.json`
- ✅ Created `frontend/src/auth/oidcConfig.ts`: PKCE config pointing at `http://localhost:8080/realms/flowforge`; `onSigninCallback` clears URL params
- ✅ Created `frontend/src/auth/AuthGuard.tsx`: redirects to Keycloak if unauthenticated; shows loading/error states
- ✅ Created `frontend/src/auth/TokenSetter.tsx`: keeps module-level token getter in sync with OIDC user
- ✅ Updated `frontend/src/api/client.ts`: `setTokenGetter` + auto-injects `Authorization: Bearer` on every `apiFetch` call
- ✅ Updated `frontend/src/main.tsx`: wrapped with `<AuthProvider>`
- ✅ Updated `frontend/src/App.tsx`: all routes wrapped with `<AuthGuard>`; `<TokenSetter />` rendered at root
- ✅ Updated `frontend/src/pages/WorkflowsList.tsx`: added email display + Sign out button
- **Next:** Week 18 — End-to-end happy path

## Week 18 — End-to-end happy path

### Session 1 (2026-05-19)
- ✅ Added `django-cors-headers==4.6.0` to `backend/requirements.txt` + wired into INSTALLED_APPS and MIDDLEWARE (CorsMiddleware first); `CORS_ALLOWED_ORIGINS` env-driven, defaults to `http://localhost:3000`
- ✅ Updated `infra/docker-compose.yml`: added `OIDC_*` env vars to both `backend` and `celery-worker` services so they share the same Keycloak endpoints
- ✅ Verified integration seams: health check remains public (`AllowAny`), Keycloak realm auto-imports on cold start, PKCE redirect URI matches `http://localhost:3000/*`, Django OIDC introspects tokens via Keycloak userinfo endpoint reachable at `http://keycloak:8080` within Docker network
- **Next:** Week 19 — Run status + basic logs

## Week 19 — Run status & basic logs

### Session 1 (2026-05-19)
- ✅ Updated `backend/apps/workflows/tasks.py`: added `poll_run_statuses` Celery beat task — finds PENDING/RUNNING runs with a `k8s_job_name`, fetches `SparkApplication` status from K8s, maps `applicationState.state` to `Run.Status`, updates `started_at` / `finished_at` timestamps
- ✅ Added `CELERY_BEAT_SCHEDULE` to `backend/flowforge/settings.py`: runs `poll_run_statuses` every 10 seconds
- ✅ Updated `infra/docker-compose.yml`: changed celery-worker command to `--beat` so polling runs in the same process
- ✅ Updated `backend/apps/workflows/views.py`: `runs` action now supports `GET` (returns last 10 runs for the workflow) and `POST` (creates run + enqueues task); added `logs` action to `RunViewSet` — fetches driver pod logs via `CoreV1Api` with `spark-role=driver` label selector
- ✅ Created `frontend/src/hooks/useCreateRun.ts`, `useRuns.ts` (polls every 8 s), `useRunLogs.ts`
- ✅ Created `frontend/src/components/RunPanel.tsx`: Run Pipeline button + status badge list (color-coded) + LogsModal (raw driver log, 500-line tail)
- ✅ Updated `frontend/src/pages/WorkflowDetail.tsx`: added `<RunPanel>` below the DAG canvas
- **Next:** Week 20 — Polish, README, demo artifacts

## Week 20 — Polish, README, demo artifacts

### Session 1 (2026-05-19)
- ✅ Rewrote `README.md`: hero description, quick-start (2-step: `make up` + cluster commands), tech-stack table, demo pipeline description, project layout tree, Makefile reference, test instructions
- ✅ Created `docs/ARCHITECTURE.md`: 5 ASCII request-flow diagrams (build/save, run, status polling, log streaming, auth); component map; infrastructure topology diagram
- ✅ Created `docs/RESUME_BULLETS.md`: 4 bullets — core headline + data engineering, platform/full-stack, and infrastructure angles; tip on quantifying with demo metrics
- **Deliverable: Repo is ready to share in interviews**
