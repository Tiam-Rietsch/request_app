from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_api_auth

# Créer le router DRF
router = DefaultRouter()

# Enregistrer tous les ViewSets
router.register(r'classlevels', views.ClassLevelViewSet, basename='classlevel')
router.register(r'fields', views.FieldViewSet, basename='field')
router.register(r'axes', views.AxisViewSet, basename='axis')
router.register(r'subjects', views.SubjectViewSet, basename='subject')
router.register(r'requests', views.RequestViewSet, basename='request')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # API Authentication endpoints (for Next.js frontend)
    path('api/auth/login/', views_api_auth.api_login, name='api_login'),
    path('api/auth/logout/', views_api_auth.api_logout, name='api_logout'),
    path('api/auth/signup/', views_api_auth.api_signup, name='api_signup'),
    path('api/auth/me/', views_api_auth.api_current_user, name='api_current_user'),
    path('api/auth/csrf/', views_api_auth.get_csrf_token, name='api_csrf_token'),
]
