from celery import shared_task


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def submit_workflow_run(self, run_id: str) -> None:
    """Build a SparkApplication manifest and submit it to Kubernetes."""
    from kubernetes import client as k8s_client
    from kubernetes import config as k8s_config

    from .models import Run
    from .spark import build_spark_application

    run = Run.objects.select_related("workflow_version").get(id=run_id)

    try:
        k8s_config.load_incluster_config()
    except k8s_config.ConfigException:
        k8s_config.load_kube_config()

    manifest = build_spark_application(run.workflow_version, run_id=str(run.id))
    api = k8s_client.CustomObjectsApi()
    try:
        result = api.create_namespaced_custom_object(
            group="sparkoperator.k8s.io",
            version="v1beta2",
            namespace="default",
            plural="sparkapplications",
            body=manifest,
        )
    except Exception as exc:
        run.status = Run.Status.FAILED
        run.error = str(exc)
        run.save(update_fields=["status", "error"])
        raise self.retry(exc=exc)

    run.k8s_job_name = result["metadata"]["name"]
    run.save(update_fields=["k8s_job_name"])


@shared_task
def poll_run_statuses() -> None:
    """Celery beat task: sync Run.status with the SparkApplication state in K8s."""
    from django.utils import timezone

    from kubernetes import client as k8s_client
    from kubernetes import config as k8s_config

    from .models import Run

    active = Run.objects.filter(
        status__in=[Run.Status.PENDING, Run.Status.RUNNING],
        k8s_job_name__gt="",
    )
    if not active.exists():
        return

    try:
        k8s_config.load_incluster_config()
    except k8s_config.ConfigException:
        k8s_config.load_kube_config()

    api = k8s_client.CustomObjectsApi()

    # SparkOperator applicationState.state → Run.Status mapping
    STATE_MAP = {
        "SUBMITTED": Run.Status.PENDING,
        "PENDING_RERUN": Run.Status.PENDING,
        "RUNNING": Run.Status.RUNNING,
        "COMPLETED": Run.Status.SUCCEEDED,
        "FAILED": Run.Status.FAILED,
        "SUBMISSION_FAILED": Run.Status.FAILED,
        "UNKNOWN": Run.Status.PENDING,
    }

    for run in active:
        try:
            spark_app = api.get_namespaced_custom_object(
                group="sparkoperator.k8s.io",
                version="v1beta2",
                namespace="default",
                plural="sparkapplications",
                name=run.k8s_job_name,
            )
            state = (
                spark_app.get("status", {})
                .get("applicationState", {})
                .get("state", "UNKNOWN")
            )
            new_status = STATE_MAP.get(state, Run.Status.PENDING)
            update_fields: list[str] = []

            if run.status != new_status:
                run.status = new_status
                update_fields.append("status")

            if new_status == Run.Status.RUNNING and run.started_at is None:
                run.started_at = timezone.now()
                update_fields.append("started_at")

            if new_status in (Run.Status.SUCCEEDED, Run.Status.FAILED):
                if run.finished_at is None:
                    run.finished_at = timezone.now()
                    update_fields.append("finished_at")

            if update_fields:
                run.save(update_fields=update_fields)

        except Exception:
            pass  # Don't abort the whole poll if one run lookup fails
