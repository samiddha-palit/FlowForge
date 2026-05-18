#!/usr/bin/env bash
# seed-minio.sh — Download the NYC Taxi sample CSV and upload it to MinIO.
#
# Usage: bash infra/scripts/seed-minio.sh [kube-context]
#
# Requires: kubectl, mc (MinIO Client — https://min.io/docs/minio/linux/reference/minio-mc.html)
# Install mc on macOS: brew install minio/stable/mc

set -euo pipefail

KUBE_CONTEXT="${1:-kind-flowforge}"
MINIO_ALIAS="flowforge-local"
MINIO_USER="minioadmin"
MINIO_PASS="minioadmin"
BUCKET="flowforge-data"
SAMPLE_URL="https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-01.parquet"
LOCAL_FILE="/tmp/yellow_tripdata_sample.csv"
MINIO_LOCAL_PORT=9000

echo "→ Port-forwarding MinIO on localhost:${MINIO_LOCAL_PORT} ..."
kubectl --context "${KUBE_CONTEXT}" port-forward \
  svc/minio 9000:9000 --namespace minio &
PF_PID=$!
trap "kill ${PF_PID} 2>/dev/null || true" EXIT
sleep 3

echo "→ Configuring mc alias '${MINIO_ALIAS}' ..."
mc alias set "${MINIO_ALIAS}" \
  "http://localhost:${MINIO_LOCAL_PORT}" \
  "${MINIO_USER}" "${MINIO_PASS}" --api S3v4

echo "→ Ensuring bucket '${BUCKET}' exists ..."
mc mb --ignore-existing "${MINIO_ALIAS}/${BUCKET}"

# Download a small sample CSV (we convert from Parquet inline using Python if needed,
# or use a direct CSV dataset from the NYC TLC open data page).
# Using a pre-converted small CSV hosted on GitHub for reliability:
SAMPLE_CSV_URL="https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-apr14.csv"

echo "→ Downloading sample trip CSV ..."
curl -fsSL "${SAMPLE_CSV_URL}" -o "${LOCAL_FILE}"

echo "→ Uploading to s3://${BUCKET}/raw/yellow_tripdata_sample.csv ..."
mc cp "${LOCAL_FILE}" "${MINIO_ALIAS}/${BUCKET}/raw/yellow_tripdata_sample.csv"

echo ""
echo "✓ Seed complete. Verify with:"
echo "  mc ls ${MINIO_ALIAS}/${BUCKET}/raw/"
