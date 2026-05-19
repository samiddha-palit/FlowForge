# FlowForge

**A self-hosted ETL platform with a visual DAG builder and Spark-on-Kubernetes execution.**

Design multi-stage data pipelines in the browser. Click Run. Watch PySpark execute them on a real Kubernetes cluster.

---

## What it does

| Step | What happens |
|------|-------------|
| **Design** | Drag Source, Transform, and Sink nodes onto a ReactFlow canvas. Connect them. Fill in S3 paths and SQL. |
| **Save** | Click Save — the backend validates the DAG (no cycles, valid node types) and stores the spec. |
| **Run** | Click Run Pipeline — Django snapshots the spec, enqueues a Celery task, and submits a `SparkApplication` CRD to Kubernetes via the Spark Operator. |
| **Watch** | The UI polls every 8 seconds. Status badges update: `PENDING → RUNNING → SUCCEEDED`. Click **logs** to stream driver output. |

---

## Quick start

**Prerequisites:** Docker, Docker Compose, Kind, Helm, kubectl

```bash
# Clone & start the app services
git clone https://github.com/your-username/flowforge.git
cd flowforge
make up

# Browser → http://localhost:3000
# Keycloak → http://localhost:8080  (admin / admin)
# Default test user: testuser / testpass
```

```bash
# Bring up the Kubernetes layer (separate terminal)
make cluster-up
make spark-operator-install
make minio-install
make seed-data              # uploads NYC taxi sample CSV to MinIO

# Build and load the PySpark runner image
make spark-runner-build
make spark-runner-load
```

**That's it.** Open a workflow, build a 3-node pipeline, click **Run pipeline**.

---

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 18, TypeScript, ReactFlow, TanStack Query v5, Tailwind CSS, Vite |
| Backend | Django 5, Django REST Framework, Celery 5, Redis, PostgreSQL |
| Auth | Keycloak 26 (OIDC + PKCE + RS256 JWT) |
| Data / Infra | PySpark 3.5, Spark Operator (kubeflow), Kind, Helm, MinIO (S3A) |
| Kubernetes client | Python `kubernetes` SDK |

---

## Demo pipeline — NYC Taxi

The included demo uses a small NYC yellow taxi CSV seeded into MinIO:

```
Source  →  s3a://flowforge-data/raw/yellow_tripdata_sample.csv
             ↓  (CSV, ~10 MB, inferred schema)
Transform →  SELECT PULocationID,
                    COUNT(*) AS trips,
                    SUM(fare_amount) AS total_fare
             FROM input
             GROUP BY PULocationID
             ↓
Sink    →  s3a://flowforge-data/output/taxi_by_zone
             (Parquet, partitioned output)
```

---

## Project layout

```
flowforge/
├── frontend/          React + TypeScript app (Vite)
│   └── src/
│       ├── auth/      Keycloak OIDC config, AuthGuard, TokenSetter
│       ├── components/ DagCanvas, NodePalette, ConfigPanel, RunPanel
│       │   └── nodes/  SourceNode, TransformNode, SinkNode
│       ├── hooks/     TanStack Query hooks
│       └── pages/     WorkflowsList, WorkflowDetail
├── backend/           Django REST API + Celery workers
│   └── apps/workflows/
│       ├── models.py   Workflow, WorkflowVersion, Run, RunNodeStatus
│       ├── spark.py    Dynamic SparkApplication manifest builder
│       └── tasks.py    submit_workflow_run, poll_run_statuses
├── spark-jobs/        PySpark DAG runner + Dockerfile
├── infra/
│   ├── docker-compose.yml
│   ├── kind-config.yaml
│   ├── helm/          spark-operator + minio Helm values
│   ├── keycloak/      realm-flowforge.json (auto-imported)
│   └── examples/      spark-pi.yaml, verify-minio.yaml
└── docs/
    ├── ARCHITECTURE.md  Full request-flow diagrams
    └── RESUME_BULLETS.md
```

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full request-flow diagrams covering build, run, status polling, log streaming, and auth.

---

## Makefile reference

```
make up                      Start Docker Compose stack (app + keycloak)
make down                    Stop all services
make cluster-up              Create Kind cluster + spark ServiceAccount
make cluster-down            Destroy Kind cluster
make spark-operator-install  Install Spark Operator via Helm
make spark-pi                Submit the spark-pi smoke test
make minio-install           Install MinIO via Helm
make seed-data               Upload NYC taxi sample CSV to MinIO
make spark-runner-build      Build flowforge/spark-runner:dev image
make spark-runner-load       Load image into the Kind cluster
```

---

## Running the unit tests

```bash
cd backend
pip install -r requirements.txt
python manage.py test apps.workflows.tests
```

---

*Built as a portfolio project demonstrating end-to-end data platform engineering.*
