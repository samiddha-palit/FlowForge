.PHONY: help up up-backend down seed \
        cluster-up cluster-down \
        spark-operator-install spark-pi \
        minio-install seed-data \
        spark-runner-build spark-runner-load

COMPOSE        = docker compose -f infra/docker-compose.yml
CLUSTER_NAME   = flowforge
KUBE_CONTEXT   = kind-$(CLUSTER_NAME)

# ── App services ─────────────────────────────────────────────────────────────

help:
	@echo "FlowForge — available targets:"
	@echo ""
	@echo "  App"
	@echo "    make up               Start all services (backend + frontend)"
	@echo "    make up-backend       Start backend services only"
	@echo "    make down             Stop all services"
	@echo "    make seed             Seed initial data"
	@echo ""
	@echo "  Cluster"
	@echo "    make cluster-up       Create Kind cluster ($(CLUSTER_NAME))"
	@echo "    make cluster-down     Destroy Kind cluster"
	@echo ""
	@echo "  Spark Operator"
	@echo "    make spark-operator-install   Install Spark Operator via Helm"
	@echo "    make spark-pi                 Submit the spark-pi smoke test"
	@echo ""
	@echo "  MinIO"
	@echo "    make minio-install    Install MinIO via Helm"
	@echo "    make seed-data        Upload NYC taxi sample CSV to MinIO"
	@echo ""
	@echo "  Spark Runner"
	@echo "    make spark-runner-build   Build flowforge/spark-runner:dev Docker image"
	@echo "    make spark-runner-load    Load image into the Kind cluster"

up:
	$(COMPOSE) up --build -d

up-backend:
	$(COMPOSE) up --build -d postgres redis backend

down:
	$(COMPOSE) down

seed:
	$(COMPOSE) exec backend python manage.py loaddata initial_data || true

# ── Kubernetes cluster ────────────────────────────────────────────────────────

cluster-up:
	kind create cluster --config infra/kind-config.yaml --name $(CLUSTER_NAME)
	kubectl --context $(KUBE_CONTEXT) create serviceaccount spark --namespace default || true
	kubectl --context $(KUBE_CONTEXT) create clusterrolebinding spark-role \
	  --clusterrole=edit --serviceaccount=default:spark --namespace=default || true
	@echo "✓ Kind cluster '$(CLUSTER_NAME)' is ready."
	@echo "  Run 'make spark-operator-install' next."

cluster-down:
	kind delete cluster --name $(CLUSTER_NAME)

# ── Spark Operator ────────────────────────────────────────────────────────────

spark-operator-install:
	helm repo add spark-operator https://kubeflow.github.io/spark-operator || true
	helm repo update
	helm upgrade --install spark-operator spark-operator/spark-operator \
	  --kube-context $(KUBE_CONTEXT) \
	  --namespace spark-operator --create-namespace \
	  --values infra/helm/spark-operator-values.yaml \
	  --wait
	@echo "✓ Spark Operator installed."
	@echo "  Run 'make spark-pi' to verify."

spark-pi:
	kubectl --context $(KUBE_CONTEXT) apply -f infra/examples/spark-pi.yaml
	@echo "Submitted spark-pi. Watch with:"
	@echo "  kubectl --context $(KUBE_CONTEXT) get sparkapplications -w"
	@echo "  kubectl --context $(KUBE_CONTEXT) logs -l spark-role=driver -f"

# ── MinIO ─────────────────────────────────────────────────────────────────────

minio-install:
	helm repo add minio https://charts.min.io || true
	helm repo update
	helm upgrade --install minio minio/minio \
	  --kube-context $(KUBE_CONTEXT) \
	  --namespace minio --create-namespace \
	  --values infra/helm/minio-values.yaml \
	  --wait
	@echo "✓ MinIO installed."
	@echo "  Run 'make seed-data' to upload the NYC taxi sample."

seed-data:
	bash infra/scripts/seed-minio.sh $(KUBE_CONTEXT)

# ── Spark Runner image ────────────────────────────────────────────────────────

spark-runner-build:
	docker build -t flowforge/spark-runner:dev spark-jobs/

spark-runner-load:
	kind load docker-image flowforge/spark-runner:dev --name $(CLUSTER_NAME)
	@echo "✓ Image loaded into Kind cluster."
