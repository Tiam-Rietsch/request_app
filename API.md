# Documentation API REST — Système de Gestion de Requêtes

## Qu'est-ce qu'une API REST?

**REST** (Representational State Transfer) est un style d'architecture pour concevoir des services web. Une **API REST** utilise le protocole HTTP pour permettre la communication entre un client (navigateur, application mobile) et un serveur.

### Principes clés de REST

1. **Architecture Client-Serveur**: Séparation entre l'interface utilisateur (client) et le stockage des données (serveur)
2. **Sans état (Stateless)**: Chaque requête contient toutes les informations nécessaires
3. **Ressources**: Tout est considéré comme une ressource (utilisateur, requête, matière, etc.)
4. **Méthodes HTTP standardisées**: Utilisation des verbes HTTP pour les actions

---

## Les Méthodes HTTP (Verbes)

### 1. GET - Récupérer des données

**Objectif**: Lire/consulter des ressources sans les modifier

**Caractéristiques**:
- Opération en **lecture seule**
- Peut être mise en cache
- Peut être appelée plusieurs fois sans effet de bord (idempotent)

**Exemples dans notre projet**:

```http
GET /api/requests/
```
Récupère la liste de toutes les requêtes (filtrée selon le rôle de l'utilisateur)

**Réponse exemple**:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "student_name": "Jean Dupont",
    "matricule": "20GL1234",
    "subject": "Mathématiques",
    "type": "cc",
    "status": "sent",
    "submitted_at": "2025-01-15T10:30:00Z"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "student_name": "Marie Martin",
    "matricule": "20GL1235",
    "subject": "Physique",
    "type": "exam",
    "status": "received",
    "submitted_at": "2025-01-14T14:20:00Z"
  }
]
```

---

```http
GET /api/requests/123e4567-e89b-12d3-a456-426614174000/
```
Récupère les détails d'une requête spécifique

**Réponse exemple**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "student": 5,
  "student_name": "Jean Dupont",
  "matricule": "20GL1234",
  "submitted_at": "2025-01-15T10:30:00Z",
  "class_level": 3,
  "field": 2,
  "axis": 4,
  "subject": 12,
  "type": "cc",
  "description": "Je conteste ma note de CC car je pense qu'il y a eu une erreur dans le calcul.",
  "assigned_to": 7,
  "status": "sent",
  "attachments": [
    {
      "id": 1,
      "filename": "copie_cc.pdf",
      "file": "/media/requests/2025/01/15/copie_cc.pdf",
      "uploaded_at": "2025-01-15T10:31:00Z",
      "uploaded_by": 5
    }
  ],
  "result": null
}
```

---

```http
GET /api/fields/?level_id=3
```
Récupère les filières disponibles pour un niveau donné (sélect en cascade)

**Réponse exemple**:
```json
[
  {
    "id": 2,
    "code": "GL",
    "name": "Génie Logiciel",
    "allowed_levels": [2, 3, 4, 5]
  },
  {
    "id": 3,
    "code": "GI",
    "name": "Génie Informatique",
    "allowed_levels": [2, 3, 4, 5]
  }
]
```

---

### 2. POST - Créer une nouvelle ressource

**Objectif**: Créer une nouvelle ressource sur le serveur

**Caractéristiques**:
- Opération d'**écriture**
- Envoie des données dans le corps de la requête (body)
- Non idempotent (appeler plusieurs fois crée plusieurs ressources)

**Exemples dans notre projet**:

```http
POST /api/requests/
Content-Type: application/json

{
  "class_level": 3,
  "field": 2,
  "axis": 4,
  "subject": 12,
  "type": "cc",
  "description": "Je conteste ma note de CC car je pense qu'il y a eu une erreur dans le calcul."
}
```

**Réponse exemple** (201 Created):
```json
{
  "id": "323e4567-e89b-12d3-a456-426614174002",
  "student": 5,
  "student_name": "Jean Dupont",
  "matricule": "20GL1234",
  "submitted_at": "2025-01-15T10:30:00Z",
  "class_level": 3,
  "field": 2,
  "axis": 4,
  "subject": 12,
  "type": "cc",
  "description": "Je conteste ma note de CC car je pense qu'il y a eu une erreur dans le calcul.",
  "assigned_to": 7,
  "status": "sent",
  "attachments": [],
  "result": null
}
```

