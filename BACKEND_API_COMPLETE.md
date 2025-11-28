# Complete Backend API Documentation

## Overview

This document provides a comprehensive understanding of the backend API based on the Django models, serializers, views, and business requirements.

## 🔐 Authentication System

### How It Works
- **Session-based authentication** using Django sessions
- **Matricule as username** for students
- **CSRF protection** on all state-changing requests
- **Role-based access control** via Django groups and model relationships

### User Roles

1. **Student** (`student_profile`)
   - Has a `Student` model linked to `User`
   - Username = Matricule
   - Can create and view their own requests

2. **Lecturer** (`lecturer_profile`)
   - Has a `Lecturer` model linked to `User`
   - Can be assigned subjects
   - Sees requests assigned to them

3. **HOD (Head of Department)** (`lecturer_profile` with `is_hod=True`)
   - Special type of Lecturer
   - Has a `field` assigned
   - Sees all requests in their field
   - Receives EXAM type requests

4. **Cellule Informatique** (group: `cellule_informatique`)
   - Member of Django group
   - Sees only requests with status `in_cellule`
   - Processes technical aspects

5. **Super Admin** (`is_superuser=True`)
   - Full access to everything
   - Manages master data (levels, fields, axes, subjects)

## 📊 Data Models Hierarchy

```
ClassLevel (Niveau)
    └── Field (Filière) [M2M with ClassLevel]
            ├── Axis (Axe) [Optional subdivision]
            └── Subject (Matière) [M2M with ClassLevel]
                    └── Lecturer [M2M with Subject]

Student
    ├── User (OneToOne)
    ├── ClassLevel (FK)
    └── Field (FK, optional)

Lecturer
    ├── User (OneToOne)
    ├── Subjects (M2M)
    ├── is_hod (Boolean)
    └── field (FK, for HOD)

Request
    ├── student (FK to Student)
    ├── class_level (FK)
    ├── field (FK)
    ├── axis (FK, optional)
    ├── subject (FK)
    ├── type (cc/exam)
    ├── status (sent/received/approved/rejected/in_cellule/returned/done)
    ├── assigned_to (FK to User)
    ├── attachments (Reverse FK)
    ├── result (OneToOne)
    └── logs (Reverse FK)
```

## 🚀 API Endpoints

### Authentication Endpoints

#### `POST /api/auth/login/`
**Permission:** AllowAny

**Request:**
```json
{
  "username": "MT001234",  // Matricule for students
  "password": "password123"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "MT001234",
  "email": "",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",  // student | lecturer | hod | cellule | admin
  "student_profile": {
    "id": 1,
    "matricule": "MT001234",
    "class_level": 2,
    "class_level_name": "L2",
    "field": 1,
    "field_name": "Génie Logiciel"
  }
}
```

#### `POST /api/auth/logout/`
**Permission:** IsAuthenticated

**Response:** `{ "detail": "Déconnexion réussie" }`

