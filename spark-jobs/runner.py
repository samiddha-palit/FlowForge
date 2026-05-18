"""
FlowForge PySpark DAG runner.

Reads the DAG spec from the DAG_SPEC env var (base64-encoded JSON) or
the first CLI argument, then executes nodes in topological order:

  source    -> spark.read.csv(config.path)
  transform -> input df registered as "input" view + spark.sql(config.sql)
  sink      -> df.write.mode("overwrite").parquet(config.path)
"""

import base64
import json
import os
import sys
from collections import deque


def load_spec() -> dict:
    raw = sys.argv[1] if len(sys.argv) > 1 else os.environ["DAG_SPEC"]
    return json.loads(base64.b64decode(raw).decode("utf-8"))


def topological_sort(nodes: list[dict], edges: list[dict]) -> list[dict]:
    id_to_node = {n["id"]: n for n in nodes}
    in_degree: dict[str, int] = {n["id"]: 0 for n in nodes}
    adj: dict[str, list[str]] = {n["id"]: [] for n in nodes}

    for edge in edges:
        adj[edge["from"]].append(edge["to"])
        in_degree[edge["to"]] += 1

    queue = deque(nid for nid, deg in in_degree.items() if deg == 0)
    order: list[dict] = []
    while queue:
        nid = queue.popleft()
        order.append(id_to_node[nid])
        for neighbor in adj[nid]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(nodes):
        raise ValueError("DAG contains a cycle — cannot execute.")
    return order


def main() -> None:
    from pyspark.sql import SparkSession

    spec = load_spec()
    nodes: list[dict] = spec["nodes"]
    edges: list[dict] = spec.get("edges", [])

    if not nodes:
        print("No nodes in DAG spec — nothing to do.")
        return

    execution_order = topological_sort(nodes, edges)

    # Build the map of direct predecessors (last incoming edge wins)
    predecessors: dict[str, str] = {}
    for edge in edges:
        predecessors[edge["to"]] = edge["from"]

    spark = SparkSession.builder.appName("flowforge-runner").getOrCreate()
    frames: dict[str, object] = {}

    try:
        for node in execution_order:
            nid: str = node["id"]
            ntype: str = node["type"]
            cfg: dict = node.get("config", {})

            if ntype == "source":
                df = (
                    spark.read.option("header", "true")
                    .option("inferSchema", "true")
                    .csv(cfg["path"])
                )
                frames[nid] = df
                print(f"[source] {nid}: read {df.count()} rows from {cfg['path']}")

            elif ntype == "transform":
                pred_id = predecessors.get(nid)
                if pred_id is None or pred_id not in frames:
                    raise ValueError(
                        f"Transform node '{nid}' has no upstream frame. "
                        f"Connect a source or transform node to it first."
                    )
                frames[pred_id].createOrReplaceTempView("input")
                df = spark.sql(cfg["sql"])
                frames[nid] = df
                print(f"[transform] {nid}: executed SQL, result has {df.count()} rows")

            elif ntype == "sink":
                pred_id = predecessors.get(nid)
                if pred_id is None or pred_id not in frames:
                    raise ValueError(f"Sink node '{nid}' has no upstream frame.")
                df = frames[pred_id]
                df.write.mode("overwrite").parquet(cfg["path"])
                frames[nid] = df
                print(f"[sink] {nid}: wrote Parquet to {cfg['path']}")

            else:
                raise ValueError(f"Unknown node type '{ntype}'.")

    finally:
        spark.stop()

    print("FlowForge runner completed successfully.")


if __name__ == "__main__":
    main()
