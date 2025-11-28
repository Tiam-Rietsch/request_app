from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    ClassLevel, Field, Axis, Subject, Lecturer, Student,
    Request, RequestResult, Attachment, AuditLog, Notification
)


class LecturerInline(admin.StackedInline):
    model = Lecturer
    can_delete = False
    verbose_name_plural = 'Profil Enseignant'


class StudentInline(admin.StackedInline):
    model = Student
    can_delete = False
    verbose_name_plural = 'Profil Étudiant'


class UserAdmin(BaseUserAdmin):
    inlines = (LecturerInline, StudentInline)


@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = ['name', 'order']
    list_editable = ['order']
    ordering = ['order']


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ['code', 'name']
    search_fields = ['code', 'name']
    filter_horizontal = ['allowed_levels']


@admin.register(Axis)
class AxisAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'field']
    list_filter = ['field']
    search_fields = ['code', 'name']


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'field']
    list_filter = ['field']
    search_fields = ['code', 'name']
    filter_horizontal = ['class_levels']


@admin.register(Lecturer)
class LecturerAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_hod', 'field']
    list_filter = ['is_hod', 'field']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']
    filter_horizontal = ['subjects']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'user', 'class_level', 'field']
    list_filter = ['class_level', 'field']
    search_fields = ['matricule', 'user__username', 'user__first_name', 'user__last_name']


class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0
    readonly_fields = ['uploaded_by', 'uploaded_at', 'filename', 'mime_type', 'size']


class AuditLogInline(admin.TabularInline):
    model = AuditLog
    extra = 0
    readonly_fields = ['action', 'from_status', 'to_status', 'actor', 'timestamp', 'note']
    can_delete = False


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'student_name', 'matricule', 'subject', 'type', 'status', 'submitted_at', 'assigned_to']
    list_filter = ['status', 'type', 'class_level', 'field', 'submitted_at']
    search_fields = ['id', 'matricule', 'student_name', 'subject__name']
    readonly_fields = ['id', 'student', 'matricule', 'student_name', 'submitted_at']
    inlines = [AttachmentInline, AuditLogInline]

    fieldsets = (
        ('Informations étudiant', {
            'fields': ('student', 'matricule', 'student_name')
        }),
        ('Détails de la requête', {
            'fields': ('class_level', 'field', 'axis', 'subject', 'type', 'description')
        }),
        ('Gestion', {
            'fields': ('status', 'assigned_to', 'closed_at')
        }),
        ('Métadonnées', {
            'fields': ('id', 'submitted_at')
        }),
    )


@admin.register(RequestResult)
class RequestResultAdmin(admin.ModelAdmin):
    list_display = ['request', 'status', 'new_score', 'created_by', 'created_at']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at']


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['filename', 'request', 'uploaded_by', 'mime_type', 'size', 'uploaded_at']
    list_filter = ['uploaded_at', 'mime_type']
    readonly_fields = ['uploaded_at']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['request', 'action', 'from_status', 'to_status', 'actor', 'timestamp']
    list_filter = ['action', 'timestamp']
    readonly_fields = ['request', 'action', 'from_status', 'to_status', 'actor', 'timestamp', 'note']
    search_fields = ['request__id', 'request__matricule']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'read', 'created_at']
    list_filter = ['read', 'created_at']
    search_fields = ['title', 'body', 'user__username']
    readonly_fields = ['created_at']


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Customize admin site
admin.site.site_header = "Administration - Système de Gestion de Requêtes"
admin.site.site_title = "Admin Requêtes"
admin.site.index_title = "Bienvenue dans l'administration"
