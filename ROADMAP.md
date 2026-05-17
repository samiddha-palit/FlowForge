# FlowForge Roadmap

A 20-week, ground-up build plan for FlowForge: a mini internal data platform with a visual DAG builder and Spark-on-Kubernetes execution.

---

## Ground rules (decisions made up front)

- **Duration:** 20 weeks
- **Time budget:** 2 hours/week (~40 hours total) — every week below has a single, tight 2-hour deliverable
- **Goal:** Resume / interview piece. Optimize for recruiter-impressive narrative and a polished GitHub repo demo
- **MVP scope:** Only the top two killer features — **Visual DAG builder** + **Spark-on-K8s job launcher**. Lineage graph, Prometheus/Grafana, advanced RBAC are explicitly **out of scope** for v1
- **Auth:** Keycloak (OSS, runs in Docker)
- **Repo layout:** Monorepo (recommended) — single repo with `/frontend`, `/backend`, `/infra`, `/spark-jobs`
- **Local Kubernetes:** Kind (recommended) — lightweight, scriptable, fastest cold start
- **Definition of done (week 20):** Runs locally on your laptop; polished GitHub repo with README, screenshots, architecture diagram, and a recorded demo
- **Testing/CI:** Minimal — smoke tests only, no dedicated CI/CD weeks
- **Spark Operator learning:** Just-in-time, kicked off in Week 11
- **Polish:** Opportunistic, not a dedicated phase — max features instead
- **Demo workflow:** Multi-stage NYC taxi pipeline (Source CSV → Clean → Aggregate by zone → Sink Parquet). Shows off the DAG builder and is universally understood

---

## Tech stack reference

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, ReactFlow, TanStack Query, Tailwind CSS, Vite |
| Backend | Django, Django REST Framework, Celery, Redis (broker), PostgreSQL |
| Infra/Data | PySpark, Spark Operator (kubeflow), Kind, Helm, Docker, MinIO (S3) |
| Auth | Keycloak (OIDC + JWT) |

---

## Phase map

| Phase | Weeks | Theme |
|---|---|---|
| 1. Foundation | 1–3 | Repo, Docker, Kind cluster, backend/frontend skeletons |
| 2. Domain model & API | 4–6 | Workflow/Node/Edge/Run models, REST API, FE↔BE wiring |
| 3. Visual DAG builder | 7–10 | ReactFlow canvas, node types, config panel, DAG spec |
| 4. Spark on Kubernetes | 11–15 | Spark Operator, MinIO, PySpark job, dynamic YAML, submission |
| 5. Auth | 16–17 | Keycloak realm, Django OIDC, React login |
| 6. Integration & demo | 18–20 | End-to-end run, status, README + demo recording |

---

## Phase 1 — Foundation (Weeks 1–3)

### Week 1 — Monorepo + tooling
- **Goal:** A clean monorepo skeleton, `.gitignore`, `README` shell, basic tooling
- **Tasks:**
  - Create top-level dirs: `frontend/`, `backend/`, `infra/`, `spark-jobs/`, `docs/`
  - Root `.gitignore`, `.editorconfig`, `LICENSE` (MIT)
  - Add a top-level `Makefile` with placeholder targets: `make up`, `make down`, `make seed`
  - Update `README.md` with a "Quick start" section (placeholder commands)
- **Deliverable:** Repo opens cleanly in VS Code; `make` shows available targets
- **Resume bullet emerging:** *"Designed monorepo architecture for a distributed ETL platform spanning React/TypeScript frontend, Django backend, and Kubernetes infrastructure."*

### Week 2 — Backend skeleton (Django + Postgres in Docker Compose)
- **Goal:** `make up-backend` brings up Django + Postgres
- **Tasks:**
  - `backend/`: `django-admin startproject flowforge`, create `apps/workflows` Django app stub
  - `pyproject.toml` or `requirements.txt` with Django, DRF, psycopg2-binary, celery, redis
  - `infra/docker-compose.yml` with `postgres`, `redis`, `backend` services
  - `Dockerfile` for backend
  - Health check endpoint at `/api/health/` returning `{"status": "ok"}`
- **Deliverable:** `curl localhost:8000/api/health/` returns ok