---

```http
POST /api/requests/123e4567-e89b-12d3-a456-426614174000/decision/
Content-Type: application/json

{
  "decision": "approved",
  "reason": "La requête est légitime et justifiée."
}
```

Décision de l'enseignant/HOD (approuver ou rejeter)

**Réponse exemple** (200 OK):
```json
{
  "status": "ok",
  "message": "Décision enregistrée avec succès"
}
```

---

```http
POST /api/requests/123e4567-e89b-12d3-a456-426614174000/attachments/
Content-Type: multipart/form-data

file: [fichier binaire]
```

Upload d'une pièce jointe

**Réponse exemple** (201 Created):
```json
{
  "id": 5,
  "filename": "resultat_correction.pdf",
  "file": "/media/requests/2025/01/15/resultat_correction.pdf",
  "uploaded_at": "2025-01-15T16:45:00Z",
  "uploaded_by": 8
}
```

---

### 3. PUT - Remplacer complètement une ressource

**Objectif**: Remplacer entièrement une ressource existante

**Caractéristiques**:
- Opération d'**écriture complète**
- Tous les champs doivent être fournis
- Idempotent (appeler plusieurs fois produit le même résultat)

**Note**: Dans notre projet, nous utilisons **PATCH** plutôt que PUT pour des mises à jour partielles.

**Exemple théorique**:
```http
PUT /api/subjects/12/
Content-Type: application/json

{
  "code": "MATH101",
  "name": "Mathématiques I",
  "field": 2,
  "class_levels": [2, 3]
}
```

---

### 4. PATCH - Modifier partiellement une ressource

**Objectif**: Mettre à jour certains champs d'une ressource sans remplacer l'entièreté

**Caractéristiques**:
- Opération d'**écriture partielle**
- Seuls les champs à modifier sont envoyés
- Plus flexible que PUT

**Exemples dans notre projet**:

```http
PATCH /api/requests/123e4567-e89b-12d3-a456-426614174000/
Content-Type: application/json

{
  "description": "Je conteste ma note de CC car je pense qu'il y a eu une erreur dans le calcul. J'ai obtenu 12/20 mais mes réponses correctes devraient donner au moins 15/20."
}
```

Modification de la description de la requête (possible uniquement si status='sent')

**Réponse exemple** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "student": 5,
  "student_name": "Jean Dupont",
  "description": "Je conteste ma note de CC car je pense qu'il y a eu une erreur dans le calcul. J'ai obtenu 12/20 mais mes réponses correctes devraient donner au moins 15/20.",
  "status": "sent",
  ...
}
```

---

### 5. DELETE - Supprimer une ressource

**Objectif**: Supprimer une ressource du serveur

**Caractéristiques**:
- Opération de **suppression**
- Idempotent (supprimer deux fois = même résultat)

**Exemples dans notre projet**:

```http
DELETE /api/requests/123e4567-e89b-12d3-a456-426614174000/attachments/5/
```

Suppression d'une pièce jointe (possible uniquement par celui qui l'a uploadée ou admin)

**Réponse exemple** (204 No Content):
```
(Pas de corps de réponse)
```

---

## Endpoints du Projet — Vue d'ensemble

### Authentification

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| POST | `/api/auth/login/` | Connexion utilisateur | Public |
| POST | `/api/auth/logout/` | Déconnexion | Authentifié |
| GET | `/api/auth/me/` | Profil utilisateur actuel | Authentifié |

---

### Requêtes (Requests)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/api/requests/` | Liste des requêtes | Authentifié (filtrée par rôle) |
| POST | `/api/requests/` | Créer une requête | Étudiant |
| GET | `/api/requests/{id}/` | Détail d'une requête | Propriétaire ou assigné |
| PATCH | `/api/requests/{id}/` | Modifier une requête | Étudiant (si status='sent') |
| DELETE | `/api/requests/{id}/` | Supprimer une requête | Étudiant (si status='sent') |
| POST | `/api/requests/{id}/acknowledge/` | Marquer comme reçue | Staff assigné |
| POST | `/api/requests/{id}/decision/` | Approuver/Rejeter | Staff assigné |
| POST | `/api/requests/{id}/send_to_cellule/` | Envoyer à la cellule | Staff assigné (après approved) |
| POST | `/api/requests/{id}/return_from_cellule/` | Retourner de la cellule | Cellule informatique |
| POST | `/api/requests/{id}/complete/` | Finaliser la requête | Staff assigné |
| GET | `/api/requests/{id}/print/` | Version imprimable | Propriétaire ou assigné |

