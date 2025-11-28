from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    ClassLevel, Field, Axis, Subject, Lecturer, Student,
    Request, RequestResult, Attachment, AuditLog, Notification
)


class ClassLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassLevel
        fields = ['id', 'name', 'order']


class FieldSerializer(serializers.ModelSerializer):
    allowed_levels = ClassLevelSerializer(many=True, read_only=True)
    allowed_level_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=ClassLevel.objects.all(),
        source='allowed_levels'
    )

    class Meta:
        model = Field
        fields = ['id', 'code', 'name', 'allowed_levels', 'allowed_level_ids']


class AxisSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source='field.name', read_only=True)

    class Meta:
        model = Axis
        fields = ['id', 'code', 'name', 'field', 'field_name']


class SubjectSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source='field.name', read_only=True)
    class_levels = ClassLevelSerializer(many=True, read_only=True)
    class_level_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=ClassLevel.objects.all(),
        source='class_levels'
    )

    class Meta:
        model = Subject
        fields = ['id', 'code', 'name', 'field', 'field_name', 'class_levels', 'class_level_ids']


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class LecturerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = Lecturer
        fields = ['id', 'user', 'subjects', 'is_hod', 'field', 'cellule_informatique']


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class_level_name = serializers.CharField(source='class_level.name', read_only=True)
    field_name = serializers.CharField(source='field.name', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user', 'matricule', 'class_level', 'class_level_name', 'field', 'field_name']


class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'filename', 'file', 'mime_type', 'size', 'uploaded_at', 'uploaded_by', 'uploaded_by_name']
        read_only_fields = ['uploaded_by', 'uploaded_at', 'filename', 'mime_type', 'size']

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name() or obj.uploaded_by.username
        return None


class RequestResultSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = RequestResult
        fields = ['id', 'status', 'status_display', 'new_score', 'reason', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_by', 'created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'from_status', 'to_status', 'actor', 'actor_name', 'timestamp', 'note']
        read_only_fields = ['actor', 'timestamp']

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.username
        return None


class RequestSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    result = RequestResultSerializer(read_only=True)
    logs = AuditLogSerializer(many=True, read_only=True)

    # Display fields
    student_display = serializers.SerializerMethodField()
    class_level_display = serializers.CharField(source='class_level.name', read_only=True)
    field_display = serializers.CharField(source='field.name', read_only=True)
    axis_display = serializers.CharField(source='axis.name', read_only=True, allow_null=True)
    subject_display = serializers.CharField(source='subject.name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Request
        fields = [
            'id', 'student', 'student_display', 'matricule', 'student_name',
            'submitted_at', 'class_level', 'class_level_display',
            'field', 'field_display', 'axis', 'axis_display',
            'subject', 'subject_display', 'type', 'type_display',
            'description', 'current_score', 'assigned_to', 'assigned_to_name',
            'status', 'status_display', 'closed_at', 'can_edit',
            'attachments', 'result', 'logs'
        ]
        read_only_fields = ['id', 'student', 'matricule', 'student_name', 'submitted_at', 'status', 'closed_at']

    def get_student_display(self, obj):
        return str(obj.student)

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None

    def get_can_edit(self, obj):
        return obj.can_edit()

    def create(self, validated_data):
        user = self.context['request'].user

        # Vérifier que l'utilisateur est un étudiant
        try:
            student = user.student_profile
        except:
            raise serializers.ValidationError("Utilisateur non étudiant")

        # Remplir automatiquement les champs étudiant
        validated_data['student'] = student
        validated_data['matricule'] = student.matricule
        validated_data['student_name'] = user.get_full_name() or user.username

        # Créer la requête
        request_obj = super().create(validated_data)

        # Auto-assignation selon le type
        if request_obj.type == 'cc':
            # Assigner au premier enseignant de la matière
            lecturers = request_obj.subject.lecturers.all()
            if lecturers.exists():
                request_obj.assigned_to = lecturers.first().user
        else:  # exam
            # Assigner au HOD de la filière
            hods = Lecturer.objects.filter(is_hod=True, field=request_obj.field)
            if hods.exists():
                request_obj.assigned_to = hods.first().user

        request_obj.save()

        # Créer le log d'audit
        AuditLog.objects.create(
            request=request_obj,
            action='create',
            to_status=request_obj.status,
            actor=user,
            note="Requête créée"
        )

        # Créer une notification pour l'assigné
        if request_obj.assigned_to:
            Notification.objects.create(
                user=request_obj.assigned_to,
                title="Nouvelle requête assignée",
                body=f"Nouvelle requête de {request_obj.student_name} pour {request_obj.subject.name}",
                link=f"/api/requests/{request_obj.id}/"
            )

        return request_obj


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'link', 'read', 'created_at']
        read_only_fields = ['created_at']


class DecisionSerializer(serializers.Serializer):
    """Serializer pour la décision initiale (approved/rejected)"""
    decision = serializers.ChoiceField(choices=['approved', 'rejected'])
    reason = serializers.CharField(required=False, allow_blank=True)
    new_score = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)


class CompleteSerializer(serializers.Serializer):
    """Serializer pour la finalisation de la requête"""
    status = serializers.ChoiceField(choices=['accepted', 'rejected'])
    new_score = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)
    reason = serializers.CharField(required=False, allow_blank=True)