#### `POST /api/auth/signup/`
**Permission:** AllowAny

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "matricule": "MT001234",  // Will become username
  "class_level": 2,         // ID of ClassLevel
  "field": 1,               // ID of Field (optional)
  "password": "password123"
}
```

**Response:**
```json
{
  "detail": "Inscription réussie",
  "user": {
    "id": 1,
    "username": "MT001234",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
  }
}
```

**Notes:**
- Username is automatically set to matricule
- Student profile is automatically created
- User is auto-logged in after signup

#### `GET /api/auth/me/`
**Permission:** IsAuthenticated

**Response:** Same as login response

---

### Master Data Endpoints

#### `GET /api/classlevels/`
**Permission:** AllowAny (for signup) ✓

**Response:**
```json
[
  {
    "id": 1,
    "name": "L1",
    "order": 1
  },
  {
    "id": 2,
    "name": "L2",
    "order": 2
  }
]
```

#### `GET /api/fields/`
**Permission:** AllowAny (for signup) ✓

**Query Params:**
- `level_id` (optional): Filter fields by class level

**Response:**
```json
[
  {
    "id": 1,
    "code": "GL",
    "name": "Génie Logiciel",
    "allowed_levels": [
      { "id": 2, "name": "L2", "order": 2 },
      { "id": 3, "name": "L3", "order": 3 }
    ]
  }
]
```

#### `GET /api/axes/`
**Permission:** IsAuthenticated

**Query Params:**
- `field` or `field_id`: Filter axes by field

**Response:**
```json
[
  {
    "id": 1,
    "code": "DEV",
    "name": "Développement",
    "field": 1,
    "field_name": "Génie Logiciel"
  }
]
```

#### `GET /api/subjects/`
**Permission:** IsAuthenticated

**Query Params:**
- `field_id` (optional): Filter by field
- `level_id` (optional): Filter by class level

**Response:**
```json
[
  {
    "id": 1,
    "code": "GL301",
    "name": "Algorithmique Avancée",
    "field": 1,
    "field_name": "Génie Logiciel",
    "class_levels": [
      { "id": 3, "name": "L3", "order": 3 }
    ]
  }
]
```

---

### Request Management Endpoints

#### `GET /api/requests/`
**Permission:** IsAuthenticated

**Filtering (automatic based on role):**
- **Student**: Only their own requests
- **Lecturer**: Requests assigned to them
- **HOD**: All requests in their field
- **Cellule**: Only requests with status `in_cellule`
- **Admin**: All requests

**Query Params:**
- `status`: Filter by status (sent, received, approved, etc.)
- `type`: Filter by type (cc, exam)

**Response:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/requests/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid-here",
      "student": 1,
      "student_display": "John Doe (MT001234)",
      "matricule": "MT001234",
      "student_name": "John Doe",
      "submitted_at": "2024-11-28T10:00:00Z",
      "class_level": 3,
      "class_level_display": "L3",
      "field": 1,
      "field_display": "Génie Logiciel",
      "axis": null,
      "axis_display": null,
      "subject": 1,
      "subject_display": "Algorithmique Avancée",
      "type": "exam",
      "type_display": "EXAM (Examen)",
      "description": "Je conteste ma note car...",
      "assigned_to": 5,
      "assigned_to_name": "Prof. Martin",
      "status": "sent",
      "status_display": "Envoyée",
      "closed_at": null,
      "can_edit": true,
      "attachments": [],
      "result": null,
      "logs": [
        {
          "id": 1,
          "action": "create",
          "from_status": null,
          "to_status": "sent",
          "actor": 1,
          "actor_name": "John Doe",
          "timestamp": "2024-11-28T10:00:00Z",
          "note": "Requête créée"
        }
      ]
    }
  ]
}
```

#### `POST /api/requests/`
**Permission:** IsStudent

**Request:**
```json
{
  "class_level": 3,
  "field": 1,
  "axis": null,          // Optional
  "subject": 1,
  "type": "exam",        // cc or exam
  "description": "Je conteste ma note car..."
}
```

**Auto-filled fields:**
- `student`: From authenticated user's student_profile
- `matricule`: From student profile
- `student_name`: From user's full name
- `status`: Set to "sent"
- `assigned_to`: Auto-assigned based on type:
  - **CC**: First lecturer assigned to the subject
  - **EXAM**: HOD of the field

**Response:** Full request object (same as GET)

---

### Request Workflow Actions

#### `POST /api/requests/{uuid}/acknowledge/`
**Permission:** IsAssignedStaff (assigned_to or HOD)

**Description:** Mark request as received

**Status Transition:** `sent` → `received`

**Request:** Empty body

**Response:** Updated request object

---

#### `POST /api/requests/{uuid}/decision/`
**Permission:** IsAssignedStaff

**Description:** Make initial approval decision

**Status Transitions:**
- `approved`: `sent`/`received` → `approved`
- `rejected`: `sent`/`received` → `done` (with result)

**Request:**
```json
{
  "decision": "approved",  // or "rejected"
  "reason": "Raison du rejet"  // Required if rejected
}
```

**Response:** Updated request object

**Side Effects:**
- If rejected: Creates `RequestResult` with status "rejected" and closes request
- Creates audit log
- Sends notification to student