### Week 3 — Frontend skeleton (React + TS + Tailwind + TanStack Query)
- **Goal:** Vite-based React/TS app with Tailwind, fetching `/api/health/`
- **Tasks:**
  - `frontend/`: `npm create vite@latest -- --template react-ts`
  - Install Tailwind, TanStack Query, configure both
  - Create a single `Dashboard.tsx` page that queries `/api/health/` via TanStack Query
  - Add `frontend/Dockerfile.dev` and wire into compose; configure Vite proxy to backend
- **Deliverable:** `make up` brings up everything; browser shows "Backend status: ok" rendered from a real API call

---

## Phase 2 — Domain model & API (Weeks 4–6)

### Week 4 — Core data models
- **Goal:** Django models for the workflow domain
- **Tasks:**
  - Models in `apps/workflows/models.py`:
    - `Workflow` (id, name, description, created_at, updated_at, owner_id, spec_json)
    - `WorkflowVersion` (workflow_fk, version_number, spec_json, created_at)
    - `Run` (id, workflow_version_fk, status, started_at, finished_at, k8s_job_name, error)
    - `RunNodeStatus` (run_fk, node_id, status, started_at, finished_at)
  - Migrations + register in Django admin
- **Deliverable:** `python manage.py migrate` works; you can create a Workflow in Django admin

### Week 5 — REST API
- **Goal:** CRUD API for workflows + read-only API for runs
- **Tasks:**
  - DRF serializers + viewsets for `Workflow`, `WorkflowVersion`, `Run`
  - Routes: `GET/POST /api/workflows/`, `GET/PUT/DELETE /api/workflows/{id}/`, `POST /api/workflows/{id}/runs/`
  - Permissions stubbed (allow-any for now — auth comes in Phase 5)
  - Basic pagination
- **Deliverable:** Can `curl` to create a workflow with a JSON spec; `GET` returns it

### Week 6 — Frontend ↔ backend wiring
- **Goal:** "Workflows" list and detail pages in the frontend
- **Tasks:**
  - Pages: `WorkflowsList`, `WorkflowDetail`
  - TanStack Query hooks: `useWorkflows`, `useWorkflow(id)`, `useCreateWorkflow`
  - Simple "New workflow" button → creates with a placeholder spec
  - React Router for navigation
- **Deliverable:** Browser → create a workflow → see it in the list → click into detail page

---

## Phase 3 — Visual DAG builder (Weeks 7–10)

This is the visible centerpiece of the demo. Focus on making it look good in screenshots.

### Week 7 — ReactFlow canvas
- **Goal:** Empty ReactFlow canvas on `WorkflowDetail` with pan/zoom and a starter node
- **Tasks:**
  - Install `reactflow`
  - Render canvas, minimap, controls, background grid
  - One hardcoded `source` node on mount
- **Deliverable:** Pretty canvas with one node, smooth pan/zoom

### Week 8 — Custom node types
- **Goal:** Three distinct node types with branded styling
- **Tasks:**
  - Custom node components: `SourceNode`, `TransformNode`, `SinkNode`
  - Tailwind styling — colored headers, icons (lucide-react), handles top/bottom
  - Left sidebar palette → drag-to-canvas to add nodes
- **Deliverable:** Drag from sidebar to add nodes of three different types

### Week 9 — Edges & node config panel
- **Goal:** Connect nodes; clicking a node opens a right-side config panel
- **Tasks:**
  - Edge connection with validation (no self-loops, no cycles — use a simple DFS check)
  - Right drawer: shows selected node's config form (e.g., source path for `SourceNode`, SQL for `TransformNode`, output path for `SinkNode`)
  - Local state only this week; persistence next week
- **Deliverable:** Build a 3-node pipeline visually and fill in node config

### Week 10 — Persist DAG to backend
- **Goal:** Save/load DAG to the `Workflow.spec_json` field
- **Tasks:**
  - Define DAG spec schema (TypeScript type + Python dataclass mirror):
    ```json
    {
      "nodes": [{"id": "n1", "type": "source", "config": {...}}],
      "edges": [{"from": "n1", "to": "n2"}]
    }
    ```
  - Serialize ReactFlow state → spec, deserialize spec → ReactFlow state
  - "Save" button hits `PUT /api/workflows/{id}/`
  - Backend validates spec (DAG, no cycles, valid node types) via DRF serializer
