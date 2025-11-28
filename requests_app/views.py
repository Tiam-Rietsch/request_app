from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import render, get_object_or_404
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import (
    ClassLevel, Field, Axis, Subject, Lecturer, Student,
    Request, RequestResult, Attachment, AuditLog, Notification
)
from .serializers import (
    ClassLevelSerializer, FieldSerializer, AxisSerializer, SubjectSerializer,
    LecturerSerializer, StudentSerializer, RequestSerializer,
    RequestResultSerializer, AttachmentSerializer, AuditLogSerializer,
    NotificationSerializer, DecisionSerializer, CompleteSerializer
)
from .permissions import (
    IsStudent, IsLecturer, IsHOD, IsCellule, IsSuperAdmin,
    IsAssignedStaff, IsRequestOwnerOrAssigned, CanEditRequest,
    CanDeleteRequest, CanUploadAttachment
)


@extend_schema_view(
    list=extend_schema(description="Liste des niveaux"),
    retrieve=extend_schema(description="Détails d'un niveau"),
    create=extend_schema(description="Créer un niveau (Admin uniquement)"),
    update=extend_schema(description="Modifier un niveau (Admin uniquement)"),
    destroy=extend_schema(description="Supprimer un niveau (Admin uniquement)"),
)
class ClassLevelViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les niveaux (L1, L2, L3, etc.)
    """
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        elif self.action in ['list', 'retrieve']:
            # Allow unauthenticated access for signup
            return [AllowAny()]
        return [IsAuthenticated()]


@extend_schema_view(
    list=extend_schema(
        description="Liste des filières",
        parameters=[
            OpenApiParameter(name='level_id', description='Filtrer par niveau', required=False, type=OpenApiTypes.INT),
        ]
    ),
    retrieve=extend_schema(description="Détails d'une filière"),
    create=extend_schema(description="Créer une filière (Admin uniquement)"),
    update=extend_schema(description="Modifier une filière (Admin uniquement)"),
    destroy=extend_schema(description="Supprimer une filière (Admin uniquement)"),
)
class FieldViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les filières
    """
    queryset = Field.objects.all()
    serializer_class = FieldSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = Field.objects.all()
        level_id = self.request.query_params.get('level_id')
        if level_id:
            queryset = queryset.filter(allowed_levels__id=level_id)
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        elif self.action in ['list', 'retrieve']:
            # Allow unauthenticated access for signup
            return [AllowAny()]
        return [IsAuthenticated()]


