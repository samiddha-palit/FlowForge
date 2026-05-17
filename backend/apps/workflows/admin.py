from django.contrib import admin

from .models import Run, RunNodeStatus, Workflow, WorkflowVersion


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ["name", "owner_id", "created_at", "updated_at"]
    search_fields = ["name", "owner_id"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(WorkflowVersion)
class WorkflowVersionAdmin(admin.ModelAdmin):
    list_display = ["workflow", "version_number", "created_at"]
    readonly_fields = ["created_at"]


@admin.register(Run)
class RunAdmin(admin.ModelAdmin):
    list_display = ["id", "workflow_version", "status", "created_at"]
    list_filter = ["status"]
    readonly_fields = ["id", "created_at"]


@admin.register(RunNodeStatus)
class RunNodeStatusAdmin(admin.ModelAdmin):
    list_display = ["run", "node_id", "status", "started_at", "finished_at"]
    list_filter = ["status"]
