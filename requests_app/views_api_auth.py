from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from .models import Student, Lecturer
from .serializers import StudentSerializer, LecturerSerializer


def get_user_role(user):
    """Determine user's role"""
    if user.is_superuser:
        return 'admin'
    if hasattr(user, 'student_profile'):
        return 'student'
    if hasattr(user, 'lecturer_profile'):
        lecturer = user.lecturer_profile
        # Keep lecturer/hod role even if cellule_informatique is True
        # The flag is checked separately for IT cell access
        if lecturer.is_hod:
            return 'hod'
        return 'lecturer'
    if user.groups.filter(name='cellule_informatique').exists():
        return 'cellule'
    return 'user'

def has_cellule_access(user):
    """Check if user has access to IT cell (either via group or lecturer flag)"""
    if user.groups.filter(name='cellule_informatique').exists():
        return True
    if hasattr(user, 'lecturer_profile'):
        return user.lecturer_profile.cellule_informatique
    return False


@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    """API endpoint for user login"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'detail': 'Nom d\'utilisateur et mot de passe requis'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        
        # Get user role
        role = get_user_role(user)
        
        # Prepare user data
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role,
        }
        
        # Add profile data
        if hasattr(user, 'student_profile'):
            user_data['student_profile'] = {
                'id': user.student_profile.id,
                'matricule': user.student_profile.matricule,
                'class_level': user.student_profile.class_level.id,
                'class_level_name': user.student_profile.class_level.name,
                'field': user.student_profile.field.id if user.student_profile.field else None,
                'field_name': user.student_profile.field.name if user.student_profile.field else None,
            }
        elif hasattr(user, 'lecturer_profile'):
            lecturer = user.lecturer_profile
            user_data['lecturer_profile'] = {
                'id': lecturer.id,
                'is_hod': lecturer.is_hod,
                'cellule_informatique': lecturer.cellule_informatique,  # Add this field!
                'field': lecturer.field.id if lecturer.field else None,
                'field_name': lecturer.field.name if lecturer.field else None,
            }
        
        return Response(user_data, status=status.HTTP_200_OK)
    else:
        return Response(
            {'detail': 'Nom d\'utilisateur ou mot de passe incorrect'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    """API endpoint for user logout"""
    logout(request)
    return Response({'detail': 'Déconnexion réussie'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_signup(request):
    """API endpoint for student registration"""
    try:
        with transaction.atomic():
            # Validate required fields
            required_fields = ['first_name', 'last_name', 'matricule', 'class_level', 'password']
            for field in required_fields:
                if field not in request.data or not request.data[field]:
                    return Response(
                        {'detail': f'Le champ {field} est requis'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            matricule = request.data['matricule']
            
            # Check if user already exists
            if User.objects.filter(username=matricule).exists():
                return Response(
                    {'detail': 'Un utilisateur avec ce matricule existe déjà'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create user
            user = User.objects.create_user(
                username=matricule,
                first_name=request.data['first_name'],
                last_name=request.data['last_name'],
                password=request.data['password']
            )

            # Create student profile
            Student.objects.create(
                user=user,
                matricule=matricule,
                class_level_id=request.data['class_level'],
                field_id=request.data.get('field')
            )

            # Auto-login
            login(request, user)

            return Response(
                {
                    'detail': 'Inscription réussie',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': 'student'
                    }
                },
                status=status.HTTP_201_CREATED
            )

    except Exception as e:
        return Response(
            {'detail': f'Erreur lors de l\'inscription: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_current_user(request):
    """Get current authenticated user's information"""
    user = request.user
    role = get_user_role(user)
    
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': role,
    }
    
    # Add profile data
    if hasattr(user, 'student_profile'):
        student = user.student_profile
        user_data['student_profile'] = {
            'id': student.id,
            'matricule': student.matricule,
            'class_level': student.class_level.id,
            'class_level_name': student.class_level.name,
            'field': student.field.id if student.field else None,
            'field_name': student.field.name if student.field else None,
        }
    elif hasattr(user, 'lecturer_profile'):
        lecturer = user.lecturer_profile
        user_data['lecturer_profile'] = {
            'id': lecturer.id,
            'is_hod': lecturer.is_hod,
            'field': lecturer.field.id if lecturer.field else None,
            'field_name': lecturer.field.name if lecturer.field else None,
        }
    
    return Response(user_data, status=status.HTTP_200_OK)

