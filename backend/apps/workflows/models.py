import uuid

from django.db import models


class Workflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner_id = models.CharField(max_length=255, blank=True)  # wired to auth in Phase 5
    spec_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name


class WorkflowVersion(models.Model):
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name="versions")
    version_number = models.PositiveIntegerField()
    spec_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version_number"]
        unique_together = [("workflow", "version_number")]

    def __str__(self):
        return f"{self.workflow.name} v{self.version_number}"


class Run(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RUNNING = "RUNNING", "Running"
        SUCCEEDED = "SUCCEEDED", "Succeeded"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow_version = models.ForeignKey(WorkflowVersion, on_delete=models.PROTECT, related_name="runs")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    k8s_job_name = models.CharField(max_length=255, blank=True)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Run {self.id} ({self.status})"


class RunNodeStatus(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RUNNING = "RUNNING", "Running"
        SUCCEEDED = "SUCCEEDED", "Succeeded"
        FAILED = "FAILED", "Failed"

    run = models.ForeignKey(Run, on_delete=models.CASCADE, related_name="node_statuses")
    node_id = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [("run", "node_id")]

    def __str__(self):
        return f"{self.run_id} / {self.node_id} ({self.status})"
