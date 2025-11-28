# Grade Contestation System - Next.js Frontend

A modern, full-stack grade contestation management system built with Next.js 16 and Django REST Framework.

## 🚀 Quick Start

```powershell
# Start both servers at once
.\start-dev.ps1
```

Then open: http://localhost:3000

## 📖 Documentation

- **[QUICK_START_NEXTJS.md](./QUICK_START_NEXTJS.md)** - Quick start guide & testing
- **[SETUP_AND_RUN.md](./SETUP_AND_RUN.md)** - Detailed setup instructions
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Implementation details

## 🔑 Test Credentials

After running `python manage.py populate_testdata`:

| Role | Username | Password |
|------|----------|----------|
| Student | `student1` | `password123` |
| Lecturer | `lecturer1` | `password123` |
| HOD | `hod1` | `password123` |
| IT Cell | `cellule1` | `password123` |
| Admin | `admin` | `admin123` |

## ✅ Status

**All systems operational!** ✓

- ✅ Authentication & Authorization
- ✅ Student Dashboard & Workflows
- ✅ Staff Dashboard & Workflows
- ✅ IT Cell Dashboard & Workflows
- ✅ Real-time data from Django API
- ✅ French language interface
- ✅ Responsive design
- ✅ Dark mode support

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Next.js       │◄───────►│   Django REST   │
│   Frontend      │  HTTP   │   Backend       │
│  (Port 3000)    │         │  (Port 8000)    │
└─────────────────┘         └─────────────────┘
        │                           │
        │                           ▼
        │                   ┌─────────────┐
        │                   │  SQLite DB  │
        └───────────────────┤             │
          Session Cookies   └─────────────┘
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**
- Django 5.2
- Django REST Framework
- Session Authentication
- SQLite

## 📱 Features

### For Students
- Create grade contestation requests
- Track request status with visual progress
- View personal statistics
- Manage submitted requests

### For Staff/Lecturers
- View assigned requests
- Acknowledge and process requests
- Make approval decisions
- Send to IT cell for processing
- Complete requests with results

### For IT Cell
- View requests in processing queue
- Add technical notes
- Return processed requests
- View processing statistics

## 🔧 Manual Setup

### Backend
```powershell
cd "D:\PROJET GLO5"
venv\Scripts\activate
python manage.py runserver
```

### Frontend
```powershell
cd "D:\PROJET GLO5\request_front_end"
npm run dev
```

### Environment
Create `request_front_end/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 API Endpoints

- `POST /api/auth/login/` - Login
- `POST /api/auth/signup/` - Signup
- `GET /api/auth/me/` - Current user
- `GET /api/requests/` - List requests
- `POST /api/requests/` - Create request
- And more... (see API.md)

## 🐛 Troubleshooting

**Can't connect to backend?**
- Ensure Django is running on port 8000
- Check `.env.local` configuration

**Authentication errors?**
- Clear browser cookies
- Try incognito mode
- Check CORS settings

**No data showing?**
- Run `python manage.py populate_testdata`
- Check browser console for errors

## 📞 Support

Check the detailed documentation:
- Troubleshooting: `QUICK_START_NEXTJS.md`
- Setup issues: `SETUP_AND_RUN.md`
- Implementation: `IMPLEMENTATION_COMPLETE.md`

## 📝 License

Educational project for GLO5 course.

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** November 28, 2025