- **Deliverable:** Refresh the page, the workflow you built comes back

---

## Phase 4 — Spark on Kubernetes (Weeks 11–15)

The differentiator. Take time on Week 11 to learn Spark Operator just-in-time.

### Week 11 — Kind cluster + Spark Operator install (learning week)
- **Goal:** A SparkApplication YAML actually runs on your local Kind cluster
- **Tasks:**
  - `infra/kind-config.yaml`; `make cluster-up` creates a multi-node Kind cluster
  - Install Spark Operator via Helm: `kubeflow/spark-operator` chart
  - Run the canonical `spark-pi` example from the operator repo
  - Skim: Spark Operator README, the SparkApplication CRD spec
- **Deliverable:** `kubectl logs <pi-driver-pod>` shows π computed
- **Learning notes:**
  - SparkApplication CRD = declarative wrapper around `spark-submit`
  - Operator watches CRD, creates driver pod, driver creates executor pods
  - Key spec fields: `image`, `mainApplicationFile`, `sparkVersion`, `driver`/`executor` resources

### Week 12 — PySpark job template
- **Goal:** A parameterized PySpark script that powers all node types
- **Tasks:**
  - `spark-jobs/runner.py`: takes DAG spec as a CLI arg (or env var), executes it
  - Implements three operators:
    - `source.csv` → `spark.read.csv(path)`
    - `transform.sql` → `df.createOrReplaceTempView` + `spark.sql(query)`
    - `sink.parquet` → `df.write.parquet(path)`
  - Build a Docker image with PySpark + your runner: `flowforge/spark-runner:dev`
  - Push to a local registry or `kind load docker-image`
- **Deliverable:** `spark-submit` of your image against `spark-pi`-style local run produces output

### Week 13 — MinIO + NYC taxi sample dataset
- **Goal:** S3-compatible storage running in-cluster with seeded data
- **Tasks:**
  - Install MinIO via Helm in the Kind cluster
  - Create bucket `flowforge-data/`
  - Upload a small NYC taxi sample CSV (~10–50MB) to `s3://flowforge-data/raw/yellow_tripdata.csv`
  - Configure PySpark to talk to MinIO (Hadoop S3A configs)
  - Verify: a one-off SparkApplication reads the CSV and writes back a Parquet
- **Deliverable:** Parquet file appears in MinIO console after a Spark run

### Week 14 — Dynamic SparkApplication YAML generation
- **Goal:** Backend service that turns a DAG spec into a SparkApplication manifest
- **Tasks:**
  - `apps/workflows/spark.py` with `build_spark_application(workflow_version) -> dict`
  - Inject DAG spec JSON as a config map or as a CLI arg
  - Template the manifest from a Jinja base or build the dict directly
  - Unit test: given a known spec, produces expected manifest
- **Deliverable:** `python manage.py shell` → call the function → print valid YAML

### Week 15 — Celery worker submits to Kubernetes
- **Goal:** `POST /api/workflows/{id}/runs/` actually launches a Spark job
- **Tasks:**
  - Install `kubernetes` Python client
  - Celery task `submit_workflow_run(run_id)`:
    1. Load the workflow version's spec
    2. Build SparkApplication manifest
    3. `CustomObjectsApi.create_namespaced_custom_object(...)` to submit
    4. Persist `k8s_job_name` on `Run`
  - Wire `POST /runs/` endpoint to enqueue this task
- **Deliverable:** Click "Run" in the UI → a SparkApplication appears via `kubectl get sparkapplications`

---

## Phase 5 — Auth (Weeks 16–17)

### Week 16 — Keycloak in Docker Compose
- **Goal:** Local Keycloak with a `flowforge` realm and clients configured
- **Tasks:**
  - Add `keycloak` service to `docker-compose.yml` (image `quay.io/keycloak/keycloak`)
  - Realm: `flowforge`
  - Two clients: `flowforge-backend` (confidential, for token introspection) and `flowforge-frontend` (public, PKCE)
  - One test user
  - Export realm JSON to `infra/keycloak/realm-flowforge.json` so it auto-imports on cold start
- **Deliverable:** Browser → Keycloak admin → log in as test user via account console

