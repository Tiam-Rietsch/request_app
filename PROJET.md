# Spécification complète — Système de gestion de requêtes (Django REST Framework + HTMX)

> **Langue : Français**

Ce document décrit de manière exhaustive le besoin, le modèle de données, les règles métier, l'API (DRF), les fragments HTMX, les permissions, et fournit des extraits de code Django prêts à l'emploi (modèles, serializers, viewsets, permissions, templates HTMX). L'objectif est d'avoir un **document opérationnel** pour démarrer l'implémentation.

---

## Table des matières

1. Résumé fonctionnel
2. Acteurs / Rôles
3. Modèle conceptuel (entités + attributs)
4. Règles métier et transitions d'état
5. API (DRF) — endpoints et comportements
6. HTMX — fragments et échanges
7. UI / Templates (exemples) en français
8. Permissions et sécurité (DRF + Django)
9. Stockage des fichiers et impression HTML
10. Journalisation / Notifications in-app
11. Tests & qualité
12. Déploiement & settings importants
13. Code d'exemple (Django) : `models.py`, `serializers.py`, `permissions.py`, `views.py`, routes et templates HTMX
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

L'application est entièrement en français et utilise DRF + HTMX pour des mises à jour partielles conviviales.

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

## 6. HTMX — fragments et échanges

HTMX sera utilisé pour :

* boutons d'action rapides (`received`, `approve/reject`, `send to cellule`, `return`, `complete`) qui retournent des fragments HTML mis à jour (ligne du tableau, détail, circuit map)
* modales pour saisir `RequestResult` (accept/reject)
* upload d'attachements avec retour de la liste d'attachements (fragment)

### Exemples d'échanges HTMX

* `hx-post="/htmx/requests/{id}/acknowledge/" hx-swap="outerHTML"` sur la ligne du tableau pour marquer `received` et remplacer la ligne.
* `hx-get="/htmx/requests/{id}/modal_decision/"` pour afficher un modal permettant `approve` ou `reject`.

---

## 7. UI / Templates (exemples) — en français

### Circuit map (HTML simplifié)

```html
<div class="circuit-map flex items-center gap-4">
  <div class="step" data-step="sent">📤<div class="label">Envoyée</div></div>
  <div class="connector">—</div>
  <div class="step" data-step="received">👀<div class="label">Reçue</div></div>
  <div class="connector">—</div>
  <div class="step" data-step="approved">✔️<div class="label">Approuvée</div></div>
  <div class="connector">—</div>
  <div class="step" data-step="in_cellule">🖥️<div class="label">En cellule</div></div>
  <div class="connector">—</div>
  <div class="step" data-step="returned">🔁<div class="label">Retournée</div></div>
  <div class="connector">—</div>
  <div class="step" data-step="done">✅<div class="label">Terminée</div></div>
</div>
```

* Le CSS (Tailwind recommandé) stylera la `.step` active avec `bg-indigo-600 text-white rounded-full p-3` ; les étapes non atteintes seront `opacity-40`.
* HTMX peut demander `GET /htmx/requests/{id}/circuit_map/` qui renvoie le fragment avec l'étape active en variable de rendu.

### Formulaire création requête (sélects en cascade)

* Sélection : **Niveau** → charge les **Filières** disponibles (via `/api/fields/?level_id=...`) → sélection **Filière** charge **Axes** (`/api/axes/?field_id=...`) → sélection **Matière** (`/api/subjects/?field_id=...&level_id=...`).
* Extrait HTML :

```html
<form method="post" action="/api/requests/" enctype="multipart/form-data" hx-post="/api/requests/" hx-swap="outerHTML">
  <select name="class_level" id="class_level" hx-get="/api/fields/?level_id={value}" hx-target="#field-select" hx-swap="innerHTML">
    <!-- options niveaux -->
  </select>
  <div id="field-select"> <!-- server-rendered options de filiere --> </div>
  <div id="axis-select"></div>
  <input type="file" name="attachments" multiple />
  <button type="submit">Soumettre</button>
</form>
```

---

## 8. Permissions et sécurité (DRF + Django)

### Règles

* Vérifier rôle de l'utilisateur (`user.has_role('lecturer')`) et object-level (ex: `request.assigned_to == user` ou `user.is_hod_of(field)`)
* Endpoints sensibles (approve, send_to_cellule, complete) vérifiés côté serveur.
* CSRF activé pour les requêtes HTMX (session-based auth recommandée).

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

### `views.py` (extraits DRF + HTMX endpoints)

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

router = DefaultRouter()
router.register(r'requests', RequestViewSet, basename='request')

urlpatterns = router.urls
```

---

## 14. Plan MVP et checklist (priorité)

1. Modèles + migrations + admin pour `ClassLevel`, `Field`, `Axis`, `Subject`.
2. Auth (session) + pages login/logout.
3. Formulaire de création requête (étudiant) avec selects en cascade et upload d'attachements.
4. Inbox enseignant/HOD + action `received`.
5. Décision `approved`/`rejected` et logique `rejected -> done`.
6. Envoi à `in_cellule` et interface Cellule (upload PJ + `return`).
7. Finalisation `done` + RequestResult.
8. Impression HTML (page stylée) pour requête.
9. Tests et polish UI/UX (circuit map HTMX fragments).

---

## 15. Annexes : décisions et contraintes reprises

* Langue : français.
* Stockage : Django `MEDIA_ROOT` (local) — pas d'S3.
* Pas d'e-mails ni SMS — notifications in-app seulement.
* Les enseignants sont supposés présents (pas de remplacement automatique).
* Etudiant peut modifier requête avant `received` uniquement.
* Cellule = rôle `cellule_informatique` et voit les demandes `in_cellule`.
* Mapping filières/niveaux/axes géré via admin par Super Admin.

---
