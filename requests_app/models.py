import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class ClassLevel(models.Model):
    """Modèle pour les niveaux (L1, L2, L3, etc.)"""
    name = models.CharField(max_length=50, verbose_name="Nom")
    order = models.PositiveSmallIntegerField(verbose_name="Ordre")

    class Meta:
        ordering = ['order']
        verbose_name = "Niveau"
        verbose_name_plural = "Niveaux"

    def __str__(self):
        return self.name


class Field(models.Model):
    """Modèle pour les filières (GL, GI, etc.)"""
    code = models.CharField(max_length=10, unique=True, verbose_name="Code")
    name = models.CharField(max_length=100, verbose_name="Nom")
    allowed_levels = models.ManyToManyField(
        ClassLevel,
        related_name='fields',
        verbose_name="Niveaux autorisés"
    )

    class Meta:
        verbose_name = "Filière"
        verbose_name_plural = "Filières"

    def __str__(self):
        return f"{self.code} - {self.name}"


class Axis(models.Model):
    """Modèle pour les axes (sous-divisions de filières)"""
    code = models.CharField(max_length=10, verbose_name="Code")
    name = models.CharField(max_length=100, verbose_name="Nom")
    field = models.ForeignKey(
        Field,
        on_delete=models.CASCADE,
        related_name='axes',
        verbose_name="Filière"
    )

    class Meta:
        verbose_name = "Axe"
        verbose_name_plural = "Axes"
        unique_together = [['field', 'code']]

    def __str__(self):
        return f"{self.field.code}:{self.code} - {self.name}"


class Subject(models.Model):
    """Modèle pour les matières"""
    code = models.CharField(max_length=30, blank=True, verbose_name="Code")
    name = models.CharField(max_length=200, verbose_name="Nom")
    field = models.ForeignKey(
        Field,
        on_delete=models.CASCADE,
        related_name='subjects',
        verbose_name="Filière"
    )
    class_levels = models.ManyToManyField(
        ClassLevel,
        related_name='subjects',
        verbose_name="Niveaux"
    )

    class Meta:
        verbose_name = "Matière"
        verbose_name_plural = "Matières"

    def __str__(self):
        return self.name


class Lecturer(models.Model):
    """Modèle pour le profil enseignant"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='lecturer_profile',
        verbose_name="Utilisateur"
    )
    subjects = models.ManyToManyField(
        Subject,
        related_name='lecturers',
        verbose_name="Matières enseignées",
        blank=True
    )
    is_hod = models.BooleanField(
        default=False,
        verbose_name="Chef de département"
    )
    field = models.ForeignKey(
        Field,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='lecturers',
        verbose_name="Filière (si HOD)"
    )
    cellule_informatique = models.BooleanField(
        default=False,
        verbose_name="Membre de la cellule informatique"
    )

    class Meta:
        verbose_name = "Enseignant"
        verbose_name_plural = "Enseignants"

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"


class Student(models.Model):
    """Modèle pour le profil étudiant"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile',
        verbose_name="Utilisateur"
    )
    matricule = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Matricule"
    )
    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.PROTECT,
        verbose_name="Niveau"
    )
    field = models.ForeignKey(
        Field,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name="Filière"
    )

    class Meta:
        verbose_name = "Étudiant"
        verbose_name_plural = "Étudiants"

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.matricule})"


class Request(models.Model):
    """Modèle pour les requêtes de contestation"""
    TYPE_CHOICES = [
        ('cc', 'CC (Contrôle Continu)'),
        ('exam', 'EXAM (Examen)')
    ]

    STATUS_CHOICES = [
        ('sent', 'Envoyée'),
        ('received', 'Reçue'),
        ('approved', 'Approuvée'),
        ('rejected', 'Rejetée'),
        ('in_cellule', 'En cellule informatique'),
        ('returned', 'Retournée'),
        ('done', 'Terminée'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='requests',
        verbose_name="Étudiant"
    )
    matricule = models.CharField(
        max_length=50,
        verbose_name="Matricule"
    )
    student_name = models.CharField(
        max_length=200,
        verbose_name="Nom de l'étudiant"
    )
    submitted_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de soumission"
    )
    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.PROTECT,
        verbose_name="Niveau"
    )
    field = models.ForeignKey(
        Field,
        on_delete=models.PROTECT,
        verbose_name="Filière"
    )
    axis = models.ForeignKey(
        Axis,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name="Axe"
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        verbose_name="Matière"
    )
    type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        verbose_name="Type"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    current_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name="Note actuelle"
    )
    assigned_to = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_requests',
        verbose_name="Assignée à"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='sent',
        verbose_name="Statut"
    )
    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de clôture"
    )

    class Meta:
        verbose_name = "Requête"
        verbose_name_plural = "Requêtes"
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Requête {self.id} - {self.subject.name} - {self.matricule}"

    def can_edit(self):
        """Vérifie si la requête peut être modifiée"""
        return self.status == 'sent'


class RequestResult(models.Model):
    """Modèle pour le résultat final d'une requête"""
    RESULT_CHOICES = [
        ('accepted', 'Acceptée'),
        ('rejected', 'Rejetée')
    ]

    request = models.OneToOneField(
        Request,
        on_delete=models.CASCADE,
        related_name='result',
        verbose_name="Requête"
    )
    status = models.CharField(
        max_length=10,
        choices=RESULT_CHOICES,
        verbose_name="Statut"
    )
    new_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Nouvelle note"
    )
    reason = models.TextField(
        null=True,
        blank=True,
        verbose_name="Raison"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Créé par"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    class Meta:
        verbose_name = "Résultat de requête"
        verbose_name_plural = "Résultats de requêtes"

    def __str__(self):
        return f"Résultat {self.get_status_display()} pour {self.request.id}"


class Attachment(models.Model):
    """Modèle pour les pièces jointes"""
    request = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name="Requête"
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Uploadé par"
    )
    file = models.FileField(
        upload_to='requests/%Y/%m/%d/',
        verbose_name="Fichier"
    )
    filename = models.CharField(
        max_length=255,
        verbose_name="Nom du fichier"
    )
    mime_type = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Type MIME"
    )
    size = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Taille (octets)"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date d'upload"
    )

    class Meta:
        verbose_name = "Pièce jointe"
        verbose_name_plural = "Pièces jointes"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.filename} - {self.request.id}"


class AuditLog(models.Model):
    """Modèle pour l'historique des actions"""
    request = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        related_name='logs',
        verbose_name="Requête"
    )
    action = models.CharField(
        max_length=100,
        verbose_name="Action"
    )
    from_status = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="Statut précédent"
    )
    to_status = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="Nouveau statut"
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Acteur"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date et heure"
    )
    note = models.TextField(
        null=True,
        blank=True,
        verbose_name="Note"
    )

    class Meta:
        verbose_name = "Journal d'audit"
        verbose_name_plural = "Journaux d'audit"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} - {self.request.id} - {self.timestamp}"


class Notification(models.Model):
    """Modèle pour les notifications in-app"""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Utilisateur"
    )
    title = models.CharField(
        max_length=200,
        verbose_name="Titre"
    )
    body = models.TextField(
        verbose_name="Contenu"
    )
    link = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name="Lien"
    )
    read = models.BooleanField(
        default=False,
        verbose_name="Lu"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"
