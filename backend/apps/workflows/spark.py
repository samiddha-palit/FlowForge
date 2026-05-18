"""
Dynamic SparkApplication manifest builder.

Given a WorkflowVersion, encodes its spec_json as base64 and produces
a SparkApplication CRD dict ready for submission via the Kubernetes API.
"""

import base64
import json

from .models import WorkflowVersion

SPARK_IMAGE = "flowforge/spark-runner:dev"
SPARK_VERSION = "3.5.1"
NAMESPACE = "default"
MINIO_ENDPOINT = "http://minio.minio.svc.cluster.local:9000"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin"


def build_spark_application(workflow_version: WorkflowVersion, run_id: str) -> dict:
    """Return a SparkApplication manifest dict for the given workflow version + run."""
    spec_b64 = base64.b64encode(
        json.dumps(workflow_version.spec_json).encode("utf-8")
    ).decode("ascii")

    # Job name must be a valid DNS label: lowercase, <=63 chars, no underscores
    job_name = f"flowforge-run-{str(run_id)[:8]}"

    return {
        "apiVersion": "sparkoperator.k8s.io/v1beta2",
        "kind": "SparkApplication",
        "metadata": {
            "name": job_name,
            "namespace": NAMESPACE,
            "labels": {
                "app": "flowforge",
                "run-id": str(run_id),
            },
        },
        "spec": {
            "type": "Python",
            "mode": "cluster",
            "image": SPARK_IMAGE,
            "imagePullPolicy": "IfNotPresent",
            "mainApplicationFile": "local:///app/runner.py",
            "sparkVersion": SPARK_VERSION,
            "restartPolicy": {"type": "Never"},
            "hadoopConf": {
                "fs.s3a.endpoint": MINIO_ENDPOINT,
                "fs.s3a.access.key": MINIO_ACCESS_KEY,
                "fs.s3a.secret.key": MINIO_SECRET_KEY,
                "fs.s3a.path.style.access": "true",
                "fs.s3a.impl": "org.apache.hadoop.fs.s3a.S3AFileSystem",
                "fs.s3a.aws.credentials.provider": (
                    "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider"
                ),
            },
            "driver": {
                "cores": 1,
                "memory": "1g",
                "serviceAccount": "spark",
                "env": [
                    {"name": "DAG_SPEC", "value": spec_b64},
                ],
            },
            "executor": {
                "cores": 1,
                "instances": 1,
                "memory": "1g",
            },
        },
    }
