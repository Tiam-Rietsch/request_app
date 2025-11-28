# Spécification complète — Système de gestion de requêtes (Django REST Framework + Next.js)

> **Langue : Français**

Ce document décrit de manière exhaustive le besoin, le modèle de données, les règles métier, l'API (DRF), l'interface Next.js, les permissions, et fournit des extraits de code Django prêts à l'emploi (modèles, serializers, viewsets, permissions). L'objectif est d'avoir un **document opérationnel** pour démarrer l'implémentation.

---

## Table des matières

1. Résumé fonctionnel
2. Acteurs / Rôles
3. Modèle conceptuel (entités + attributs)
4. Règles métier et transitions d'état
5. API (DRF) — endpoints et comportements
6. Frontend Next.js — architecture et composants
7. UI / Interface utilisateur (Next.js + React)
8. Permissions et sécurité (DRF + Django)
9. Stockage des fichiers et impression HTML
10. Journalisation / Notifications in-app
11. Tests & qualité
12. Déploiement & settings importants
13. Code d'exemple (Django) : `models.py`, `serializers.py`, `permissions.py`, `views.py`, routes API
14. Plan MVP et checklist
15. Annexes : contraintes et décisions prises

---

## 1. Résumé fonctionnel

Un système web où des étudiants déposent des requêtes de contestation de notes. Flux :

* Étudiant soumet une **requête** (formulaire) -> status `sent`.
* Selon `type` (CC ou EXAM): CC routée à l'enseignant de la matière ; EXAM routé au HOD.
* Enseignant/HOD prend en charge (`received`), puis prend une **décision initiale** : `approved` ou `rejected`.

  * Si `rejected` -> on crée immédiatement un `RequestResult` (status `rejected`) et la requête passe à `done`.
  * Si `approved` -> on passe à `in_cellule` (Cellule informatique) pour traitement technique.
* Cellule informatique travaille sur la requête `in_cellule` (ajoute PJ, annotations) puis la **retourne** (`returned`).
* HOD/enseignant vérifie le retour et finalise (`done`) en enregistrant le `RequestResult` final (`accepted` ou `rejected`, éventuellement `new_score`).

L'application est entièrement en français et utilise DRF (backend) + Next.js (frontend) pour une interface moderne et réactive.

---

## 2. Acteurs / Rôles

* **Étudiant** (`student`) : soumet, modifie tant que `status=sent`, consulte son historique et imprime sa requête.
* **Enseignant** (`lecturer`) : reçoit les requêtes CC, marque `received`, décide `approved`/`rejected`, finalise si nécessaire.
* **Chef de département (HOD)** (`hod`) : reçoit les requêtes EXAM, mêmes actions qu'un enseignant avec droits étendus.
* **Cellule informatique** (`cellule_informatique`) : personnel technique qui voit toutes les requêtes `in_cellule` et peut ajouter PJ/annotations puis `return`.
* **Super Admin** (`super_admin`) : gestion complète des données maîtres (classes, filières, axes, matières), utilisateurs et mappings.

> Un utilisateur peut cumuler plusieurs rôles (ex : enseignant + hod). Les privilèges sont cumulés.

---

## 3. Modèle conceptuel (entités + attributs)

### Entités principales (résumé)

