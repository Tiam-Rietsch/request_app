# Quick Start Guide 🚀

## Getting Started in 5 Minutes

### Step 1: Install QR Code Package
```bash
cd "d:\PROJET GLO5"
venv\Scripts\activate.bat
pip install qrcode
```

### Step 2: Run the Server
```bash
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 3: Create a Superuser (if not already done)
```bash
python manage.py createsuperuser
```

---

## Initial Setup via Django Admin

### 1. Access Django Admin
Go to: http://localhost:8000/admin/

Login with your superuser credentials.

### 2. Create ClassLevels
**Admin > Class Levels > Add**
- Licence 1
- Licence 2
- Licence 3
- Master 1
- Master 2

### 3. Create Fields (Filières)
**Admin > Fields > Add**
- Génie Logiciel
- Réseaux et Télécommunications
- Sécurité Informatique
- Systèmes d'Information

### 4. Create Axes (Optional)
**Admin > Axes > Add**
- Développement Web
- Intelligence Artificielle
- Cybersécurité
- Big Data

### 5. Create Subjects
**Admin > Subjects > Add**

Example:
- **Name**: Programmation Web
- **Class Level**: Licence 3
- **Field**: Génie Logiciel
- **Axis**: Développement Web (optional)
- **Lecturers**: (leave empty for now)

Create 5-10 subjects across different class levels and fields.

### 6. Create Lecturer Accounts

**Admin > Users > Add User**

Create a lecturer:
- **Username**: lect001
- **Password**: (set password)
- **First name**: Jean
- **Last name**: Dupont
- **Save**

Then edit the user:
- **Admin > Lecturers > Add Lecturer**
- **User**: Jean Dupont
- **Field**: Génie Logiciel
- **Is HOD**: ✓ (Check for one lecturer per field)
- **Subjects**: Select subjects to assign
- **Save**

Create 2-3 lecturers:
- 1 HOD per field
- 1-2 regular lecturers

### 7. Create Cellule Group and Users

**Admin > Groups > Add Group**
- **Name**: Cellule
- **Save**

**Admin > Users > Add User**
- **Username**: cellule01
- **Password**: (set password)
- **First name**: Marie
- **Last name**: Martin
- **Groups**: Select "Cellule"
- **Save**

### 8. Test Student Signup
Go to: http://localhost:8000/signup/

Fill in the form:
- **First Name**: Ahmed
- **Last Name**: Kamdem
- **Matricule**: 21G00001
- **Class Level**: Licence 3
- **Field**: Génie Logiciel
- **Password**: testpass123
- **Confirm Password**: testpass123

Click **S'inscrire**

You'll be automatically logged in and redirected to the student dashboard!

---

## Testing Complete Workflow

### As a Student:

1. **Dashboard**: http://localhost:8000/student/dashboard/
   - View statistics
   - See recent requests

2. **Create Request**:
   - Click "Nouvelle requête"
   - Fill the form:
     - Class Level: Licence 3
     - Field: Génie Logiciel
     - Subject: Programmation Web
     - Type: CC (or EXAM)
     - Description: "Je demande la révision de ma note du CC1..."
   - Submit

3. **View Requests**:
   - Go to "Mes requêtes"
   - Filter by status/type
   - Click on a request to see details

4. **Request Detail**:
   - See progress map
   - View QR code
   - Print the request

5. **Logout**: Click Déconnexion

---

### As a Lecturer:

1. **Login**: http://localhost:8000/login/
   - Matricule: lect001
   - Password: (your password)

2. **Dashboard**: http://localhost:8000/staff/dashboard/
   - View assigned requests
   - See statistics

3. **Acknowledge Request**:
   - Go to "Requêtes assignées"
   - Click on a request with status "Envoyée"
   - Click "Accuser réception"
   - Status changes to "Reçue"

4. **Make Decision**:
   - Click "Prendre une décision"
   - Select "Approuvée" or "Rejetée"
   - Add reason
   - Submit

5. **Send to Cellule** (if approved):
   - Click "Envoyer à la cellule"
   - Status changes to "En cellule"

6. **Logout**

---

### As Cellule Member:

1. **Login**: http://localhost:8000/login/
   - Matricule: cellule01
   - Password: (your password)

2. **Dashboard**: http://localhost:8000/cellule/dashboard/
   - View requests in cellule

3. **Process Request**:
   - Go to "Requêtes en cellule"
   - Click on a request
   - Click "Retourner au responsable"
   - Add optional note
   - Submit
   - Status changes to "Retournée"

4. **Logout**

---

### As Lecturer Again (Complete):

1. **Login** as lecturer

2. **Complete Request**:
   - Go to requests list
   - Find the "Retournée" request
   - Click "Marquer comme terminée"
   - Enter new score (e.g., 15)
   - Add comment
   - Submit
   - Status changes to "Terminée"

3. **Logout**

---

### As Student Again:

1. **Login** as student

2. **View Result**:
   - Go to request detail
   - See final status "Terminée"
   - View new score and comments
   - See complete audit history

3. **Test QR Code**:
   - Scan QR code or copy URL
   - Access public view
   - See request status without login

---

## Quick Test URLs

| Role | URL | Purpose |
|------|-----|---------|
| Public | http://localhost:8000/ | Landing page |
| Public | http://localhost:8000/signup/ | Student registration |
| Public | http://localhost:8000/login/ | Login |
| Student | http://localhost:8000/student/dashboard/ | Dashboard |
| Student | http://localhost:8000/student/requests/ | My requests |
| Student | http://localhost:8000/student/requests/create/ | New request |
| Staff | http://localhost:8000/staff/dashboard/ | Staff dashboard |
| Staff | http://localhost:8000/staff/requests/ | Assigned requests |
| Cellule | http://localhost:8000/cellule/dashboard/ | Cellule dashboard |
| Cellule | http://localhost:8000/cellule/requests/ | Cellule requests |
| Public | http://localhost:8000/public/request/<uuid>/ | QR code view |
| API | http://localhost:8000/api/ | REST API |
| API Docs | http://localhost:8000/api/schema/swagger-ui/ | Swagger UI |
| Admin | http://localhost:8000/admin/ | Django Admin |

---

## Common Issues

### Issue: "No such table" error
**Solution**: Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Issue: QR code not showing
**Solution**: Install qrcode package
```bash
pip install qrcode
```

### Issue: Static files not loading
**Solution**: Collect static files
```bash
python manage.py collectstatic --noinput
```

### Issue: Permission denied
**Solution**: Make sure lecturer has subjects assigned and HOD flag is set correctly

### Issue: "Cellule" group not found
**Solution**: Create "Cellule" group in Django Admin (exact name: "Cellule")

---

## Test Credentials Template

Create a test_accounts.txt file with:

```
=== STUDENT ===
Matricule: 21G00001
Password: testpass123
Name: Ahmed Kamdem
Role: Student - Licence 3 Génie Logiciel

