from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_auth
from . import views_student
from . import views_staff
from . import views_cellule
from . import views_public

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

    # Authentication
    path('', views_auth.home_view, name='home'),
    path('signup/', views_auth.signup_view, name='signup'),
    path('login/', views_auth.login_view, name='login'),
    path('logout/', views_auth.logout_view, name='logout'),

    # Student URLs
    path('student/dashboard/', views_student.student_dashboard, name='student_dashboard'),
    path('student/requests/', views_student.student_requests_list, name='student_requests'),
    path('student/requests/create/', views_student.student_create_request, name='student_create_request'),
    path('student/requests/<uuid:uuid>/', views_student.student_request_detail, name='student_request_detail'),

    # Staff URLs
    path('staff/dashboard/', views_staff.staff_dashboard, name='staff_dashboard'),
    path('staff/requests/', views_staff.staff_requests_list, name='staff_requests'),
    path('staff/requests/<uuid:uuid>/', views_staff.staff_request_detail, name='staff_request_detail'),
    path('staff/requests/<uuid:uuid>/acknowledge/', views_staff.staff_acknowledge_request, name='staff_acknowledge'),
    path('staff/requests/<uuid:uuid>/decision/', views_staff.staff_decision_request, name='staff_decision'),
    path('staff/requests/<uuid:uuid>/send-to-cellule/', views_staff.staff_send_to_cellule, name='staff_send_cellule'),
    path('staff/requests/<uuid:uuid>/complete/', views_staff.staff_complete_request, name='staff_complete'),

    # Cellule URLs
    path('cellule/dashboard/', views_cellule.cellule_dashboard, name='cellule_dashboard'),
    path('cellule/requests/', views_cellule.cellule_requests_list, name='cellule_requests'),
    path('cellule/requests/<uuid:uuid>/', views_cellule.cellule_request_detail, name='cellule_request_detail'),
    path('cellule/requests/<uuid:uuid>/return/', views_cellule.cellule_return_request, name='cellule_return'),

    # Admin URLs (to be created)
    # path('admin-custom/dashboard/', views_admin.admin_dashboard, name='admin_dashboard'),

    # Public URLs
    path('public/request/<uuid:uuid>/', views_public.public_request_view, name='public_request_view'),
]
