# Plan d'Implémentation — Système de Gestion de Requêtes

## Vue d'ensemble
Ce document décrit le plan d'implémentation complet du système de gestion de requêtes pour établissement scolaire utilisant Django REST Framework + HTMX.

---

## Phase 1: Configuration de l'environnement et projet Django

### 1.1 Configuration de l'environnement Windows
- [PENDING] Créer l'environnement virtuel Python (venv)
- [PENDING] Activer l'environnement virtuel
- [PENDING] Installer les dépendances (Django, DRF, HTMX, Swagger, etc.)
- [PENDING] Créer le fichier requirements.txt

### 1.2 Création du projet Django
- [PENDING] Initialiser le projet Django
- [PENDING] Créer l'application principale (requests_app)
- [PENDING] Configurer settings.py (MEDIA, STATIC, DRF, Swagger)
- [PENDING] Configurer les URLs principales

---

## Phase 2: Modèles de données (Backend)

### 2.1 Modèles de base
- [PENDING] Créer le modèle User personnalisé (si nécessaire)
- [PENDING] Créer ClassLevel (Niveau)
- [PENDING] Créer Field (Filière)
- [PENDING] Créer Axis (Axe)
- [PENDING] Créer Subject (Matière)

### 2.2 Modèles utilisateurs
- [PENDING] Créer Student (Étudiant)
- [PENDING] Créer Lecturer (Enseignant)
- [PENDING] Configurer les groupes/rôles (HOD, Cellule, etc.)

### 2.3 Modèles principaux
- [PENDING] Créer Request (Requête)
- [PENDING] Créer RequestResult (Résultat)
- [PENDING] Créer Attachment (Pièce jointe)
- [PENDING] Créer AuditLog (Historique)
- [PENDING] Créer Notification (Notifications in-app)

### 2.4 Migrations et Admin
- [PENDING] Générer les migrations initiales
- [PENDING] Appliquer les migrations
- [PENDING] Configurer Django Admin pour tous les modèles
- [PENDING] Créer un superutilisateur

---

## Phase 3: API REST (Django REST Framework)

### 3.1 Serializers
- [PENDING] AttachmentSerializer
- [PENDING] RequestResultSerializer
- [PENDING] RequestSerializer (avec logique de création)
- [PENDING] SubjectSerializer
- [PENDING] FieldSerializer
- [PENDING] AxisSerializer
- [PENDING] ClassLevelSerializer
- [PENDING] NotificationSerializer

### 3.2 Permissions personnalisées
- [PENDING] IsStudent
- [PENDING] IsAssignedStaff
- [PENDING] IsCellule
- [PENDING] IsSuperAdmin

### 3.3 ViewSets et Endpoints
- [PENDING] RequestViewSet avec actions personnalisées:
  - GET/POST /api/requests/
  - GET/PATCH /api/requests/{id}/
  - POST /api/requests/{id}/acknowledge/
  - POST /api/requests/{id}/decision/
  - POST /api/requests/{id}/send_to_cellule/
  - POST /api/requests/{id}/return_from_cellule/
  - POST /api/requests/{id}/complete/
  - POST /api/requests/{id}/attachments/
  - GET /api/requests/{id}/print/

- [PENDING] ViewSets pour données maîtres:
  - ClassLevelViewSet
  - FieldViewSet
  - AxisViewSet
  - SubjectViewSet

- [PENDING] NotificationViewSet

### 3.4 Configuration Swagger/OpenAPI
- [PENDING] Installer drf-spectacular
- [PENDING] Configurer Swagger UI
- [PENDING] Documenter tous les endpoints
- [PENDING] Tester l'interface Swagger

---

## Phase 4: Logique métier et workflows

### 4.1 Auto-assignation des requêtes
- [PENDING] Logique d'assignation CC → Enseignant
- [PENDING] Logique d'assignation EXAM → HOD

### 4.2 Transitions d'état
- [PENDING] sent → received
- [PENDING] received → approved/rejected
- [PENDING] approved → in_cellule
- [PENDING] rejected → done (avec RequestResult)
- [PENDING] in_cellule → returned
- [PENDING] returned → done (avec RequestResult)

### 4.3 Journalisation et notifications
- [PENDING] Créer AuditLog à chaque transition
- [PENDING] Créer Notification pour acteurs concernés
- [PENDING] Système de notification in-app

---

## Phase 5: Frontend (Templates + HTMX)

### 5.1 Configuration de base
- [PENDING] Configurer templates Django
- [PENDING] Installer et configurer HTMX
- [PENDING] Créer le layout de base (base.html)
- [PENDING] Configurer Tailwind CSS ou CSS custom (Material Design)
- [PENDING] Créer les composants réutilisables

### 5.2 Authentification
- [PENDING] Page de connexion (login.html)
- [PENDING] Page de déconnexion
- [PENDING] Gestion de session

### 5.3 Interface Étudiant
- [PENDING] Dashboard étudiant
- [PENDING] Formulaire de création de requête avec selects en cascade
- [PENDING] Liste des requêtes de l'étudiant
- [PENDING] Détail d'une requête
- [PENDING] Upload d'attachements
- [PENDING] Page d'impression (print.html)

### 5.4 Interface Enseignant/HOD
- [PENDING] Dashboard enseignant/HOD
- [PENDING] Inbox des requêtes assignées
- [PENDING] Actions HTMX (acknowledge, approve, reject)
- [PENDING] Modal de décision
- [PENDING] Finalisation (complete) avec formulaire RequestResult

### 5.5 Interface Cellule Informatique
- [PENDING] Dashboard Cellule
- [PENDING] Liste des requêtes in_cellule
- [PENDING] Upload de pièces jointes techniques
- [PENDING] Action return_from_cellule

