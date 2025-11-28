# Testing Checklist - Account Creation & Login

## 🧪 Pre-Testing Setup

### 1. Start the Servers

```powershell
# Option A: Use startup script
.\start-dev.ps1

# Option B: Manual start (two terminals)
# Terminal 1:
cd "D:\PROJET GLO5"
venv\Scripts\activate
python manage.py runserver

# Terminal 2:
cd "D:\PROJET GLO5\request_front_end"
npm run dev
```

### 2. Verify Servers Are Running

- Backend: http://localhost:8000/admin (should show Django admin login)
- Frontend: http://localhost:3000 (should show login page)

---

## ✅ Test 1: Signup Flow (New User)

### Steps:

1. **Navigate to Signup**
   - Go to: http://localhost:3000/signup
   - ✅ Page loads without errors

2. **Check Dynamic Dropdowns**
   - ✅ "Niveau" dropdown shows options (L1, L2, L3, M1, M2)
   - ✅ "Filière" dropdown is disabled initially
   - Select a "Niveau" (e.g., L2)
   - ✅ "Filière" dropdown becomes enabled and populates with fields

3. **Fill the Form**
   ```
   Prénom: TestUser
   Nom: Demo
   Matricule: DEMO2024001
   Niveau: L2
   Filière: GL - Génie Logiciel (or any available)
   Mot de passe: TestPassword123
   Confirmer le mot de passe: TestPassword123
   ```

4. **Submit and Verify**
   - Click "Créer un compte"
   - ✅ Success toast notification appears
   - ✅ Redirected to /login page

5. **Backend Verification**
   ```powershell
   # In Django shell
   python manage.py shell
   
   from django.contrib.auth.models import User
   user = User.objects.get(username='DEMO2024001')
   print(user.username)  # Should be 'DEMO2024001'
   print(user.first_name)  # Should be 'TestUser'
   print(user.student_profile.matricule)  # Should be 'DEMO2024001'
   ```

---

## ✅ Test 2: Login with Matricule

### Steps:

1. **Navigate to Login**
   - Go to: http://localhost:3000/login
   - ✅ Page loads

2. **Login with Matricule**
   ```
   Nom d'utilisateur: DEMO2024001
   Mot de passe: TestPassword123
   ```

3. **Verify Login**
   - Click "Se connecter"
   - ✅ Success toast notification
   - ✅ Redirected to /student/dashboard
   - ✅ Dashboard shows "Bienvenue, TestUser"
   - ✅ Statistics show 0 requests (new user)

4. **Verify Session**
   - Open browser DevTools (F12)
   - Go to Application > Cookies > http://localhost:3000
   - ✅ `sessionid` cookie exists
   - ✅ `csrftoken` cookie exists

---

## ✅ Test 3: Login with Test Data

### Setup:

```powershell
python manage.py populate_testdata
```

### Test Users:

| Role | Username (Matricule) | Password |
|------|---------------------|----------|
| Student | `student1` | `password123` |
| Lecturer | `lecturer1` | `password123` |
| HOD | `hod1` | `password123` |
| IT Cell | `cellule1` | `password123` |

### Test Each Role:

#### Student Login
1. Login with: `student1` / `password123`
2. ✅ Redirected to `/student/dashboard`
3. ✅ Can see "Nouvelle Requête" button
4. ✅ Can see their requests (if any)

#### Lecturer Login
1. Logout first
2. Login with: `lecturer1` / `password123`
3. ✅ Redirected to `/staff/dashboard`
4. ✅ Can see assigned requests
5. ✅ Can see statistics

#### IT Cell Login
1. Logout first
2. Login with: `cellule1` / `password123`
3. ✅ Redirected to `/cellule/dashboard`
4. ✅ Can see requests in cellule

---

## ✅ Test 4: API Endpoints (Without Auth)

### Test Public Endpoints:

Using browser or curl:

```bash
# Test Class Levels (no auth needed)
curl http://localhost:8000/api/classlevels/

# Expected: JSON array of class levels
```

```bash
# Test Fields (no auth needed)
curl http://localhost:8000/api/fields/

# Expected: JSON array of fields
```

```bash
# Test Fields Filtered by Level (no auth needed)
curl http://localhost:8000/api/fields/?level_id=2

# Expected: JSON array of fields for that level
```

### Test Protected Endpoints (Should Fail):

```bash
# Test Subjects (auth required) - Should fail
curl http://localhost:8000/api/subjects/

# Expected: {"detail":"Authentication credentials were not provided."}
```

```bash
# Test Requests (auth required) - Should fail
curl http://localhost:8000/api/requests/

# Expected: {"detail":"Authentication credentials were not provided."}
```

---

## ✅ Test 5: Create a Request (End-to-End)