---

### Pièces jointes (Attachments)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| POST | `/api/requests/{id}/attachments/` | Upload fichier | Propriétaire ou staff assigné |
| GET | `/api/requests/{id}/attachments/` | Liste des fichiers | Propriétaire ou assigné |
| DELETE | `/api/attachments/{id}/` | Supprimer un fichier | Uploadeur ou admin |

---

### Données maîtres (Master Data)

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/api/classlevels/` | Liste des niveaux | Authentifié |
| GET/POST/PUT/DELETE | `/api/classlevels/{id}/` | CRUD niveaux | Super Admin |
| GET | `/api/fields/` | Liste des filières | Authentifié |
| GET/POST/PUT/DELETE | `/api/fields/{id}/` | CRUD filières | Super Admin |
| GET | `/api/axes/` | Liste des axes | Authentifié |
| GET/POST/PUT/DELETE | `/api/axes/{id}/` | CRUD axes | Super Admin |
| GET | `/api/subjects/` | Liste des matières | Authentifié |
| GET/POST/PUT/DELETE | `/api/subjects/{id}/` | CRUD matières | Super Admin |

---

### Notifications

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| GET | `/api/notifications/` | Mes notifications | Authentifié |
| PATCH | `/api/notifications/{id}/read/` | Marquer comme lue | Propriétaire |
| GET | `/api/notifications/unread_count/` | Nombre non lues | Authentifié |

---

## Codes de statut HTTP courants

| Code | Signification | Utilisation |
|------|---------------|-------------|
| 200 | OK | Requête réussie (GET, PATCH, actions custom) |
| 201 | Created | Ressource créée avec succès (POST) |
| 204 | No Content | Suppression réussie (DELETE) |
| 400 | Bad Request | Données invalides ou manquantes |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Authentifié mais non autorisé |
| 404 | Not Found | Ressource introuvable |
| 500 | Internal Server Error | Erreur serveur |

---

## Exemples de workflows API complets

### Workflow 1: Étudiant soumet une requête

**Étape 1**: Récupérer les niveaux disponibles
```http
GET /api/classlevels/
```

**Étape 2**: Récupérer les filières pour le niveau choisi
```http
GET /api/fields/?level_id=3
```

**Étape 3**: Récupérer les axes pour la filière choisie
```http
GET /api/axes/?field_id=2
```

**Étape 4**: Récupérer les matières
```http
GET /api/subjects/?field_id=2&level_id=3
```

**Étape 5**: Créer la requête
```http
POST /api/requests/
{
  "class_level": 3,
  "field": 2,
  "axis": 4,
  "subject": 12,
  "type": "cc",
  "description": "Contestation de note..."
}
```

**Étape 6**: Uploader une pièce jointe
```http
POST /api/requests/{id}/attachments/
Content-Type: multipart/form-data
```

---

### Workflow 2: Enseignant traite une requête

**Étape 1**: Voir les requêtes assignées
```http
GET /api/requests/
```

**Étape 2**: Voir le détail
```http
GET /api/requests/{id}/
```

**Étape 3**: Marquer comme reçue
```http
POST /api/requests/{id}/acknowledge/
```

**Étape 4**: Prendre une décision
```http
POST /api/requests/{id}/decision/
{
  "decision": "approved",
  "reason": "Requête légitime"
}
```

**Étape 5**: Envoyer à la cellule (si approuvée)
```http
POST /api/requests/{id}/send_to_cellule/
```

---

### Workflow 3: Cellule traite et renvoie

**Étape 1**: Voir les requêtes in_cellule
```http
GET /api/requests/
```

**Étape 2**: Ajouter des pièces jointes techniques
```http
POST /api/requests/{id}/attachments/
```

**Étape 3**: Retourner la requête
```http
POST /api/requests/{id}/return_from_cellule/
```

---

### Workflow 4: Finalisation par enseignant/HOD

**Étape 1**: Voir les requêtes retournées
```http
GET /api/requests/?status=returned
```

**Étape 2**: Finaliser avec résultat
```http
POST /api/requests/{id}/complete/
{
  "status": "accepted",
  "new_score": 16.5,
  "reason": "Après vérification, erreur de calcul confirmée."
}
```

---

## Format des données

### JSON (JavaScript Object Notation)

Toutes les requêtes et réponses utilisent le format JSON:

```json
{
  "cle1": "valeur_texte",
  "cle2": 123,
  "cle3": true,
  "cle4": ["tableau", "de", "valeurs"],
  "cle5": {
    "objet": "imbriqué"
  }
}
```

### Multipart/Form-Data

Pour l'upload de fichiers:

```http
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="document.pdf"
Content-Type: application/pdf