### 5.6 Interface Super Admin
- [PENDING] Gestion des ClassLevels
- [PENDING] Gestion des Fields
- [PENDING] Gestion des Axes
- [PENDING] Gestion des Subjects
- [PENDING] Gestion des mappings

### 5.7 Composants HTMX
- [PENDING] Circuit map (indicateur visuel de progression)
- [PENDING] Fragments HTMX pour actions rapides
- [PENDING] Modales HTMX
- [PENDING] Upload dynamique d'attachements

---

## Phase 6: Gestion des fichiers

### 6.1 Configuration
- [PENDING] Configurer MEDIA_ROOT et MEDIA_URL
- [PENDING] Validation de taille de fichier (max 20MB)
- [PENDING] Validation de type de fichier (PDF, PNG, JPEG, DOCX)

### 6.2 Upload et stockage
- [PENDING] Endpoint d'upload d'attachements
- [PENDING] Stockage dans requests/%Y/%m/%d/
- [PENDING] Affichage des attachements

---

## Phase 7: Fonctionnalités avancées

### 7.1 Sélects en cascade
- [PENDING] API pour charger Fields selon ClassLevel
- [PENDING] API pour charger Axes selon Field
- [PENDING] API pour charger Subjects selon Field et ClassLevel
- [PENDING] Intégration HTMX

### 7.2 Impression
- [PENDING] Template d'impression stylée
- [PENDING] CSS pour impression
- [PENDING] Bouton d'impression avec window.print()

### 7.3 Notifications in-app
- [PENDING] Badge de notifications non lues
- [PENDING] Liste des notifications
- [PENDING] Marquer comme lu
- [PENDING] Liens vers requêtes concernées

---

## Phase 8: Tests

### 8.1 Tests unitaires
- [PENDING] Tests des modèles
- [PENDING] Tests des serializers
- [PENDING] Tests des permissions
- [PENDING] Tests des validators

### 8.2 Tests d'intégration
- [PENDING] Test du workflow complet étudiant → enseignant → cellule → done
- [PENDING] Test des transitions d'état
- [PENDING] Test de l'auto-assignation
- [PENDING] Test des permissions sur les endpoints

### 8.3 Tests UI
- [PENDING] Tests HTMX (si applicable)
- [PENDING] Tests des formulaires

---

## Phase 9: Documentation

### 9.1 Documentation API
- [PENDING] Créer API.md avec explication REST
- [PENDING] Documenter tous les endpoints
- [PENDING] Exemples de requêtes/réponses

### 9.2 Documentation utilisateur
- [PENDING] Guide utilisateur étudiant
- [PENDING] Guide utilisateur enseignant/HOD
- [PENDING] Guide utilisateur Cellule
- [PENDING] Guide administrateur

---

## Phase 10: Déploiement et finalisation

### 10.1 Configuration production
- [PENDING] DEBUG=False
- [PENDING] ALLOWED_HOSTS
- [PENDING] SECURE_SSL_REDIRECT
- [PENDING] SESSION_COOKIE_SECURE
- [PENDING] CSRF_COOKIE_SECURE

### 10.2 Données de test
- [PENDING] Créer fixtures pour ClassLevels
- [PENDING] Créer fixtures pour Fields/Axes/Subjects
- [PENDING] Créer utilisateurs de test
- [PENDING] Créer requêtes de démonstration

### 10.3 Optimisations
- [PENDING] select_related et prefetch_related
- [PENDING] Index de base de données
- [PENDING] Cache (si nécessaire)

### 10.4 Vérifications finales
- [PENDING] Vérifier toutes les transitions d'état
- [PENDING] Vérifier toutes les permissions
- [PENDING] Vérifier l'UI sur différents écrans
- [PENDING] Vérifier l'accessibilité
- [PENDING] Tests de charge basiques

---

## Ordre d'exécution recommandé

1. Phase 1 (Configuration)
2. Phase 2 (Modèles)
3. Phase 3 (API)
4. Phase 4 (Logique métier)
5. Phase 6 (Fichiers - en parallèle avec Phase 5)
6. Phase 5 (Frontend)
7. Phase 7 (Fonctionnalités avancées)
8. Phase 8 (Tests)
9. Phase 9 (Documentation)
10. Phase 10 (Déploiement)

---

## Notes importantes

- **Design UI**: Material Design Light Theme, sobre et professionnel
- **Langue**: Tout en français (UI, messages, commentaires)
- **Pas de gradients**: Design simple et clair
- **Consistance**: Utiliser les mêmes composants partout
- **Swagger**: Accessible sur /api/schema/swagger-ui/
- **DRF Browsable API**: Accessible sur tous les endpoints

---

## Dépendances principales

```
Django>=4.2
djangorestframework>=3.14
drf-spectacular>=0.27
django-cors-headers>=4.3
Pillow>=10.1
python-magic-bin>=0.4.14 (Windows)
```

---

## Structure du projet

```
PROJET_GLO5/
├── venv/                          # Environnement virtuel
├── requests_system/               # Projet Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── requests_app/                  # Application principale
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│   ├── urls.py
│   ├── admin.py
│   ├── templates/
│   │   ├── base.html
│   │   ├── login.html
│   │   ├── student/
│   │   ├── staff/
│   │   ├── cellule/
│   │   └── admin/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── tests/
├── media/                         # Fichiers uploadés
├── static/                        # Fichiers statiques compilés
├── requirements.txt
├── API.md
├── IMPLEMENTATION_PLAN.md
└── PROJET.md
```