### Week 17 — Django + React OIDC integration
- **Goal:** Real login flow, JWT-protected APIs
- **Tasks:**
  - Backend: `django-allauth` with OIDC provider, or `mozilla-django-oidc` (simpler) — validate JWT on every API call, attach user to request
  - Frontend: `react-oidc-context` for PKCE login flow; attach `Authorization: Bearer ...` to TanStack Query fetcher
  - Lock down workflows API to authenticated users only
- **Deliverable:** Log out → app redirects to Keycloak → log in → land back in app → workflows load

---

## Phase 6 — Integration & demo (Weeks 18–20)

### Week 18 — End-to-end happy path
- **Goal:** Build a DAG in the UI → click Run → Spark executes → output appears in MinIO
- **Tasks:**
  - Use the NYC taxi pipeline: `source (yellow_tripdata.csv)` → `transform (SQL: aggregate fares by pickup zone)` → `sink (parquet)`
  - Fix integration bugs (DAG spec mismatches, S3 paths, image-pull policy on Kind, etc.)
  - Capture screenshots as you go — this is when the demo material is hot
- **Deliverable:** Recorded screencast of a full end-to-end run

### Week 19 — Run status & basic logs
- **Goal:** UI shows run status and a link to driver logs
- **Tasks:**
  - Celery beat task polls SparkApplication status every ~10s and updates `Run.status`
  - Backend endpoint `GET /api/runs/{id}/logs/` proxies `kubectl logs` of the driver pod
  - Frontend run list: status badge + "View logs" button (renders raw log text in a modal)
- **Deliverable:** Trigger a run → watch status go `PENDING` → `RUNNING` → `SUCCEEDED`; click logs to see Spark output

### Week 20 — Polish, README, demo artifacts
- **Goal:** Recruiter-ready repository
- **Tasks:**
  - Rewrite `README.md`: hero screenshot, one-paragraph pitch, architecture diagram (Excalidraw or Mermaid), `make up` quick start, screenshots of DAG builder, screenshot of running SparkApplications
  - Add `docs/ARCHITECTURE.md` describing the request flow: UI → Django → Celery → Spark Operator → Spark pods → MinIO
  - Record a 90-second demo GIF/video; embed in README
  - Write 3 polished resume bullets (sample below) and stash them in `docs/RESUME_BULLETS.md`
- **Deliverable:** Repo is ready to share in interviews

---

## Sample resume bullets (draft at week 20)

- *Built FlowForge, a self-hosted ETL platform combining a ReactFlow visual DAG builder with a Spark-on-Kubernetes execution engine; users design pipelines in the browser and the backend generates and submits SparkApplication CRDs to a Kind/EKS cluster.*
- *Implemented dynamic SparkApplication YAML generation in Django that translates a JSON DAG spec into a parameterized PySpark runner image, executing multi-stage pipelines (CSV → SQL transform → Parquet) against MinIO-backed S3 storage.*
- *Integrated Keycloak (OIDC + JWT, PKCE) across a Django REST Framework backend and a React/TypeScript frontend with TanStack Query, supporting per-user workflow isolation.*

---

## Stretch goals (only if time allows — explicitly out of MVP)

If you finish a week early, pull from this list rather than inventing new work:

- **Run retries** — `retry` button + Celery retry policy on transient failures
- **Live log streaming** — replace polling with Server-Sent Events from a Kubernetes log watcher
- **Dataset lineage view** — second ReactFlow canvas showing workflow → dataset graph
- **Prometheus + Grafana** — scrape Spark metrics, embed Grafana panels in the UI
- **Schedule field on Workflow** — Celery beat triggers runs on a cron
- **Multi-tenant RBAC** — Keycloak roles map to per-workflow permissions
- **Public deployment** — push to a free K8s cloud (e.g., Civo, Linode)

---

## Cadence & accountability

Two hours a week is the constraint that shapes everything else here. To protect that:

- **Pick a fixed 2-hour block** on the same day every week. Calendar it.
- **Start each session by re-reading that week's "Goal" line.** Don't open files until you can restate the goal.
- **End each session by committing whatever works**, even if incomplete. The next-week-you will thank you.
- **If a week's task slips, do not double up.** Move the deliverable forward one week and accept the timeline lengthening — the alternative is burnout on a 40-hour project.
- **Track in a `WORKLOG.md`**: one bullet per session, what you did and what's next.

---

*Last updated: 2026-05-18*
