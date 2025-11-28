from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Créer le router DRF
router = DefaultRouter()

# Enregistrer tous les ViewSets
router.register(r'classlevels', views.ClassLevelViewSet, basename='classlevel')
router.register(r'fields', views.FieldViewSet, basename='field')
router.register(r'axes', views.AxisViewSet, basename='axis')
router.register(r'subjects', views.SubjectViewSet, basename='subject')
router.register(r'requests', views.RequestViewSet, basename='request')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

app_name = 'requests_app'

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
]