@extend_schema_view(
    list=extend_schema(
        description="Liste des axes",
        parameters=[
            OpenApiParameter(name='field_id', description='Filtrer par filière', required=False, type=OpenApiTypes.INT),
        ]
    ),
    retrieve=extend_schema(description="Détails d'un axe"),
    create=extend_schema(description="Créer un axe (Admin uniquement)"),
    update=extend_schema(description="Modifier un axe (Admin uniquement)"),
    destroy=extend_schema(description="Supprimer un axe (Admin uniquement)"),
)
class AxisViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les axes
    """
    queryset = Axis.objects.all()
    serializer_class = AxisSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['field']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [IsAuthenticated()]


@extend_schema_view(
    list=extend_schema(
        description="Liste des matières",
        parameters=[
            OpenApiParameter(name='field_id', description='Filtrer par filière', required=False, type=OpenApiTypes.INT),
            OpenApiParameter(name='level_id', description='Filtrer par niveau', required=False, type=OpenApiTypes.INT),
        ]
    ),
    retrieve=extend_schema(description="Détails d'une matière"),
    create=extend_schema(description="Créer une matière (Admin uniquement)"),
    update=extend_schema(description="Modifier une matière (Admin uniquement)"),
    destroy=extend_schema(description="Supprimer une matière (Admin uniquement)"),
)
class SubjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les matières
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['field']

    def get_queryset(self):
        queryset = Subject.objects.all()
        field_id = self.request.query_params.get('field_id')
        level_id = self.request.query_params.get('level_id')

        if field_id:
            queryset = queryset.filter(field_id=field_id)
        if level_id:
            queryset = queryset.filter(class_levels__id=level_id)

        return queryset.distinct()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [IsAuthenticated()]


@extend_schema_view(
    list=extend_schema(
        description="Liste des requêtes (filtrée selon le rôle)",
        parameters=[
            OpenApiParameter(name='status', description='Filtrer par statut', required=False, type=OpenApiTypes.STR),
            OpenApiParameter(name='type', description='Filtrer par type (cc/exam)', required=False, type=OpenApiTypes.STR),
        ]
    ),
    retrieve=extend_schema(description="Détails d'une requête"),
    create=extend_schema(description="Créer une requête (Étudiant uniquement)"),
    update=extend_schema(description="Modifier une requête (Étudiant, si status='sent')"),
    destroy=extend_schema(description="Supprimer une requête"),
)
class RequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les requêtes de contestation
    """
    queryset = Request.objects.all().select_related(
        'student', 'student__user', 'class_level', 'field', 'axis', 'subject', 'assigned_to'
    ).prefetch_related('attachments', 'logs')
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type', 'field', 'class_level']
    search_fields = ['matricule', 'student_name', 'subject__name', 'description']
    ordering_fields = ['submitted_at', 'status']
    ordering = ['-submitted_at']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # Étudiant: voir seulement ses requêtes
        if hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)

        # Cellule: voir seulement les requêtes in_cellule
        if user.groups.filter(name='cellule_informatique').exists():
            return queryset.filter(status='in_cellule')

        # Enseignant/HOD: voir les requêtes assignées ou de sa filière
        if hasattr(user, 'lecturer_profile'):
            lecturer = user.lecturer_profile
            if lecturer.is_hod and lecturer.field:
                # HOD voit toutes les requêtes de sa filière
                return queryset.filter(field=lecturer.field)
            else:
                # Enseignant voit ses requêtes assignées
                return queryset.filter(assigned_to=user)

        # Admin: voir tout
        if user.is_superuser:
            return queryset

        return queryset.none()

    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        elif self.action in ['update', 'partial_update']:
            return [CanEditRequest()]
        elif self.action == 'destroy':
            return [CanDeleteRequest()]
        elif self.action in ['acknowledge', 'decision', 'send_to_cellule', 'complete']:
            return [IsAssignedStaff()]
        elif self.action == 'return_from_cellule':
            return [IsCellule()]
        elif self.action == 'upload_attachment':
            return [CanUploadAttachment()]
        else:
            return [IsRequestOwnerOrAssigned()]

    @extend_schema(
        description="Marquer la requête comme reçue (enseignant/HOD)",
        request=None,
        responses={200: RequestSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAssignedStaff])
    def acknowledge(self, request, pk=None):
        """
        Transition: sent -> received
        """
        req = self.get_object()

        if req.status != 'sent':
            return Response(
                {'detail': f'Cette action n\'est pas possible pour une requête au statut "{req.get_status_display()}"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = req.status
        req.status = 'received'
        req.save()

        # Log d'audit
        AuditLog.objects.create(
            request=req,
            action='acknowledge',
            from_status=old_status,
            to_status=req.status,
            actor=request.user,
            note="Requête prise en charge"
        )

        # Notification à l'étudiant
        Notification.objects.create(
            user=req.student.user,
            title="Requête reçue",
            body=f"Votre requête pour {req.subject.name} a été prise en charge",
            link=f"/requests/{req.id}/"
        )

        serializer = self.get_serializer(req)
        return Response(serializer.data)

    @extend_schema(
        description="Prendre une décision initiale (approved/rejected)",
        request=DecisionSerializer,
        responses={200: RequestSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAssignedStaff])
    def decision(self, request, pk=None):
        """
        Transition: received -> approved OR received -> rejected -> done
        """
        req = self.get_object()

        if req.status not in ['received', 'sent']:
            return Response(
                {'detail': f'Cette action n\'est pas possible pour une requête au statut "{req.get_status_display()}"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        decision = serializer.validated_data['decision']
        reason = serializer.validated_data.get('reason', '')

        with transaction.atomic():
            old_status = req.status

            if decision == 'rejected':
                # Rejeter immédiatement et terminer
                req.status = 'done'
                req.closed_at = timezone.now()
                req.save()

                # Créer le résultat
                RequestResult.objects.create(
                    request=req,
                    status='rejected',
                    reason=reason,
                    created_by=request.user
                )

                # Log
                AuditLog.objects.create(
                    request=req,
                    action='decision_rejected',
                    from_status=old_status,
                    to_status='done',
                    actor=request.user,
                    note=f"Requête rejetée: {reason}"
                )

                # Notification à l'étudiant
                Notification.objects.create(
                    user=req.student.user,
                    title="Requête rejetée",
                    body=f"Votre requête pour {req.subject.name} a été rejetée. Raison: {reason}",
                    link=f"/requests/{req.id}/"
                )

            else:  # approved
                req.status = 'approved'
                req.save()

                # Log
                AuditLog.objects.create(
                    request=req,
                    action='decision_approved',
                    from_status=old_status,
                    to_status='approved',
                    actor=request.user,
                    note="Requête approuvée pour traitement"
                )

                # Notification à l'étudiant
                Notification.objects.create(
                    user=req.student.user,
                    title="Requête approuvée",
                    body=f"Votre requête pour {req.subject.name} a été approuvée et sera traitée",
                    link=f"/requests/{req.id}/"
                )

        result_serializer = self.get_serializer(req)
        return Response(result_serializer.data)

    @extend_schema(
        description="Envoyer la requête à la cellule informatique",
        request=None,
        responses={200: RequestSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAssignedStaff])
    def send_to_cellule(self, request, pk=None):
        """
        Transition: approved -> in_cellule
        """
        req = self.get_object()

        if req.status != 'approved':
            return Response(
                {'detail': f'Cette action n\'est pas possible pour une requête au statut "{req.get_status_display()}"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = req.status
        req.status = 'in_cellule'
        req.save()

        # Log
        AuditLog.objects.create(
            request=req,
            action='send_to_cellule',
            from_status=old_status,
            to_status='in_cellule',
            actor=request.user,
            note="Requête envoyée à la cellule informatique"
        )

        # Notification à la cellule (tous les membres du groupe)
        from django.contrib.auth.models import Group
        try:
            cellule_group = Group.objects.get(name='cellule_informatique')
            for user in cellule_group.user_set.all():
                Notification.objects.create(
                    user=user,
                    title="Nouvelle requête en cellule",
                    body=f"Requête de {req.student_name} pour {req.subject.name}",
                    link=f"/requests/{req.id}/"
                )
        except Group.DoesNotExist:
            pass

        serializer = self.get_serializer(req)
        return Response(serializer.data)

    @extend_schema(
        description="Retourner la requête de la cellule informatique",
        request=None,
        responses={200: RequestSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[IsCellule])
    def return_from_cellule(self, request, pk=None):
        """
        Transition: in_cellule -> returned
        """
        req = self.get_object()

        if req.status != 'in_cellule':
            return Response(
                {'detail': f'Cette action n\'est pas possible pour une requête au statut "{req.get_status_display()}"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = req.status
        req.status = 'returned'
        req.save()

        # Log
        AuditLog.objects.create(
            request=req,
            action='return_from_cellule',
            from_status=old_status,
            to_status='returned',
            actor=request.user,
            note="Requête retournée par la cellule informatique"
        )

        # Notification à l'assigné
        if req.assigned_to:
            Notification.objects.create(
                user=req.assigned_to,
                title="Requête retournée de la cellule",
                body=f"Requête de {req.student_name} pour {req.subject.name} prête pour finalisation",
                link=f"/requests/{req.id}/"
            )

        serializer = self.get_serializer(req)
        return Response(serializer.data)

    @extend_schema(
        description="Finaliser la requête avec résultat final",
        request=CompleteSerializer,
        responses={200: RequestSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAssignedStaff])
    def complete(self, request, pk=None):
        """
        Transition: returned -> done (ou approved -> done si pas de cellule)
        """
        req = self.get_object()

        if req.status not in ['returned', 'approved']:
            return Response(
                {'detail': f'Cette action n\'est pas possible pour une requête au statut "{req.get_status_display()}"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            old_status = req.status

            # Créer le résultat
            result = RequestResult.objects.create(
                request=req,
                status=serializer.validated_data['status'],
                new_score=serializer.validated_data.get('new_score'),
                reason=serializer.validated_data.get('reason', ''),
                created_by=request.user
            )

            # Mettre à jour la requête
            req.status = 'done'
            req.closed_at = timezone.now()
            req.save()

            # Log
            AuditLog.objects.create(
                request=req,
                action='complete',
                from_status=old_status,
                to_status='done',
                actor=request.user,
                note=f"Requête finalisée: {result.get_status_display()}"
            )

            # Notification à l'étudiant
            Notification.objects.create(
                user=req.student.user,
                title="Requête finalisée",
                body=f"Votre requête pour {req.subject.name} a été finalisée: {result.get_status_display()}",
                link=f"/requests/{req.id}/"
            )

        result_serializer = self.get_serializer(req)
        return Response(result_serializer.data)

    @extend_schema(
        description="Uploader une pièce jointe",
        request={'multipart/form-data': {'type': 'object', 'properties': {'file': {'type': 'string', 'format': 'binary'}}}},
        responses={201: AttachmentSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[CanUploadAttachment])
    def upload_attachment(self, request, pk=None):
        """
        Upload une pièce jointe pour cette requête
        """
        req = self.get_object()

        if 'file' not in request.FILES:
            return Response(
                {'detail': 'Aucun fichier fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_file = request.FILES['file']

        # Validation de taille
        from django.conf import settings
        if uploaded_file.size > settings.MAX_UPLOAD_SIZE:
            return Response(
                {'detail': f'Fichier trop volumineux. Taille max: {settings.MAX_UPLOAD_SIZE / (1024*1024)} MB'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validation de type MIME
        import magic
        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(uploaded_file.read(1024))
        uploaded_file.seek(0)

        if mime_type not in settings.ALLOWED_FILE_TYPES:
            return Response(
                {'detail': f'Type de fichier non autorisé: {mime_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Créer l'attachment
        attachment = Attachment.objects.create(
            request=req,
            uploaded_by=request.user,
            file=uploaded_file,
            filename=uploaded_file.name,
            mime_type=mime_type,
            size=uploaded_file.size
        )

        # Log
        AuditLog.objects.create(
            request=req,
            action='upload_attachment',
            actor=request.user,
            note=f"Pièce jointe ajoutée: {uploaded_file.name}"
        )

        serializer = AttachmentSerializer(attachment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        description="Voir la page imprimable de la requête",
        responses={200: {'type': 'string', 'format': 'html'}}
    )
    @action(detail=True, methods=['get'], permission_classes=[IsRequestOwnerOrAssigned])
    def print(self, request, pk=None):
        """
        Retourne une page HTML stylée pour impression
        """
        from .utils import generate_qr_code
        
        req = self.get_object()
        qr_code = generate_qr_code(req, request)
        
        return render(request, 'requests_app/print_request.html', {
            'request': req,
            'today': timezone.now(),
            'qr_code': qr_code
        })


@extend_schema_view(
    list=extend_schema(description="Liste des notifications de l'utilisateur connecté"),
    retrieve=extend_schema(description="Détails d'une notification"),
    update=extend_schema(description="Modifier une notification"),
    destroy=extend_schema(description="Supprimer une notification"),
)
class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @extend_schema(
        description="Marquer la notification comme lue",
        request=None,
        responses={200: NotificationSerializer}
    )
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @extend_schema(
        description="Nombre de notifications non lues",
        responses={200: {'type': 'object', 'properties': {'unread_count': {'type': 'integer'}}}}
    )
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, read=False).count()
        return Response({'unread_count': count})
