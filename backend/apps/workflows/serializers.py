from rest_framework import serializers

from .models import Run, RunNodeStatus, Workflow, WorkflowVersion

VALID_NODE_TYPES = {"source", "transform", "sink"}


def _has_cycle(node_ids: set, edges: list[dict]) -> bool:
    adj: dict[str, list[str]] = {nid: [] for nid in node_ids}
    for edge in edges:
        src = edge.get("from", "")
        dst = edge.get("to", "")
        if src in adj:
            adj[src].append(dst)

    visited: set[str] = set()
    in_stack: set[str] = set()

    def dfs(node_id: str) -> bool:
        if node_id in in_stack:
            return True
        if node_id in visited:
            return False
        visited.add(node_id)
        in_stack.add(node_id)
        for neighbor in adj.get(node_id, []):
            if dfs(neighbor):
                return True
        in_stack.discard(node_id)
        return False

    return any(dfs(nid) for nid in node_ids)


def validate_dag_spec(spec: dict) -> dict:
    if not isinstance(spec, dict):
        raise serializers.ValidationError("spec_json must be an object.")

    nodes = spec.get("nodes", [])
    edges = spec.get("edges", [])

    if not isinstance(nodes, list):
        raise serializers.ValidationError("spec_json.nodes must be an array.")
    if not isinstance(edges, list):
        raise serializers.ValidationError("spec_json.edges must be an array.")

    node_ids: set[str] = set()
    for i, node in enumerate(nodes):
        if not isinstance(node, dict):
            raise serializers.ValidationError(f"nodes[{i}] must be an object.")
        nid = node.get("id")
        if not nid or not isinstance(nid, str):
            raise serializers.ValidationError(f"nodes[{i}].id must be a non-empty string.")
        if nid in node_ids:
            raise serializers.ValidationError(f"Duplicate node id: {nid}.")
        node_ids.add(nid)
        ntype = node.get("type")
        if ntype not in VALID_NODE_TYPES:
            raise serializers.ValidationError(
                f"nodes[{i}].type must be one of {sorted(VALID_NODE_TYPES)}, got '{ntype}'."
            )

    for i, edge in enumerate(edges):
        if not isinstance(edge, dict):
            raise serializers.ValidationError(f"edges[{i}] must be an object.")
        src = edge.get("from")
        dst = edge.get("to")
        if src not in node_ids:
            raise serializers.ValidationError(f"edges[{i}].from '{src}' references unknown node.")
        if dst not in node_ids:
            raise serializers.ValidationError(f"edges[{i}].to '{dst}' references unknown node.")
        if src == dst:
            raise serializers.ValidationError(f"edges[{i}] is a self-loop on node '{src}'.")

    if _has_cycle(node_ids, edges):
        raise serializers.ValidationError("spec_json contains a cycle.")

    return spec


class RunNodeStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RunNodeStatus
        fields = ["node_id", "status", "started_at", "finished_at"]


class RunSerializer(serializers.ModelSerializer):
    node_statuses = RunNodeStatusSerializer(many=True, read_only=True)

    class Meta:
        model = Run
        fields = [
            "id",
            "workflow_version",
            "status",
            "started_at",
            "finished_at",
            "k8s_job_name",
            "error",
            "created_at",
            "node_statuses",
        ]
        read_only_fields = [
            "id",
            "status",
            "started_at",
            "finished_at",
            "k8s_job_name",
            "error",
            "created_at",
        ]


class WorkflowVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowVersion
        fields = ["id", "version_number", "spec_json", "created_at"]
        read_only_fields = ["id", "version_number", "created_at"]


class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = ["id", "name", "description", "owner_id", "spec_json", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_spec_json(self, value: dict) -> dict:
        return validate_dag_spec(value)
