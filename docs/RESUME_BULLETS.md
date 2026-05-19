# FlowForge — Resume Bullets

Three polished bullets for interviews. Pick the ones that fit the role.

---

## Core bullet (use this one always)

> Built **FlowForge**, a self-hosted ETL platform combining a ReactFlow visual DAG builder with a Spark-on-Kubernetes execution engine; users design multi-stage pipelines in the browser and the backend dynamically generates and submits `SparkApplication` CRDs to a Kind/EKS cluster via the Spark Operator.

---

## Data engineering angle

> Implemented a parameterized PySpark runner that deserializes a DAG spec (source → SQL transform → Parquet sink) from a base64-encoded Kubernetes env var, executes nodes in topological order, and reads/writes to MinIO-backed S3-compatible storage using Hadoop S3A — enabling fully declarative, schema-agnostic pipeline execution without code changes.

---

## Platform / full-stack angle

> Integrated Keycloak OIDC (PKCE + RS256 JWT) across a Django REST Framework API and a React/TypeScript frontend with TanStack Query; bearer tokens are injected into all API calls via a module-level token getter, and a Celery beat task polls `SparkApplication` status every 10 seconds to surface `PENDING → RUNNING → SUCCEEDED` state transitions in the UI.

---

## Architecture / infrastructure angle

> Designed and implemented the end-to-end infrastructure for FlowForge: a 3-node Kind cluster with Spark Operator and MinIO installed via Helm, a Celery worker with kubeconfig mount that submits jobs via the Kubernetes Python client, and a docker-compose stack (Postgres, Redis, Django, Celery, Vite, Keycloak) that brings the full platform up locally with a single `make up`.

---

*Tip: The first bullet is the headline. Pick one of the three angle bullets as the second point, then quantify with a metric from your actual demo run (rows processed, pipeline latency, etc.).*
