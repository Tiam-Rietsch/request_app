# Système de Gestion de Requêtes - École

Système web de gestion de requêtes de contestation de notes pour établissement scolaire, utilisant **Django REST Framework + HTMX**.

## 🚀 Quick Start

### 1. Run the Quick Start script
```bash
quickstart.bat
```

This will:
- Activate the virtual environment
- Prompt you to create a superuser
- Populate test data (students, lecturers, subjects, etc.)
- Start the development server

### 2. Access the application

- **Django Admin**: http://localhost:8000/admin/
- **Swagger UI** (API Documentation): http://localhost:8000/api/schema/swagger-ui/
- **API Root**: http://localhost:8000/api/

---

## 📋 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Activate Virtual Environment
```bash
venv\Scripts\activate.bat
```

### 2. Create Superuser
```bash
python manage.py createsuperuser
```

### 3. Populate Test Data
```bash
python manage.py populate_testdata
```

### 4. Run Server
```bash
python manage.py runserver
```

---

## 👥 Test Accounts

After running `populate_testdata`, you'll have these accounts (all with password: `password123`):

### Students
- `pierre.kouam` - L3 Génie Logiciel
- `marie.ngo` - L3 Génie Logiciel
- `jean.tchoumi` - L2 Génie Informatique
- `sarah.kamga` - L3 Réseaux et Télécommunications

### Lecturers
- `paul.mbida` - Enseignant (GL)
- `jacques.kamdem` - Enseignant (GI)

### HODs (Chefs de Département)
- `anne.fokou` - HOD Génie Logiciel ⭐
- `berthe.ngono` - HOD Réseaux et Télécommunications ⭐

### Cellule Informatique
- `cellule.tech1`
- `cellule.tech2`

---

## 📚 Documentation

- **[PROJET.md](PROJET.md)** - Spécification complète du projet
- **[API.md](API.md)** - Documentation complète de l'API REST
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - Plan d'implémentation détaillé
- **[PROGRESS.md](PROGRESS.md)** - État d'avancement du projet

---

## 🔌 API Endpoints

### Master Data
- `GET /api/classlevels/` - Liste des niveaux
- `GET /api/fields/` - Liste des filières
- `GET /api/axes/` - Liste des axes
- `GET /api/subjects/` - Liste des matières

### Requests (Requêtes)
- `GET/POST /api/requests/` - Liste/Créer requêtes
- `GET/PATCH/DELETE /api/requests/{id}/` - Détail/Modifier/Supprimer
- `POST /api/requests/{id}/acknowledge/` - Marquer comme reçue
- `POST /api/requests/{id}/decision/` - Approuver/Rejeter
- `POST /api/requests/{id}/send_to_cellule/` - Envoyer à la cellule
- `POST /api/requests/{id}/return_from_cellule/` - Retourner de la cellule
- `POST /api/requests/{id}/complete/` - Finaliser
- `POST /api/requests/{id}/upload_attachment/` - Upload fichier
- `GET /api/requests/{id}/print/` - Page imprimable

### Notifications
- `GET /api/notifications/` - Mes notifications
- `POST /api/notifications/{id}/mark_read/` - Marquer comme lue
- `GET /api/notifications/unread_count/` - Nombre non lues

---

## 🔄 Workflow

1. **Étudiant** crée une requête (status: `sent`)
2. Auto-assignation:
   - CC → Enseignant de la matière
   - EXAM → HOD (Chef de département)
3. **Enseignant/HOD** prend en charge (`received`)
4. **Enseignant/HOD** décide:
   - `rejected` → `done` (avec RequestResult)
   - `approved` → `in_cellule`
5. **Cellule informatique** traite et retourne (`returned`)
6. **Enseignant/HOD** finalise (`done` avec RequestResult)

---

## 🛠 Technologies

- **Backend**: Django 5.2.8, Django REST Framework 3.16.1
- **API Documentation**: drf-spectacular (Swagger/OpenAPI)
- **Database**: SQLite (dev) - Configurable pour PostgreSQL/MySQL
- **File Uploads**: python-magic-bin (validation MIME)
- **Frontend** (à venir): HTMX, Tailwind CSS / Material Design

---

## 📁 Project Structure

```
PROJET GLO5/
├── venv/                          # Virtual environment
├── requests_system/               # Django project
│   ├── settings.py               # Configuration
│   ├── urls.py                   # URL routing + Swagger
│   └── wsgi.py
├── requests_app/                  # Main application
│   ├── models.py                 # Database models
│   ├── serializers.py            # DRF serializers
│   ├── views.py                  # ViewSets & endpoints
│   ├── permissions.py            # Custom permissions
│   ├── admin.py                  # Django admin config
│   ├── management/
│   │   └── commands/
│   │       └── populate_testdata.py  # Test data command
│   └── migrations/
├── media/                         # User uploads
├── static/                        # Static files
├── db.sqlite3                    # Database
├── manage.py
├── requirements.txt
├── quickstart.bat                # Quick start script
└── README.md                     # This file
```

---

## ⚙️ Configuration

### File Upload Limits
- Max size: **20 MB**
- Allowed types: PDF, PNG, JPEG, JPG, DOCX

### Language & Timezone
- Language: **French** (`fr-fr`)
- Timezone: **Africa/Douala**

### Pagination
- Default: **20 items per page**

---

## 🔒 Security Features

- Role-based access control (RBAC)
- Object-level permissions
- File upload validation (size & MIME type)
- CSRF protection
- Session-based authentication
- Audit logging for all actions

---

##  Common Commands

### Check for issues
```bash
python manage.py check
```

### Create migrations
```bash
python manage.py makemigrations
```

### Apply migrations
```bash
python manage.py migrate
```

### Create superuser
```bash
python manage.py createsuperuser
```

### Populate test data
```bash
python manage.py populate_testdata
```

### Run development server
```bash
python manage.py runserver
```

### Django shell
```bash
python manage.py shell
```

---

## 🧪 Testing the API

### Using Swagger UI
1. Go to http://localhost:8000/api/schema/swagger-ui/
2. Click "Authorize" and login
3. Try out endpoints directly from the browser

### Using DRF Browsable API
1. Navigate to any endpoint (e.g., http://localhost:8000/api/requests/)
2. Use the built-in forms to interact with the API

### Using curl
```bash
# Login first to get session
curl -X POST http://localhost:8000/api-auth/login/ \
  -d "username=pierre.kouam&password=password123"

# Get requests
curl http://localhost:8000/api/requests/

# Create request
curl -X POST http://localhost:8000/api/requests/ \
  -H "Content-Type: application/json" \
  -d '{"class_level": 1, "field": 1, "subject": 1, "type": "cc", "description": "Test"}'
```

---

## 🎯 Next Steps

The backend API is **100% functional**. What remains for a complete application:

1. ✅ Backend API (DONE)
2. ⏳ Frontend Templates
   - Base layout with Material Design Light theme
   - Login/Logout pages
   - Student dashboard & request creation form
   - Staff/Lecturer dashboard
   - Cellule informatique interface
   - HTMX for dynamic interactions
   - Circuit map visualization

---

## 📞 Support

For issues or questions:
1. Check the documentation files (API.md, PROJET.md)
2. Review Swagger UI for API details
3. Check Django Admin for data management

---

## 📄 License

Educational project

---

**Status**: Backend API fully functional ✅
**Version**: 1.0.0
**Last Updated**: 2025-01-28
