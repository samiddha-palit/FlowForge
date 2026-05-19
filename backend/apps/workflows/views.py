from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Run, Workflow, WorkflowVersion
from .serializers import RunSerializer, WorkflowSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"})


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get", "post"])
    def runs(self, request, pk=None):
        workflow = self.get_object()

        if request.method == "GET":
            qs = Run.objects.filter(
                workflow_version__workflow=workflow
            ).order_by("-created_at")[:10]
            return Response(RunSerializer(qs, many=True).data)

        # POST — snapshot the current spec and enqueue a Spark run
        from .tasks import submit_workflow_run

        last = workflow.versions.first()
        version_number = (last.version_number + 1) if last else 1
        version = WorkflowVersion.objects.create(
            workflow=workflow,
            version_number=version_number,
            spec_json=workflow.spec_json,
        )
        run = Run.objects.create(workflow_version=version)
        submit_workflow_run.delay(str(run.id))
        return Response(RunSerializer(run).data, status=status.HTTP_201_CREATED)


class RunViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Run.objects.select_related("workflow_version__workflow").all()
    serializer_class = RunSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"])
    def logs(self, request, pk=None):
        from kubernetes import client as k8s_client
        from kubernetes import config as k8s_config

        run = self.get_object()

        if not run.k8s_job_name:
            return Response({"logs": "Job not yet submitted."})

        try:
            k8s_config.load_incluster_config()
        except k8s_config.ConfigException:
            k8s_config.load_kube_config()

        v1 = k8s_client.CoreV1Api()
        pods = v1.list_namespaced_pod(
            namespace="default",
            label_selector=f"spark-app-name={run.k8s_job_name},spark-role=driver",
        )

        if not pods.items:
            return Response({"logs": "Driver pod not found yet — the job may still be starting."})

        driver_pod = pods.items[0]
        try:
            log_text = v1.read_namespaced_pod_log(
                name=driver_pod.metadata.name,
                namespace="default",
                tail_lines=500,
            )
        except Exception as exc:
            return Response({"logs": f"Could not fetch logs: {exc}"})

        return Response({"logs": log_text})
