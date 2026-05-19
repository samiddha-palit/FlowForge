# FlowForge — Architecture

## Overview

FlowForge is a self-hosted ETL platform. Users design multi-stage data pipelines in a browser-based visual DAG editor, then execute them as PySpark jobs on a Kubernetes cluster backed by MinIO object storage.

---

## Request flow — Build & save a pipeline

```
Browser (React + ReactFlow)
  │  drag nodes, connect edges, fill config panel
  │
  ▼
DagCanvas.tsx   ──[Save button]──▶  PUT /api/workflows/{id}/
                                          │
                                          ▼
                                   WorkflowSerializer
                                   validate_dag_spec()
                                   (node types, edge refs, cycle check)
                                          │
                                          ▼
                                   Workflow.spec_json (PostgreSQL JSONB)
```

## Request flow — Run a pipeline

```
Browser
  │  [Run pipeline] button
  │
  ▼
POST /api/workflows/{id}/runs/
  │
  ▼
Django (WorkflowViewSet.runs)
  ├─ Snapshot spec_json → WorkflowVersion
  ├─ Create Run (status=PENDING)
  └─ submit_workflow_run.delay(run_id)
          │
          ▼ (Celery worker)
  build_spark_application(workflow_version, run_id)
  ├─ Base64-encode spec_json → DAG_SPEC env var
  └─ Produce SparkApplication CRD dict
          │
          ▼ (kubernetes Python client)
  CustomObjectsApi.create_namespaced_custom_object()
          │
          ▼ (Spark Operator in Kind/K8s)
  Driver pod  ──spawns──▶  Executor pods
          │
          ▼ (runner.py)
  Topological sort → execute nodes:
    source     → spark.read.csv(s3a://...)
    transform  → createOrReplaceTempView + spark.sql(...)
    sink       → df.write.parquet(s3a://...)
          │
          ▼ (MinIO / S3A)
  Output Parquet files in flowforge-data bucket
```

## Request flow — Status polling

```
Celery beat (every 10 s)
  │
  ▼
poll_run_statuses()
  ├─ Find all PENDING/RUNNING runs with k8s_job_name set
  └─ For each:
       CustomObjectsApi.get_namespaced_custom_object()
       Map applicationState.state → Run.Status
       Update started_at / finished_at timestamps
          │
          ▼
       Run.status updated in PostgreSQL
          │
          ▼
       Frontend polls GET /api/workflows/{id}/runs/ (every 8 s)
       RunPanel status badges update automatically
```

## Request flow — View logs

```
Browser [logs] link
  │
  ▼
GET /api/runs/{id}/logs/
  │
  ▼
RunViewSet.logs()
  ├─ CoreV1Api.list_namespaced_pod(label_selector="spark-role=driver,spark-app-name=...")
  └─ CoreV1Api.read_namespaced_pod_log(tail_lines=500)
          │
          ▼
  {"logs": "..."} → rendered in LogsModal
```

## Auth flow (Phase 5)

```
Browser
  │  (not authenticated)
  ▼
AuthGuard → auth.signinRedirect()
  │
  ▼
Keycloak (http://localhost:8080/realms/flowforge)
  PKCE login page
  │
  ▼
Keycloak callback → react-oidc-context stores access_token in memory
TokenSetter sets module-level getter in api/client.ts
  │
  ▼
All apiFetch() calls → Authorization: Bearer <access_token>
  │
  ▼
Django OIDCAuthentication → calls Keycloak /userinfo to validate
  ├─ Valid   → attaches request.user, handler proceeds
  └─ Invalid → 401 Unauthorized
```

---

## Component map

```
frontend/
  src/
    auth/           oidcConfig, AuthGuard, TokenSetter
    api/            apiFetch (module-level token injection)
    hooks/          useWorkflows, useWorkflow, useCreateWorkflow,
                    useUpdateWorkflow, useCreateRun, useRuns, useRunLogs
    components/
      nodes/        SourceNode, TransformNode, SinkNode
      DagCanvas     ReactFlow wrapper (drop, connect, save)
      NodePalette   Draggable node type sidebar
      ConfigPanel   Right-side node config drawer
      RunPanel      Run button + status list + logs modal
    pages/
      WorkflowsList
      WorkflowDetail

backend/
  apps/workflows/
    models.py       Workflow, WorkflowVersion, Run, RunNodeStatus
    serializers.py  DRF serializers + validate_dag_spec()
    views.py        WorkflowViewSet, RunViewSet (with runs + logs actions)
    spark.py        build_spark_application() → SparkApplication dict
    tasks.py        submit_workflow_run, poll_run_statuses (Celery)
  flowforge/
    settings.py     Django + Celery + OIDC + CORS config
    celery.py       Celery app + autodiscover

spark-jobs/
  runner.py         PySpark DAG executor (topological sort, source/transform/sink)
  Dockerfile        apache/spark:3.5.1-python3 + hadoop-aws + aws-java-sdk JARs

infra/
  docker-compose.yml    postgres, redis, backend, celery-worker, frontend, keycloak
  kind-config.yaml      3-node Kind cluster
  helm/                 spark-operator-values.yaml, minio-values.yaml
  keycloak/             realm-flowforge.json (auto-imported on cold start)
  examples/             spark-pi.yaml, flowforge-runner-test.yaml, verify-minio.yaml
  scripts/              seed-minio.sh
```

---

## Infrastructure topology (local dev)

```
Host machine
├── Docker Compose
│   ├── postgres:5432
│   ├── redis:6379
│   ├── backend:8000          (Django + gunicorn)
│   ├── celery-worker         (Celery worker + beat, mounts ~/.kube)
│   ├── frontend:3000         (Vite dev server)
│   └── keycloak:8080
│
└── Kind cluster (flowforge)
    ├── spark-operator         (namespace: spark-operator)
    ├── minio                  (namespace: minio)
    └── default namespace
        ├── spark ServiceAccount
        └── SparkApplication CRDs (created per run)
```