* `User` (Auth)
* `Student` (profil de l'étudiant)
* `Lecturer` (profil enseignant)
* `ClassLevel` (Niveau)
* `Field` (Filière)
* `Axis` (Axe)
* `Subject` (Matière)
* `Request` (Requête)
* `RequestResult` (Résultat)
* `Attachment` (Pièce jointe)
* `AuditLog` (Historique)
* `Notification` (in-app)

Les relations et attributs détaillés ont été spécifiés — voir la partie "Code d'exemple" pour les modèles Django complets.

---

## 4. Règles métier et transitions d'état

### États et transitions (valides)

* `sent` (créée par l'étudiant)

  * étudiant peut modifier tant que `sent`
  * auto-assignation : CC -> enseignant ; EXAM -> HOD
* `received` (enseignant/HOD prend en charge)

  * action : `received` (journaux)
* `approved` (enseignant/HOD valide la légitimité de la requête)

  * si `approved` -> `in_cellule`
* `rejected` (enseignant/HOD rejette)

  * on crée `RequestResult` (status `rejected`) et on passe à `done`
* `in_cellule` (Cellule informatique traite)

  * Cellule ajoute pièces, notes, puis fait `returned`
* `returned` (Cellule renvoie au HOD/enseignant)

  * HOD/enseignant finalise : `done` (création de `RequestResult` acceptée ou rejetée)
* `done` (terminal)

### Points importants

* La décision initiale `approved`/`rejected` est faite *avant* le passage en cellule.
* La Cellule a un rôle purement technique et peut consulter/annoter même lors d'autres états si besoin (vue limitée aux demandes `in_cellule` par défaut).
* Toute transition crée une entrée `AuditLog` et une notification in-app vers les acteurs concernés.

---

## 5. API (DRF) — endpoints et comportements

### Endpoints principaux (REST)

* `GET /api/requests/` — liste (filtrée selon le rôle et la relation à la requête)
* `POST /api/requests/` — créer une requête (étudiant)
* `GET /api/requests/{uuid}/` — détail
* `PATCH /api/requests/{uuid}/` — modification partielle (ex: ajout d'annotations par staff)
* `POST /api/requests/{uuid}/attachments/` — upload d'une pièce jointe
* `GET /api/requests/{uuid}/print/` — vue HTML imprimable (template beautiful)
* `POST /api/requests/{uuid}/decision/` — pour `approved` / `rejected` initial
* `POST /api/requests/{uuid}/send_to_cellule/` — passe en `in_cellule` (réservé au HOD/enseignant après `approved`)
* `POST /api/requests/{uuid}/return_from_cellule/` — Cellule renvoie (set `returned`)
* `POST /api/requests/{uuid}/complete/` — HOD/enseignant finalise, crée `RequestResult` et met `done`

### Endpoints admin/data maîtres

* `GET/POST/PUT/DELETE /api/fields/`, `/api/axes/`, `/api/classlevels/`, `/api/subjects/`

  * accessible uniquement au Super Admin (ou rôle admin approprié)

---

## 6. Frontend Next.js — architecture et composants

Le frontend est construit avec **Next.js 16** et **React 19**, utilisant :

* **API Client** : Bibliothèque Axios personnalisée pour communiquer avec le backend Django
* **Authentification** : Context API React pour gérer l'état utilisateur et les sessions
* **Composants UI** : Shadcn UI (Radix UI) pour les composants réutilisables
* **Styling** : Tailwind CSS pour le design moderne et responsive
* **Routing** : Next.js App Router pour la navigation côté client

### Architecture Frontend

* **Pages** : Routes Next.js dans `app/` (login, signup, dashboards, listes, détails)
* **Composants** : Composants réutilisables dans `components/` (sidebar, navbar, progress-map, tables)
* **API Client** : `lib/api.ts` pour toutes les requêtes HTTP vers le backend
* **Context** : `lib/auth-context.tsx` pour la gestion de l'authentification globale

### Exemples d'interactions

* Les boutons d'action (`received`, `approve/reject`, `send to cellule`, `return`, `complete`) appellent les endpoints API via `requestsAPI` et mettent à jour l'interface React
* Modales React (Dialog de Shadcn UI) pour saisir `RequestResult` (accept/reject)
* Upload d'attachements avec retour de la liste mise à jour via l'API

---

## 7. UI / Interface utilisateur (Next.js + React)

### Circuit map (Progress Map Component)

Le composant `ProgressMap` affiche visuellement l'état de progression d'une requête :

* Points avec icônes de validation pour les étapes complétées
* Couleur verte pour les étapes passées, grise pour les étapes en attente
* Tooltips au survol pour afficher les labels des étapes
* Design moderne et minimaliste

### Formulaire création requête (sélects en cascade)

* Sélection : **Niveau** → charge les **Filières** disponibles (via `/api/fields/?level_id=...`) → sélection **Filière** charge **Axes** (`/api/axes/?field_id=...`) → sélection **Matière** (`/api/subjects/?field_id=...&level_id=...`)
* Implémentation React avec `useState` et `useEffect` pour gérer les dépendances entre sélects
* Validation côté client avec Zod et react-hook-form

---

## 8. Permissions et sécurité (DRF + Django)

### Règles

* Vérifier rôle de l'utilisateur (`user.has_role('lecturer')`) et object-level (ex: `request.assigned_to == user` ou `user.is_hod_of(field)`)
* Endpoints sensibles (approve, send_to_cellule, complete) vérifiés côté serveur.
* CSRF activé pour les requêtes API (session-based auth avec cookies).

### Classe de permission DRF (exemple)

* `IsStudentOrReadOnly` — pour créer uniquement si `student` et lecture pour tous concernés.
* `IsAssignedStaff` — permet actions si `user` est `assigned_to` ou `user` has role `hod` for that field.
* `IsCellule` — endpoints de la Cellule.

---

## 9. Stockage des fichiers et impression HTML

* `Attachment.file` : `FileField(upload_to='requests/%Y/%m/%d/')` et stockage local `MEDIA_ROOT`.
* Limites : max_size configurable (ex: `MAX_UPLOAD_SIZE = 20 * 1024 * 1024`), types autorisés `ALLOWED_FILE_TYPES = ['application/pdf','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.wordprocessingml.document']`.
* Impression : `GET /requests/{id}/print/` renvoie template stylée prête pour `window.print()`.

---

## 10. Journalisation / Notifications in-app

* Modèle `AuditLog` pour tout changement crucial (status change, upload, decision), avec `actor`, `timestamp`, `note`.
* Modèle `Notification` (user, title, body, link, read=False, created_at) pour messages in-app.
* Chaque transition : créer `AuditLog` + `Notification` pour étudiants et staff concernés.

---

## 11. Tests & qualité

* Tests unitaires pour :

  * création de requête et validation du routing
  * transitions d'état autorisées/interdites
  * permissions et accès d'objets
  * upload d'attachements (taille/type)
* Tests d'intégration (flow complet) : étudiant -> enseignant -> approved -> in_cellule -> returned -> done

---

## 12. Déploiement & settings importants

* `DEBUG=False` en production, `ALLOWED_HOSTS` configurés.
* `MEDIA_ROOT` et `MEDIA_URL` pour fichiers.
* Configurer `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` en production.

---

## 13. Code d'exemple (Django) — prêt à coller

> Le code est en français (noms de champs et commentaires). Ajustez imports selon votre projet.

### `models.py`

```python
import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ClassLevel(models.Model):
    name = models.CharField(max_length=50)
    order = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class Field(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    allowed_levels = models.ManyToManyField(ClassLevel, related_name='fields')

    def __str__(self):
        return f"{self.code} - {self.name}"

class Axis(models.Model):
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='axes')

    def __str__(self):
        return f"{self.field.code}:{self.code}"

class Subject(models.Model):
    code = models.CharField(max_length=30, blank=True)
    name = models.CharField(max_length=200)
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='subjects')
    class_levels = models.ManyToManyField(ClassLevel, related_name='subjects')

    def __str__(self):
        return self.name

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    matricule = models.CharField(max_length=50, unique=True)
    class_level = models.ForeignKey(ClassLevel, on_delete=models.PROTECT)
    field = models.ForeignKey(Field, on_delete=models.PROTECT, null=True, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.matricule})"

class Request(models.Model):
    TYPE_CHOICES = [('cc', 'CC'), ('exam', 'EXAM')]
    STATUS_CHOICES = [
        ('sent','Envoyée'),
        ('received','Reçue'),
        ('approved','Approuvée'),
        ('rejected','Rejetée'),
        ('in_cellule','En cellule'),
        ('returned','Retournée'),
        ('done','Terminée'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='requests')
    matricule = models.CharField(max_length=50)
    student_name = models.CharField(max_length=200)
    submitted_at = models.DateTimeField(auto_now_add=True)
    class_level = models.ForeignKey(ClassLevel, on_delete=models.PROTECT)
    field = models.ForeignKey(Field, on_delete=models.PROTECT)
    axis = models.ForeignKey(Axis, on_delete=models.PROTECT, null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Requête {self.id} - {self.subject.name} - {self.student.matricule}"

class RequestResult(models.Model):
    RESULT_CHOICES = [('accepted','Acceptée'),('rejected','Rejetée')]
    request = models.OneToOneField(Request, on_delete=models.CASCADE, related_name='result')
    status = models.CharField(max_length=10, choices=RESULT_CHOICES)
    new_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Attachment(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='attachments')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    file = models.FileField(upload_to='requests/%Y/%m/%d/')
    filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100, blank=True)
    size = models.PositiveIntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=100)
    from_status = models.CharField(max_length=50, null=True, blank=True)
    to_status = models.CharField(max_length=50, null=True, blank=True)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(null=True, blank=True)

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    body = models.TextField()
    link = models.CharField(max_length=500, null=True, blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

### `serializers.py` (extraits essentiels)

```python
from rest_framework import serializers
from .models import Request, Attachment, RequestResult, Subject

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id','filename','file','uploaded_at','uploaded_by']

class RequestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestResult
        fields = ['status','new_score','reason','created_by','created_at']
        read_only_fields = ['created_by','created_at']

class RequestSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    result = RequestResultSerializer(read_only=True)

    class Meta:
        model = Request
        fields = ['id','student','matricule','student_name','submitted_at','class_level','field','axis','subject','type','description','assigned_to','status','attachments','result']
        read_only_fields = ['submitted_at','status','student','matricule','student_name']

    def create(self, validated_data):
        user = self.context['request'].user
        # remplir student, matricule, student_name automatiquement
        student = getattr(user, 'student_profile', None)
        if not student:
            raise serializers.ValidationError("Utilisateur non étudiant")
        validated_data['student'] = student
        validated_data['matricule'] = student.matricule
        validated_data['student_name'] = user.get_full_name()
        # routing automatique
        req = super().create(validated_data)
        # assigner selon type
        if req.type == 'cc':
            # assigner à l'enseignant de la matière si disponible (ex : le premier)
            lecturers = req.subject.lecturers.all()
            if lecturers.exists():
                req.assigned_to = lecturers.first().user
                req.save()
        else:
            # assigner au HOD: logique simplifiée: super admin ou cherche user with hod role in field
            # implémenter selon votre structure réelle
            pass
        # journal
        from .models import AuditLog
        AuditLog.objects.create(request=req, action='create', to_status=req.status, actor=user)
        return req
```

---

### `permissions.py` (extraits)

```python
from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'student_profile')

class IsAssignedStaff(BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj est une Request
        if request.user.is_superuser:
            return True
        # HOD role check can be implemented via groups or profile flags
        if request.user.groups.filter(name='hod').exists():
            return True
        return obj.assigned_to == request.user

class IsCellule(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='cellule_informatique').exists() or request.user.is_superuser
```

---

### `views.py` (extraits DRF ViewSets)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render
from django.db import transaction
from .models import Request, Attachment, RequestResult, AuditLog
from .serializers import RequestSerializer, AttachmentSerializer, RequestResultSerializer
from .permissions import IsAssignedStaff, IsCellule

class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all().select_related('student','subject')
    serializer_class = RequestSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'student_profile'):
            return Request.objects.filter(student=user.student_profile)
        # staff: inbox
        if user.groups.filter(name='cellule_informatique').exists():
            return Request.objects.filter(status='in_cellule')
        # lecturers/hod: assigned
        return Request.objects.filter(assigned_to=user)

    @action(detail=True, methods=['post'], permission_classes=[IsAssignedStaff])
    def acknowledge(self, request, pk=None):
        req = self.get_object()
        old = req.status
        req.status = 'received'
        req.save()
        AuditLog.objects.create(request=req, action='status_change', from_status=old, to_status=req.status, actor=request.user)
        return Response({'status':'ok'})

    @action(detail=True, methods=['post'], permission_classes=[IsAssignedStaff])
    def decision(self, request, pk=None):
        # body: {"decision":"approved"|"rejected","reason":...}
        req = self.get_object()
        dec = request.data.get('decision')
        reason = request.data.get('reason')
        if dec not in ('approved','rejected'):
            return Response({'detail':'Décision invalide'}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            old = req.status
            if dec == 'rejected':
                req.status = 'done'
                req.save()
                RequestResult.objects.create(request=req, status='rejected', reason=reason, created_by=request.user)
                AuditLog.objects.create(request=req, action='decision_rejected', from_status=old, to_status='done', actor=request.user, note=reason)
            else:
                req.status = 'approved'
                req.save()
                AuditLog.objects.create(request=req, action='decision_approved', from_status=old, to_status='approved', actor=request.user)
        return Response({'status':'ok'})

    @action(detail=True, methods=['post'], permission_classes=[IsCellule])
    def return_from_cellule(self, request, pk=None):
        req = self.get_object()
        old = req.status
        req.status = 'returned'
        req.save()
        AuditLog.objects.create(request=req, action='returned_from_cellule', from_status=old, to_status='returned', actor=request.user)
        return Response({'status':'ok'})

    @action(detail=True, methods=['post'], permission_classes=[IsAssignedStaff])
    def complete(self, request, pk=None):
        # body: {status: 'accepted'|'rejected', new_score: optional, reason: optional}
        req = self.get_object()
        data = request.data
        res_serializer = RequestResultSerializer(data=data)
        res_serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            result = res_serializer.save(created_by=request.user, request=req)
            req.status = 'done'
            req.closed_at = models.functions.Now()
            req.save()
            AuditLog.objects.create(request=req, action='completed', from_status=req.status, to_status='done', actor=request.user)
        return Response({'status':'ok'})
```

---

### Routes (exemple `urls.py`)

```python
from rest_framework.routers import DefaultRouter
from .views import RequestViewSet
from . import views_api_auth

router = DefaultRouter()
router.register(r'requests', RequestViewSet, basename='request')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login/', views_api_auth.api_login, name='api_login'),
    path('api/auth/logout/', views_api_auth.api_logout, name='api_logout'),
    path('api/auth/signup/', views_api_auth.api_signup, name='api_signup'),
    path('api/auth/me/', views_api_auth.api_current_user, name='api_current_user'),
]
```

---

## 14. Plan MVP et checklist (priorité)

1. Modèles + migrations + admin pour `ClassLevel`, `Field`, `Axis`, `Subject`.
2. API Auth (session) + endpoints login/logout/signup pour Next.js.
3. Formulaire de création requête (étudiant) avec selects en cascade et upload d'attachements (Next.js).
4. Inbox enseignant/HOD + action `received` (Next.js).
5. Décision `approved`/`rejected` et logique `rejected -> done` (Next.js).
6. Envoi à `in_cellule` et interface Cellule (upload PJ + `return`) (Next.js).
7. Finalisation `done` + RequestResult (Next.js).
8. Impression HTML (page stylée) pour requête (template Django pour print).
9. Tests et polish UI/UX (circuit map React component).

---

## 15. Annexes : décisions et contraintes reprises

* Langue : français.
* Frontend : Next.js 16 avec React 19, Tailwind CSS, Shadcn UI.
* Backend : Django REST Framework avec session-based authentication.
* Stockage : Django `MEDIA_ROOT` (local) — pas d'S3.
* Pas d'e-mails ni SMS — notifications in-app seulement.
* Les enseignants sont supposés présents (pas de remplacement automatique).
* Etudiant peut modifier requête avant `received` uniquement.
* Cellule = rôle `cellule_informatique` (flag sur Lecturer) et voit les demandes `in_cellule`, `returned`, `done`.
* Mapping filières/niveaux/axes géré via admin par Super Admin.

---
