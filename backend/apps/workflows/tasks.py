from celery import shared_task


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def submit_workflow_run(self, run_id: str) -> None:
    """
    Celery task: build a SparkApplication manifest for the given run and
    submit it to the Kubernetes cluster via the Spark Operator CRD API.
    """
    from kubernetes import client as k8s_client
    from kubernetes import config as k8s_config

    from .models import Run
    from .spark import build_spark_application

    run = Run.objects.select_related("workflow_version").get(id=run_id)

    try:
        k8s_config.load_incluster_config()
    except k8s_config.ConfigException:
        # Fall back to local kubeconfig (dev environment)
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
