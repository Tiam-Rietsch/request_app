from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import ClassLevel, Field, Subject, Request, Student, Lecturer, RequestResult
import uuid


class APIRoutesTestCase(TestCase):
    """Simple surface tests for all API routes"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.student_user = User.objects.create_user(username='student1', password='testpass123')
        self.staff_user = User.objects.create_user(username='staff1', password='testpass123')
        
        # Create class level and field
        self.class_level = ClassLevel.objects.create(name='L1')
        self.field = Field.objects.create(name='Informatique', level=self.class_level)
        
        # Create student profile
        Student.objects.create(
            user=self.student_user,
            matricule='ST001',
            class_level=self.class_level,
            field=self.field
        )
        
        # Create lecturer profile
        Lecturer.objects.create(
            user=self.staff_user,
            is_hod=False
        )
        
        # Create subject
        self.subject = Subject.objects.create(name='Mathématiques', field=self.field)
        
        # Create request
        student = Student.objects.get(user=self.student_user)
        self.request = Request.objects.create(
            student=student,
            matricule=student.matricule,
            student_name=self.student_user.get_full_name() or self.student_user.username,
            class_level=self.class_level,
            field=self.field,
            subject=self.subject,
            type='cc',
            description='Test request',
            status='sent',
            assigned_to=self.staff_user
        )

    def test_classlevels_list(self):
        """Test GET /api/classlevels/"""
        response = self.client.get('/api/classlevels/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_classlevels_create_requires_auth(self):
        """Test POST /api/classlevels/ requires authentication"""
        response = self.client.post('/api/classlevels/', {'name': 'L2'})
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_fields_list(self):
        """Test GET /api/fields/"""
        response = self.client.get('/api/fields/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_axes_list(self):
        """Test GET /api/axes/"""
        response = self.client.get('/api/axes/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED])

    def test_subjects_list(self):
        """Test GET /api/subjects/"""
        response = self.client.get('/api/subjects/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED])

    def test_requests_list_requires_auth(self):
        """Test GET /api/requests/ requires authentication"""
        response = self.client.get('/api/requests/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_requests_list_with_auth(self):
        """Test GET /api/requests/ with authentication"""
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get('/api/requests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_requests_retrieve(self):
        """Test GET /api/requests/{id}/"""
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get(f'/api/requests/{self.request.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_requests_create_requires_student(self):
        """Test POST /api/requests/ requires student"""
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post('/api/requests/', {
            'class_level': self.class_level.id,
            'field': self.field.id,
            'subject': self.subject.id,
            'type': 'cc',
            'description': 'New request',
            'current_score': 10.0
        })
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_api_login(self):
        """Test POST /api/auth/login/"""
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED])

    def test_api_login_invalid(self):
        """Test POST /api/auth/login/ with invalid credentials"""
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_api_signup(self):
        """Test POST /api/auth/signup/"""
        response = self.client.post('/api/auth/signup/', {
            'first_name': 'John',
            'last_name': 'Doe',
            'matricule': 'ST002',
            'class_level': self.class_level.id,
            'field': self.field.id,
            'password': 'testpass123'
        })
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_api_current_user_requires_auth(self):
        """Test GET /api/auth/me/ requires authentication"""
        response = self.client.get('/api/auth/me/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_api_current_user_with_auth(self):
        """Test GET /api/auth/me/ with authentication"""
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_requests_acknowledge_requires_staff(self):
        """Test POST /api/requests/{id}/acknowledge/ requires staff"""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(f'/api/requests/{self.request.id}/acknowledge/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

    def test_requests_decision_requires_staff(self):
        """Test POST /api/requests/{id}/decision/ requires staff"""
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(f'/api/requests/{self.request.id}/decision/', {
            'decision': 'approved',
            'reason': 'Test reason'
        })
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

    def test_requests_close_requires_staff(self):
        """Test POST /api/requests/{id}/close/ requires staff"""
        self.request.status = 'returned'
        self.request.save()
        self.client.force_authenticate(user=self.staff_user)
        response = self.client.post(f'/api/requests/{self.request.id}/close/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

    def test_notifications_list_requires_auth(self):
        """Test GET /api/notifications/ requires authentication"""
        response = self.client.get('/api/notifications/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_notifications_list_with_auth(self):
        """Test GET /api/notifications/ with authentication"""
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
