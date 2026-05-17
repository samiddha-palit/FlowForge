from rest_framework import serializers

from .models import Run, RunNodeStatus, Workflow, WorkflowVersion


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