=== LECTURER (HOD) ===
Username: lect001
Password: testpass456
Name: Jean Dupont
Role: HOD - Génie Logiciel

=== LECTURER (Regular) ===
Username: lect002
Password: testpass789
Name: Marie Nkoa
Role: Lecturer - Réseaux

=== CELLULE ===
Username: cellule01
Password: cellpass123
Name: Paul Fotso
Role: Cellule Informatique

=== ADMIN ===
Username: admin
Password: adminpass
Name: Administrateur
Role: Superuser
```

---

## Success Indicators ✅

After setup, you should be able to:

- [x] Students can signup and login
- [x] Students can create requests
- [x] Requests are auto-assigned to lecturers
- [x] Lecturers can view assigned requests
- [x] Lecturers can acknowledge, approve/reject
- [x] Lecturers can send to cellule
- [x] Cellule can view and return requests
- [x] Lecturers can complete requests
- [x] Students can view results
- [x] QR codes work for all requests
- [x] Print functionality works
- [x] Filters work on all list pages
- [x] Audit logs are created
- [x] Notifications are sent

---

## Next Steps After Testing

1. **Customize** CSS colors/branding in static/css/main.css
2. **Add** more test data (students, lecturers, subjects)
3. **Optional**: Implement HTMX for dynamic interactions
4. **Optional**: Create custom admin dashboard
5. **Deploy** to production server

---

**The system is fully functional and ready for use!** 🎉

For detailed documentation, see:
- [FRONTEND_COMPLETE.md](FRONTEND_COMPLETE.md) - Complete implementation details
- [PROJET.md](PROJET.md) - Original specifications
- [API.md](API.md) - API documentation