[binary data]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

---

## Headers importants

```http
Content-Type: application/json          # Type de contenu envoyé
Accept: application/json                 # Type de contenu accepté
Authorization: Bearer <token>            # Token d'authentification (si JWT)
X-CSRFToken: <token>                    # Token CSRF pour session auth
```

---

## Pagination

Les listes peuvent être paginées:

```http
GET /api/requests/?page=2&page_size=20
```

**Réponse**:
```json
{
  "count": 156,
  "next": "http://localhost:8000/api/requests/?page=3",
  "previous": "http://localhost:8000/api/requests/?page=1",
  "results": [
    {...},
    {...}
  ]
}
```

---

## Filtrage

Exemples de filtres disponibles:

```http
GET /api/requests/?status=sent
GET /api/requests/?type=cc
GET /api/requests/?student__matricule=20GL1234
GET /api/subjects/?field_id=2&level_id=3
```

---

## Gestion des erreurs

### Exemple d'erreur de validation (400)

```json
{
  "description": [
    "Ce champ ne peut pas être vide."
  ],
  "subject": [
    "Cette matière n'est pas disponible pour ce niveau."
  ]
}
```

### Exemple d'erreur de permission (403)

```json
{
  "detail": "Vous n'avez pas la permission d'effectuer cette action."
}
```

### Exemple d'erreur not found (404)

```json
{
  "detail": "Non trouvé."
}
```

---

## Outils pour tester l'API

1. **Swagger UI** (dans le projet): `http://localhost:8000/api/schema/swagger-ui/`
2. **DRF Browsable API**: Accessible directement sur chaque endpoint
3. **Postman**: Application standalone pour tester les APIs
4. **cURL**: Outil en ligne de commande
5. **HTTPie**: Alternative moderne à cURL

### Exemple avec cURL

```bash
# GET
curl -X GET http://localhost:8000/api/requests/ \
  -H "Authorization: Bearer <token>"

# POST
curl -X POST http://localhost:8000/api/requests/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"class_level": 3, "field": 2, "subject": 12, "type": "cc", "description": "..."}'
```

---

## Résumé des méthodes HTTP dans notre projet

| Méthode | Utilisation principale | Idempotent | Safe |
|---------|------------------------|------------|------|
| **GET** | Consulter des données | ✅ | ✅ |
| **POST** | Créer, Actions custom | ❌ | ❌ |
| **PATCH** | Modifier partiellement | ❌ | ❌ |
| **PUT** | Remplacer complètement | ✅ | ❌ |
| **DELETE** | Supprimer | ✅ | ❌ |

- **Safe (Sûr)**: N'a pas d'effet de bord, lecture seule
- **Idempotent**: Même résultat si appelé plusieurs fois

---

## Bonnes pratiques suivies

1. ✅ Utilisation correcte des verbes HTTP
2. ✅ Codes de statut appropriés
3. ✅ URLs ressources (noms au pluriel)
4. ✅ Versioning de l'API (via `/api/`)
5. ✅ Gestion cohérente des erreurs
6. ✅ Documentation automatique (Swagger)
7. ✅ Authentification sécurisée
8. ✅ Permissions granulaires
9. ✅ Validation des données
10. ✅ Pagination pour les listes

---

## Accéder à la documentation

Une fois le projet démarré:

- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **Schema JSON**: http://localhost:8000/api/schema/
- **DRF Browsable API**: http://localhost:8000/api/requests/ (directement)
