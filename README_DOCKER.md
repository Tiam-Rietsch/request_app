# Docker Deployment Guide

## Quick Start

Deploy everything with one command:

```bash
docker compose up -d --build
```

## Services

- **Backend**: Django REST API running on port `8002`
- **Frontend**: Next.js app running on port `3002` (managed by PM2)

## Access

- Frontend: http://localhost:3002
- Backend API: http://localhost:8002/api/

## Environment Variables

The frontend automatically uses `http://localhost:8002` as the API URL via `NEXT_PUBLIC_API_URL`.

## CORS Configuration

CORS is configured to allow requests from:
- http://localhost:3000 (development)
- http://localhost:3002 (Docker deployment)

## Volumes

- Database: `./db.sqlite3` (persisted)
- Media files: `./media` (persisted)

## Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build

# Stop and remove volumes
docker compose down -v
```

