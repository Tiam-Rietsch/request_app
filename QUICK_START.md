# Quick Start Guide

## Backend (Docker)

### Start Backend Services

```bash
docker compose up -d --build
```

This will:
- Start PostgreSQL 15 database
- Build and start Django backend on port 8002
- Run migrations automatically

### Check Backend Status

```bash
docker compose ps
```

### View Backend Logs

```bash
docker compose logs -f backend
```

### Stop Backend

```bash
docker compose down
```

## Frontend (Local)

### Install Dependencies

```bash
cd request_front_end
npm install
# or
pnpm install
```

### Development Mode

```bash
npm run dev
```

The frontend will start on **http://localhost:3002** and connect to the backend at **http://localhost:8002**

### Production Deployment

```bash
cd request_front_end
bash deploy.sh
```

## Environment Variables

### Frontend

Create `request_front_end/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8002
```

### Backend

Backend environment variables are set in `docker-compose.yml`:
- `DB_NAME=requests_db`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_HOST=db`
- `DB_PORT=5432`

## Troubleshooting

### Backend not accessible

1. Check if containers are running:
   ```bash
   docker compose ps
   ```

2. Check backend logs:
   ```bash
   docker compose logs backend
   ```

3. Test backend directly:
   ```bash
   curl http://localhost:8002/api/
   ```

### Frontend can't connect to backend

1. Ensure backend is running on port 8002
2. Check `NEXT_PUBLIC_API_URL` in `.env.local` or verify it's set to `http://localhost:8002`
3. Check browser console for CORS errors
4. Verify backend CORS settings in `requests_system/settings.py`

### Database connection errors

1. Check PostgreSQL container is healthy:
   ```bash
   docker compose ps db
   ```

2. Check database logs:
   ```bash
   docker compose logs db
   ```

3. Access database directly:
   ```bash
   docker compose exec db psql -U postgres -d requests_db
   ```

## Access Points

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:8002/api/
- **API Documentation (Swagger)**: http://localhost:8002/api/schema/swagger-ui/
- **Django Admin**: http://localhost:8002/admin/
- **PostgreSQL**: localhost:5532 (external port, internal port is 5432)