---

#### `POST /api/requests/{uuid}/send_to_cellule/`
**Permission:** IsAssignedStaff

**Description:** Send approved request to IT cell for processing

**Status Transition:** `approved` → `in_cellule`

**Request:** Empty body

**Response:** Updated request object

**Side Effects:**
- Sends notification to all users in `cellule_informatique` group

---

#### `POST /api/requests/{uuid}/return_from_cellule/`
**Permission:** IsCellule (member of cellule_informatique group)

**Description:** Return processed request to staff

**Status Transition:** `in_cellule` → `returned`

**Request:** Empty body

**Response:** Updated request object

**Side Effects:**
- Sends notification to assigned staff member

---

#### `POST /api/requests/{uuid}/complete/`
**Permission:** IsAssignedStaff

**Description:** Finalize request with final result

**Status Transition:** `returned`/`approved` → `done`

**Request:**
```json
{
  "status": "accepted",     // or "rejected"
  "new_score": 15.5,        // Optional
  "reason": "Note rectifiée après vérification"  // Optional
}
```

**Response:** Updated request object

**Side Effects:**
- Creates `RequestResult` with final decision
- Sets `closed_at` timestamp
- Creates audit log
- Sends notification to student

---

#### `POST /api/requests/{uuid}/upload_attachment/`
**Permission:** CanUploadAttachment (owner or assigned staff)

**Description:** Upload a file attachment

**Request:** `multipart/form-data`
- `file`: File to upload

**Validation:**
- Max size: 20MB (configurable in settings)
- Allowed types: PDF, PNG, JPEG, DOCX

**Response:**
```json
{
  "id": 1,
  "filename": "document.pdf",
  "file": "/media/requests/2024/11/28/document.pdf",
  "mime_type": "application/pdf",
  "size": 123456,
  "uploaded_at": "2024-11-28T10:00:00Z",
  "uploaded_by": 1,
  "uploaded_by_name": "John Doe"
}
```

---

#### `GET /api/requests/{uuid}/print/`
**Permission:** IsRequestOwnerOrAssigned

**Description:** Get printable HTML version

**Response:** HTML page (not JSON)

---

### Notifications

#### `GET /api/notifications/`
**Permission:** IsAuthenticated

**Description:** List user's notifications

**Response:**
```json
[
  {
    "id": 1,
    "title": "Requête reçue",
    "body": "Votre requête pour Algorithmique Avancée a été prise en charge",
    "link": "/requests/uuid-here/",
    "read": false,
    "created_at": "2024-11-28T10:00:00Z"
  }
]
```

#### `POST /api/notifications/{id}/mark_read/`
**Permission:** IsAuthenticated (owner of notification)

**Response:** Updated notification

#### `GET /api/notifications/unread_count/`
**Permission:** IsAuthenticated

**Response:**
```json
{
  "unread_count": 5
}
```

---

## 🔄 Complete Request Workflow

### Flow Diagram

```
Student creates request
        ↓
    [sent] ← Student can still edit
        ↓
Staff acknowledges
        ↓
   [received]
        ↓
Staff makes decision
        ↓
    ┌───────┴───────┐
    ↓               ↓
[rejected]     [approved]
    ↓               ↓
[done] ←──┐    Send to cellule
           │         ↓
           │   [in_cellule]
           │         ↓
           │   Cellule processes
           │         ↓
           │   [returned]
           │         ↓
           └───  Complete
                     ↓
                 [done]
```

### Detailed Steps

1. **Student creates request** (`POST /api/requests/`)
   - Status: `sent`
   - Auto-assigned to lecturer (CC) or HOD (EXAM)
   - Student can edit while `sent`

2. **Staff acknowledges** (`POST /api/requests/{id}/acknowledge/`)
   - Status: `sent` → `received`
   - Student can no longer edit

3. **Staff makes initial decision** (`POST /api/requests/{id}/decision/`)
   - Option A: `approved` → Status: `approved`
   - Option B: `rejected` → Status: `done` (end of flow)

