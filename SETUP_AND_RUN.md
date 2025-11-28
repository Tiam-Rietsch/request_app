# Setup and Run Guide

This guide will help you set up and run both the Django backend and Next.js frontend.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- Git (optional)

## Backend Setup (Django)

### 1. Navigate to project root

```bash
cd "D:\PROJET GLO5"
```

### 2. Activate virtual environment

```bash
venv\Scripts\activate
```

### 3. Install dependencies (if not already done)

```bash
pip install -r requirements.txt
```

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Create superuser (optional, for admin access)

```bash
python manage.py createsuperuser
```

### 6. Populate test data (optional)

```bash
python manage.py populate_testdata
```

### 7. Start Django development server

```bash
python manage.py runserver
```

The backend will be running at: http://localhost:8000

## Frontend Setup (Next.js)

### 1. Open a NEW terminal and navigate to frontend directory

```bash
cd "D:\PROJET GLO5\request_front_end"
```

### 2. Install dependencies (if not already done)

```bash
npm install
```

### 3. Create environment file

Create a file named `.env.local` in the `request_front_end` directory with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Start Next.js development server

```bash
npm run dev
```

The frontend will be running at: http://localhost:3000

## Access the Application

1. Open your browser and go to: http://localhost:3000
2. You should see the login page
3. If you populated test data, use test credentials or create a new account via the signup page

## Test Accounts (if you ran populate_testdata)

The populate_testdata command creates test users. Check the command file for credentials.

## Troubleshooting

### CORS Errors

- Make sure both servers are running
- Check that CORS_ALLOWED_ORIGINS in Django settings.py includes http://localhost:3000
- Clear browser cache and cookies

### Authentication Issues

- Make sure cookies are enabled in your browser
- Check that SESSION_COOKIE_SAMESITE and CSRF_COOKIE_SAMESITE are set correctly
- Try clearing browser cookies for localhost

### Database Errors

- Run migrations: `python manage.py migrate`
- If needed, delete db.sqlite3 and run migrations again

### Frontend Build Errors

- Delete node_modules and package-lock.json
- Run `npm install` again
- Make sure you're using Node.js 18 or higher

## Development Workflow

1. **Backend changes**: Edit files in `requests_app/` or `requests_system/`
   - Django auto-reloads on file changes
   
2. **Frontend changes**: Edit files in `request_front_end/app/` or `request_front_end/components/`
   - Next.js auto-reloads on file changes

3. **API changes**: If you modify API endpoints or serializers, update the frontend API client in `request_front_end/lib/api.ts`

## Quick Start Script

### Windows (PowerShell)

Create a file `start-dev.ps1`:

```powershell
# Start Django backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\PROJET GLO5'; venv\Scripts\activate; python manage.py runserver"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Next.js frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\PROJET GLO5\request_front_end'; npm run dev"
```

Run it with: `.\start-dev.ps1`

## API Documentation

Once the Django server is running, you can access:
- Swagger UI: http://localhost:8000/api/schema/swagger-ui/
- ReDoc: http://localhost:8000/api/schema/redoc/

## Project Structure

```
PROJET GLO5/
├── requests_app/          # Django app with models, views, serializers
├── requests_system/       # Django project settings
├── request_front_end/     # Next.js frontend
│   ├── app/              # Next.js pages and routes
│   ├── components/       # React components
│   └── lib/              # API client and utilities
├── templates/            # Django templates (legacy, not used with Next.js)
├── static/               # Static files
├── media/                # User uploads
└── venv/                 # Python virtual environment
```

