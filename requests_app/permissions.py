from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsStudent(BasePermission):
    """
    Permission pour vérifier si l'utilisateur est un étudiant
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'student_profile')


class IsLecturer(BasePermission):
    """
    Permission pour vérifier si l'utilisateur est un enseignant
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'lecturer_profile')


class IsHOD(BasePermission):
    """
    Permission pour vérifier si l'utilisateur est HOD (Chef de département)
    """
    def has_permission(self, request, view):
        if not hasattr(request.user, 'lecturer_profile'):
            return False
        return request.user.lecturer_profile.is_hod


class IsCellule(BasePermission):
    """
    Permission pour vérifier si l'utilisateur fait partie de la cellule informatique
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name='cellule_informatique').exists() or request.user.is_superuser


class IsSuperAdmin(BasePermission):
    """
    Permission pour super admin uniquement
    """
    def has_permission(self, request, view):
        return request.user.is_superuser or request.user.is_staff


class IsAssignedStaff(BasePermission):
    """
    Permission pour staff assigné à une requête (enseignant ou HOD)
    """
    def has_permission(self, request, view):
        # Permettre si staff (lecturer ou admin)
        return (hasattr(request.user, 'lecturer_profile') or
                request.user.is_superuser)

    def has_object_permission(self, request, view, obj):
        # obj est une Request
        if request.user.is_superuser:
            return True

        # HOD peut voir toutes les requêtes de sa filière
        if hasattr(request.user, 'lecturer_profile'):
            lecturer = request.user.lecturer_profile
            if lecturer.is_hod and lecturer.field == obj.field:
                return True

        # Vérifier si assigné à cette requête
        return obj.assigned_to == request.user


class IsRequestOwnerOrAssigned(BasePermission):
    """
    Permission pour le propriétaire de la requête (étudiant) ou staff assigné
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin peut tout voir
        if request.user.is_superuser:
            return True

        # L'étudiant propriétaire peut voir sa requête
        if hasattr(request.user, 'student_profile'):
            return obj.student.user == request.user

        # Staff assigné peut voir
        if hasattr(request.user, 'lecturer_profile'):
            # HOD peut voir toutes les requêtes de sa filière
            lecturer = request.user.lecturer_profile
            if lecturer.is_hod and lecturer.field == obj.field:
                return True

            # Assigné directement
            if obj.assigned_to == request.user:
                return True

        # Cellule peut voir les requêtes in_cellule
        if request.user.groups.filter(name='cellule_informatique').exists():
            return obj.status == 'in_cellule'

        return False


class CanEditRequest(BasePermission):
    """
    Permission pour modifier une requête (seulement étudiant et si status='sent')
    Ou staff assigné peut mettre à jour current_score
    """
    def has_object_permission(self, request, view, obj):
        # Admin peut toujours modifier
        if request.user.is_superuser:
            return True

        # Staff assigné peut mettre à jour current_score
        if hasattr(request.user, 'lecturer_profile'):
            # HOD peut modifier les requêtes de sa filière
            lecturer = request.user.lecturer_profile
            if lecturer.is_hod and lecturer.field == obj.field:
                # Allow updating current_score only
                if request.method == 'PATCH' and 'current_score' in request.data:
                    return True
            
            # Staff assigné peut mettre à jour current_score
            if obj.assigned_to == request.user:
                # Allow updating current_score only
                if request.method == 'PATCH' and 'current_score' in request.data:
                    return True

        # L'étudiant propriétaire peut modifier si status='sent'
        if hasattr(request.user, 'student_profile'):
            if obj.student.user == request.user:
                return obj.can_edit()

        return False


class CanDeleteRequest(BasePermission):
    """
    Permission pour supprimer une requête (admin ou étudiant si status='sent')
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        # L'étudiant peut supprimer seulement si status='sent'
        if hasattr(request.user, 'student_profile'):
            if obj.student.user == request.user and obj.can_edit():
                return True

        return False


class CanUploadAttachment(BasePermission):
    """
    Permission pour uploader des pièces jointes
    """
    def has_object_permission(self, request, view, obj):
        # obj est une Request

        # Admin peut toujours uploader
        if request.user.is_superuser:
            return True

        # L'étudiant peut uploader sur sa propre requête si status='sent'
        if hasattr(request.user, 'student_profile'):
            if obj.student.user == request.user and obj.can_edit():
                return True

        # Staff assigné peut uploader
        if obj.assigned_to == request.user:
            return True

        # Cellule peut uploader si in_cellule
        if request.user.groups.filter(name='cellule_informatique').exists():
            return obj.status == 'in_cellule'

        return False