4. **If approved, send to cellule** (`POST /api/requests/{id}/send_to_cellule/`)
   - Status: `approved` → `in_cellule`
   - Cellule members get notified

5. **Cellule processes and returns** (`POST /api/requests/{id}/return_from_cellule/`)
   - Status: `in_cellule` → `returned`
   - Staff member gets notified

6. **Staff finalizes** (`POST /api/requests/{id}/complete/`)
   - Status: `returned` → `done`
   - Final result recorded (`accepted` or `rejected`)
   - Student gets notified

---

## 🔒 Permission Classes

### Custom Permissions

1. **IsStudent**: User has `student_profile`
2. **IsLecturer**: User has `lecturer_profile`
3. **IsHOD**: User has `lecturer_profile` with `is_hod=True`
4. **IsCellule**: User in `cellule_informatique` group
5. **IsSuperAdmin**: User is superuser
6. **IsAssignedStaff**: User is assigned to the request OR is HOD of the field
7. **IsRequestOwnerOrAssigned**: User is the student who created it OR assigned staff
8. **CanEditRequest**: Request owner and status is `sent`
9. **CanDeleteRequest**: Request owner and status is `sent`
10. **CanUploadAttachment**: Request owner OR assigned staff

---

## 📝 Business Rules

### Request Creation
- Only students can create requests
- Username must be matricule
- Request is auto-assigned based on type:
  - **CC**: First lecturer of the subject
  - **EXAM**: HOD of the field
- Status starts as `sent`

### Request Editing
- Students can only edit their own requests
- Only when status is `sent`
- Once acknowledged, no more edits

### Status Transitions
- Must follow the workflow (can't skip steps)
- Only assigned staff or HOD can change status
- Cellule can only return from `in_cellule`
- Once `done`, no more changes

### Notifications
- Created on every status change
- Sent to relevant parties:
  - Student: When their request is updated
  - Staff: When assigned a new request or request returns from cellule
  - Cellule: When request sent to them

### Audit Trail
- Every action creates an `AuditLog` entry
- Tracks: action, from_status, to_status, actor, timestamp, note
- Cannot be deleted or modified

---

## 🎯 Frontend Integration Points

### Signup Flow
1. Fetch class levels: `GET /api/classlevels/` (no auth needed)
2. Fetch fields: `GET /api/fields/?level_id={id}` (no auth needed)
3. Submit signup: `POST /api/auth/signup/` with matricule
4. Auto-login happens in backend
5. Redirect to dashboard

### Login Flow
1. Submit: `POST /api/auth/login/` with matricule (username)
2. Receive user data with role
3. Redirect based on role:
   - `student` → `/student/dashboard`
   - `lecturer` or `hod` → `/staff/dashboard`
   - `cellule` → `/cellule/dashboard`
   - `admin` → `/admin`

### Dashboard Data
- Students: `GET /api/requests/` (auto-filtered to their requests)
- Staff: `GET /api/requests/` (auto-filtered to assigned)
- Cellule: `GET /api/requests/` (auto-filtered to in_cellule)

### Creating a Request
1. Fetch class levels: `GET /api/classlevels/`
2. Fetch fields: `GET /api/fields/?level_id={id}`
3. Fetch subjects: `GET /api/subjects/?field_id={id}&level_id={id}`
4. Submit: `POST /api/requests/`

---

## 🔍 Important Notes

1. **Matricule is Username**: When students sign up or login, matricule = username
2. **Auto-assignment**: Requests are automatically assigned when created
3. **Role Detection**: Role is determined by:
   - Has `student_profile` → student
   - Has `lecturer_profile` with `is_hod=True` → hod
   - Has `lecturer_profile` → lecturer
   - In `cellule_informatique` group → cellule
   - Is superuser → admin
4. **Session-based Auth**: Uses Django sessions, not JWT
5. **CSRF Required**: All POST/PUT/PATCH/DELETE need CSRF token
6. **Filtering is Automatic**: ViewSets filter based on user role
7. **Permissions are Cumulative**: HOD has lecturer permissions + more

---

This document reflects the complete backend implementation as of November 28, 2025.