### Steps:

1. **Login as Student**
   - Use: `student1` / `password123` (or your test user)

2. **Navigate to Create Request**
   - Click "Nouvelle Requête" or go to: http://localhost:3000/student/create-request

3. **Fill Request Form**
   - ✅ Niveau dropdown loads
   - ✅ Filière dropdown loads based on niveau
   - ✅ Matière dropdown loads based on filière + niveau
   - Select all required fields
   - Add description
   - Select type (CC or EXAM)

4. **Submit**
   - ✅ Request is created
   - ✅ Redirected to requests list or dashboard
   - ✅ New request appears in the list

5. **Verify Backend**
   ```powershell
   python manage.py shell
   
   from requests_app.models import Request
   req = Request.objects.latest('submitted_at')
   print(req.student.matricule)  # Your matricule
   print(req.status)  # Should be 'sent'
   print(req.assigned_to)  # Should be assigned to lecturer/HOD
   ```

---

## ✅ Test 6: Request Workflow

### Setup:
Login as different roles to test workflow

### Test Transitions:

1. **Student Creates** (already tested above)
   - Status: `sent` ✅

2. **Staff Acknowledges**
   - Login as `lecturer1`
   - Go to request detail
   - Click "Acknowledge" or similar action
   - ✅ Status changes to `received`

3. **Staff Approves**
   - Click "Approve"
   - ✅ Status changes to `approved`

4. **Send to Cellule**
   - Click "Send to IT Cell"
   - ✅ Status changes to `in_cellule`

5. **Cellule Returns**
   - Logout, login as `cellule1`
   - Find the request
   - Click "Return"
   - ✅ Status changes to `returned`

6. **Staff Completes**
   - Logout, login as lecturer
   - Go to returned request
   - Click "Complete" with final result
   - ✅ Status changes to `done`
   - ✅ Request result is recorded

---

## 🔍 Browser Console Checks

### During Signup/Login:

Open DevTools (F12) > Console tab

**Look for:**
- ✅ No 403 CSRF errors
- ✅ No 401 authentication errors
- ✅ No CORS errors
- ✅ API calls succeed (200 status)

**Common Errors to Watch For:**

❌ **CORS Error:**
```
Access to fetch at 'http://localhost:8000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Fix:** Check `CORS_ALLOWED_ORIGINS` in Django settings

❌ **CSRF Error:**
```
{"detail":"CSRF Failed: CSRF token missing or incorrect."}
```
**Fix:** Check CSRF cookie and token handling in API client

❌ **Authentication Error:**
```
{"detail":"Authentication credentials were not provided."}
```
**Fix:** Check session cookie is being sent with requests

---

## 📊 Expected Results Summary

### After All Tests:

✅ **Signup:**
- New users can create accounts using matricule
- Dropdowns load without authentication
- Account creation succeeds

✅ **Login:**
- Users can login with matricule (as username)
- Redirected to correct dashboard based on role
- Session persists across page refreshes

✅ **Dashboards:**
- Student sees their requests only
- Staff sees assigned requests
- IT Cell sees requests in cellule
- Statistics are accurate

✅ **Request Creation:**
- Students can create requests
- Requests auto-assigned correctly
- Status tracking works

✅ **Workflow:**
- All status transitions work
- Permissions enforced correctly
- Notifications created

---

## 🚨 Troubleshooting

### Signup Dropdowns Don't Load

**Check:**
1. Backend is running
2. Console for errors
3. Network tab shows requests to `/api/classlevels/` and `/api/fields/`
4. Django settings have correct CORS configuration

**Fix:**
```python
# In settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Login Fails with Matricule

**Check:**
1. User was created with matricule as username
2. Password is correct (min 8 chars)
3. Session cookies are enabled

**Verify in Django:**
```python
python manage.py shell
from django.contrib.auth.models import User
user = User.objects.get(username='YOUR_MATRICULE')
print(user.check_password('YOUR_PASSWORD'))  # Should be True
```

### Dashboard Shows No Data

**Check:**
1. User is properly authenticated
2. Requests exist in database
3. Console for API errors

**Verify:**
- Go to: http://localhost:8000/api/requests/ (in browser while logged in)
- Should see JSON data

---

## ✨ Success Criteria

All tests pass when:

- [x] Can create account without authentication
- [x] Matricule is used as username
- [x] Can login with matricule
- [x] Redirected to correct dashboard
- [x] Dashboards show real data
- [x] Can create requests
- [x] Workflow transitions work
- [x] No console errors
- [x] Sessions persist

---

**Testing Date:** __________

**Tester Name:** __________

**Result:** ⬜ PASS  ⬜ FAIL  ⬜ PARTIAL

**Notes:**
___________________________________
___________________________________
___________________________________


