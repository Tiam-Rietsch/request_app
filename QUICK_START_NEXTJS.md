# Quick Start Guide - Next.js Frontend with Django Backend

## 🚀 Quick Setup (5 minutes)

### Step 1: Prepare Backend

```powershell
# Navigate to project directory
cd "D:\PROJET GLO5"

# Activate virtual environment
venv\Scripts\activate

# Run migrations (if not done)
python manage.py migrate

# Populate test data
python manage.py populate_testdata
```

### Step 2: Create Frontend Environment File

Create `.env.local` in `request_front_end` folder with:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Start Both Servers

**Option A: Use the startup script**
```powershell
.\start-dev.ps1
```

**Option B: Manual start**

Terminal 1 (Backend):
```powershell
cd "D:\PROJET GLO5"
venv\Scripts\activate
python manage.py runserver
```

Terminal 2 (Frontend):
```powershell
cd "D:\PROJET GLO5\request_front_end"
npm run dev
```

### Step 4: Access the Application

Open your browser and go to: **http://localhost:3000**

## 📝 Test User Credentials

After running `populate_testdata`, you'll have these test users:

### Students
- **Username**: `student1` | **Password**: `password123`
- **Username**: `student2` | **Password**: `password123`

### Lecturers/Staff
- **Username**: `lecturer1` | **Password**: `password123`
- **Username**: `hod1` | **Password**: `password123`

### IT Cell/Cellule
- **Username**: `cellule1` | **Password**: `password123`

### Admin
- **Username**: `admin` | **Password**: `admin123`

## ✅ Features Implemented

### Authentication & Authorization ✓
- ✅ Login with session-based authentication
- ✅ Signup for students
- ✅ Role-based access control
- ✅ Automatic dashboard redirection based on role

### Student Features ✓
- ✅ View personal dashboard with statistics
- ✅ Create new grade contestation requests
- ✅ View all personal requests
- ✅ Track request status with visual progress map
- ✅ View request details

### Staff/Lecturer Features ✓
- ✅ View dashboard with assigned requests
- ✅ Statistics and charts
- ✅ Acknowledge requests (sent → received)
- ✅ Make decisions (approve/reject)
- ✅ Send requests to IT cell
- ✅ Complete requests with final results

### IT Cell Features ✓
- ✅ View all requests in cellule
- ✅ Processing statistics and trends
- ✅ Return requests to staff
- ✅ Upload attachments

### General Features ✓
- ✅ Real-time data from Django API
- ✅ Responsive design (mobile-friendly)
- ✅ Dark/Light theme support
- ✅ French language interface
- ✅ Toast notifications for user actions
- ✅ Loading states and error handling

## 🧪 Testing the Application

### 1. Test Authentication

1. Go to http://localhost:3000/login
2. Try logging in with `student1` / `password123`
3. You should be redirected to the student dashboard
4. Logout and try with other roles

### 2. Test Student Workflow

1. Login as `student1`
2. Click "Nouvelle Requête" (New Request)
3. Fill out the form:
   - Select a class level
   - Select a field (filière)
   - Select a subject (matière)
   - Choose type (CC or EXAM)
   - Add a description
4. Submit the request
5. View it in your dashboard

### 3. Test Staff Workflow

1. Login as `lecturer1` or `hod1`
2. View assigned requests
3. Click on a request to view details
4. Acknowledge the request
5. Make a decision (approve/reject)
6. If approved, send to IT cell
7. After IT cell returns it, complete with final result

### 4. Test IT Cell Workflow

1. Login as `cellule1`
2. View requests in cellule
3. Click on a request
4. Add notes or attachments
5. Return request to staff

## 🐛 Troubleshooting

### Frontend won't connect to backend
- Ensure Django server is running on port 8000
- Check `.env.local` has correct API URL
- Clear browser cache and cookies

### Authentication errors
- Check CORS settings in Django `settings.py`
- Verify `CSRF_TRUSTED_ORIGINS` includes localhost:3000
- Try incognito/private browsing mode

### No data showing
- Run `python manage.py populate_testdata` to create test data
- Check browser console for API errors
- Verify Django migrations are applied

### Port already in use
- Backend: `python manage.py runserver 8001` (change port)
- Frontend: `npm run dev -- --port 3001` (change port)
- Update `.env.local` accordingly

## 📁 Project Structure

```
PROJET GLO5/
├── request_front_end/        # Next.js Frontend
│   ├── app/                  # Pages (using App Router)
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   ├── student/         # Student dashboard & pages
│   │   ├── staff/           # Staff dashboard & pages
│   │   └── cellule/         # IT Cell dashboard & pages
│   ├── components/           # Reusable components
│   │   ├── ui/              # UI components (shadcn/ui)
│   │   └── shared/          # Shared components
│   └── lib/                 # Utilities
│       ├── api.ts           # API client (communicates with Django)
│       ├── auth-context.tsx # Authentication context
│       └── utils.ts         # Helper functions
│
├── requests_app/            # Django App
│   ├── models.py            # Database models
│   ├── views.py             # DRF ViewSets
│   ├── views_api_auth.py    # API auth endpoints
│   ├── serializers.py       # DRF Serializers
│   ├── permissions.py       # Custom permissions
│   └── urls.py              # URL routing
│
└── requests_system/         # Django Project
    └── settings.py          # Project settings (CORS, etc.)
```

## 🔧 API Endpoints

The frontend communicates with these Django API endpoints:

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/signup/` - Student registration
- `GET /api/auth/me/` - Get current user info

### Resources
- `GET /api/classlevels/` - List class levels
- `GET /api/fields/` - List fields/filières
- `GET /api/axes/` - List axes
- `GET /api/subjects/` - List subjects

### Requests (Main Resource)
- `GET /api/requests/` - List requests (filtered by role)
- `POST /api/requests/` - Create request (students only)
- `GET /api/requests/{id}/` - Get request details
- `PATCH /api/requests/{id}/` - Update request
- `POST /api/requests/{id}/acknowledge/` - Acknowledge request
- `POST /api/requests/{id}/decision/` - Make decision
- `POST /api/requests/{id}/send_to_cellule/` - Send to IT cell
- `POST /api/requests/{id}/return_from_cellule/` - Return from IT cell
- `POST /api/requests/{id}/complete/` - Complete with final result
- `POST /api/requests/{id}/upload_attachment/` - Upload attachment

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/{id}/mark_read/` - Mark as read
- `GET /api/notifications/unread_count/` - Get unread count

## 📚 Next Steps

1. **Customize the UI**: Edit components in `request_front_end/components/`
2. **Add Features**: Extend models in Django and update the frontend
3. **Deploy**: Follow deployment guides for Django and Next.js
4. **Security**: Update SECRET_KEY, enable HTTPS, configure production settings

## 💡 Tips

- Use browser DevTools (F12) to inspect API calls
- Check Django console for backend errors
- Check Next.js terminal for frontend errors
- Use Swagger UI at http://localhost:8000/api/schema/swagger-ui/ to test API

## 🎉 You're All Set!

The application is now fully functional with real data from the Django backend. All authentication, authorization, and CRUD operations work correctly.

Enjoy coding! 🚀

