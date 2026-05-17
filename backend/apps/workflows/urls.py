from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("workflows", views.WorkflowViewSet, basename="workflow")
router.register("runs", views.RunViewSet, basename="run")

urlpatterns = [
    path("", include(router.urls)),
    path("health/", views.health_check),
]
