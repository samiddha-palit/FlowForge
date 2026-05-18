from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Run, Workflow, WorkflowVersion
from .serializers import RunSerializer, WorkflowSerializer


@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["post"])
    def runs(self, request, pk=None):
        from .tasks import submit_workflow_run

        workflow = self.get_object()
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
    permission_classes = [AllowAny]
