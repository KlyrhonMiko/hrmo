# Docker Setup Guide

This project uses Docker Compose to run all services in isolated containers with a **local PostgreSQL database** for development.

## Services

- **Frontend** (Next.js): http://localhost:3000
- **Backend** (FastAPI): http://localhost:8000
- **Database** (PostgreSQL): localhost:5432
- **Adminer** (Database UI): http://localhost:8001

## Database Setup

This setup uses a **local PostgreSQL database** (not Supabase). All data is stored locally in a Docker volume called `postgres_data`. You can start fresh at any time by running:
```bash
docker-compose --env-file .env.local down -v
docker-compose --env-file .env.local up -d
```

This will:
- Remove all existing data
- Recreate the PostgreSQL container
- Initialize a fresh database
- Create a new volume for data storage

## Prerequisites

- Docker and Docker Compose installed
- Linux or macOS (or Windows with WSL2)

## Quick Start

### 1. Set Environment Variables

Use `.env.local` in the project root as the single source of configuration.

Run compose with explicit env file:
```bash
docker-compose --env-file .env.local up -d
```

### 2. Build and Start Services

```bash
docker-compose --env-file .env.local up -d
```

This will:
- Build the backend and frontend images
- Start all services
- Initialize the database
- Wait for the database to be ready

### 3. Run Database Migrations (if needed)

While the containers are running:
```bash
docker-compose --env-file .env.local exec backend alembic upgrade head
```

### 4. Verify Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs (Swagger UI)
- Database Admin: http://localhost:8001

## Common Commands

### View logs
```bash
docker-compose --env-file .env.local logs -f               # All services
docker-compose --env-file .env.local logs -f backend       # Backend only
docker-compose --env-file .env.local logs -f frontend      # Frontend only
docker-compose --env-file .env.local logs -f postgres      # Database only
```

### Stop services
```bash
docker-compose --env-file .env.local down
```

### Stop and remove volumes (clean slate)
```bash
docker-compose --env-file .env.local down -v
```

### Rebuild images
```bash
docker-compose --env-file .env.local build --no-cache
```

### Execute commands in containers

```bash
# Backend shell
docker-compose --env-file .env.local exec backend bash

# Backend Python
docker-compose --env-file .env.local exec backend python

# Frontend shell
docker-compose --env-file .env.local exec frontend bash

# Database shell
docker-compose --env-file .env.local exec postgres psql -U postgres -d hrmo
```

### Run migrations
```bash
docker-compose --env-file .env.local exec backend alembic upgrade head
```

### Seed database
```bash
docker-compose --env-file .env.local exec backend python scripts/seed_data_entries.py
docker-compose --env-file .env.local exec backend python scripts/seed_initial_users.py
```

## Adminer Access

Navigate to http://localhost:8001:
- Server: `postgres` (Docker service name) or `hrmo-postgres` (container name)
- Username: `postgres`
- Password: `password`
- Database: `hrmo`

These credentials are defined in `.env.local` via `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

## Development Workflow

### Making changes

- **Frontend**: Changes are reflected automatically due to Next.js hot reload (volume mounted)
- **Backend**: Changes require a container restart due to import caching. Uvicorn reload may not catch all changes.

To restart a service:
```bash
docker-compose restart backend
# or
docker-compose restart frontend
```

### Rebuilding after dependency changes

If you modify `requirements.txt` or `package.json`:
```bash
docker-compose --env-file .env.local down
docker-compose --env-file .env.local build --no-cache
docker-compose --env-file .env.local up -d
```

## Troubleshooting

### Port already in use
If ports are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3000:3000"  # Change first 3000 to another port like 3001
```

### Database connection issues
Check database logs:
```bash
docker-compose --env-file .env.local logs postgres
```

Verify the connection string in backend logs matches the DB_* environment variables.

### Frontend can't reach backend
Ensure backend service is healthy:
```bash
docker-compose --env-file .env.local ps
```

Check CORS configuration in `backend/main.py` includes `http://frontend:3000`.

### Clean rebuild
```bash
docker-compose --env-file .env.local down -v
docker-compose --env-file .env.local build --no-cache
docker-compose --env-file .env.local up -d
```

## Environment Variables

The `.env.local` file in the project root is automatically loaded by Docker Compose. Available variables:

```
# Database
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=hrmo

DATABASE_URL=postgresql://postgres:password@localhost:5432/hrmo
DOCKER_DATABASE_URL=postgresql://postgres:password@postgres:5432/hrmo

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
DOCKER_FRONTEND_URL=http://frontend:3000
DOCKER_BACKEND_URL=http://backend:8000
BACKEND_API_URL=http://backend:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Application
ENV=development
NODE_ENV=development
PORT=8000

# Security (change in production!)
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Initial users (one per role)
INITIAL_ADMIN_USERNAME=admin
INITIAL_PRESIDENT_USERNAME=president
INITIAL_HR_USERNAME=hr
INITIAL_HR_ASSISTANT_USERNAME=hr.assistant
INITIAL_EMPLOYEE_USERNAME=employee
```

## Production Considerations

This setup is optimized for development. For production:

1. Remove volume mounts for code (use layers instead)
2. Remove `RELOAD: true` from backend
3. Set `NODE_ENV=production` for frontend
4. Use separate database backups strategy
5. Add reverse proxy (nginx) with SSL/TLS
6. Set up proper secret management
7. Add resource limits to services
8. Use managed database services
