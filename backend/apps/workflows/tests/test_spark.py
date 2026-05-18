import base64
import json
from unittest.mock import MagicMock

from django.test import SimpleTestCase

from apps.workflows.spark import (
    MINIO_ENDPOINT,
    SPARK_IMAGE,
    build_spark_application,
)

SAMPLE_SPEC = {
    "nodes": [
        {
            "id": "src",
            "type": "source",
            "config": {"path": "s3a://flowforge-data/raw/yellow_tripdata_sample.csv"},
            "position": {"x": 0, "y": 0},
        },
        {
            "id": "trx",
            "type": "transform",
            "config": {"sql": "SELECT PULocationID, COUNT(*) AS trips FROM input GROUP BY 1"},
            "position": {"x": 0, "y": 100},
        },
        {
            "id": "snk",
            "type": "sink",
            "config": {"path": "s3a://flowforge-data/output/taxi_by_zone"},
            "position": {"x": 0, "y": 200},
        },
    ],
    "edges": [
        {"from": "src", "to": "trx"},
        {"from": "trx", "to": "snk"},
    ],
}


def _make_version(spec=None):
    v = MagicMock()
    v.spec_json = spec if spec is not None else SAMPLE_SPEC
    return v


class BuildSparkApplicationTest(SimpleTestCase):
    def setUp(self):
        self.manifest = build_spark_application(_make_version(), run_id="abc12345-xxxx-yyyy")

    def test_kind_and_api_version(self):
        self.assertEqual(self.manifest["kind"], "SparkApplication")
        self.assertEqual(self.manifest["apiVersion"], "sparkoperator.k8s.io/v1beta2")

    def test_name_uses_run_id_prefix(self):
        self.assertEqual(self.manifest["metadata"]["name"], "flowforge-run-abc12345")

    def test_run_id_label_present(self):
        labels = self.manifest["metadata"]["labels"]
        self.assertEqual(labels["run-id"], "abc12345-xxxx-yyyy")

    def test_python_type_and_image(self):
        spec = self.manifest["spec"]
        self.assertEqual(spec["type"], "Python")
        self.assertEqual(spec["image"], SPARK_IMAGE)

    def test_dag_spec_encoded_in_driver_env(self):
        envs = {
            e["name"]: e["value"]
            for e in self.manifest["spec"]["driver"]["env"]
        }
        decoded = json.loads(base64.b64decode(envs["DAG_SPEC"]).decode("utf-8"))
        self.assertEqual(len(decoded["nodes"]), 3)
        self.assertEqual(decoded["nodes"][0]["type"], "source")
        self.assertEqual(decoded["edges"][0]["from"], "src")

    def test_minio_hadoop_conf(self):
        hconf = self.manifest["spec"]["hadoopConf"]
        self.assertEqual(hconf["fs.s3a.endpoint"], MINIO_ENDPOINT)
        self.assertEqual(hconf["fs.s3a.path.style.access"], "true")
        self.assertIn("fs.s3a.impl", hconf)

    def test_driver_service_account(self):
        self.assertEqual(self.manifest["spec"]["driver"]["serviceAccount"], "spark")

    def test_executor_instances(self):
        self.assertEqual(self.manifest["spec"]["executor"]["instances"], 1)
