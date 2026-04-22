# HRMO Backend - FastAPI + Local PostgreSQL

Backend API for HRMO built with FastAPI, SQLAlchemy/SQLModel, and Alembic.

This backend is configured for local development using:
- Local PostgreSQL (Docker or host machine)
- Local certificate file storage under `backend/uploads/certificates`

## Prerequisites

- Python 3.11+
- PostgreSQL (local install or Docker)
- pip

## Environment Configuration

The project uses a single environment file at repository root:

```bash
.env.local
```

Core backend variables:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/hrmo
DOCKER_DATABASE_URL=postgresql://postgres:password@postgres:5432/hrmo
DATABASE_ECHO=false
DATABASE_POOL_SIZE=4
DATABASE_MAX_OVERFLOW=0
DATABASE_POOL_PRE_PING=true

ENV=development
HOST=0.0.0.0
PORT=8000
RELOAD=true

SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
DOCKER_FRONTEND_URL=http://frontend:3000
DOCKER_BACKEND_URL=http://backend:8000

BACKEND_API_URL=http://backend:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

If running backend inside Docker Compose, backend service uses `DOCKER_DATABASE_URL` from `.env.local`.

## Initial Users

One initial account per role is configured in `.env.local` and can be seeded idempotently:

```bash
python scripts/seed_initial_users.py
```

Roles seeded:
- `admin`
- `president`
- `hr`
- `hr-assistant`
- `employee`

## Quick Start

1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

2. Run migrations

```bash
alembic upgrade head
```

3. Start API

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:create_app --factory --host 0.0.0.0 --port 8000 --reload
```

API docs: `http://localhost:8000/docs`

## Docker Compose Workflow

From repository root:

```bash
docker-compose --env-file .env.local up -d postgres backend frontend adminer
docker-compose --env-file .env.local exec backend alembic upgrade head
docker-compose --env-file .env.local exec backend python scripts/seed_initial_users.py
```

Service names (compose):
- `postgres`
- `adminer`
- `backend`
- `frontend`

Container names:
- `hrmo-postgres`
- `hrmo-adminer`
- `hrmo-backend`
- `hrmo-frontend`

## Migrations

Create migration:

```bash
alembic revision --autogenerate -m "describe change"
```

Apply migration:

```bash
alembic upgrade head
```

Rollback last migration:

```bash
alembic downgrade -1
```

## File Storage

Certificate uploads are saved locally in:

```bash
backend/uploads/certificates/<employee_no>/
```

Files are served via backend static route under:

```bash
/uploads/...
```

## Testing

Run tests:

```bash
pytest
```

## Troubleshooting

Database connection issues:
- Confirm PostgreSQL is running
- Confirm `DATABASE_URL` in `.env.local`
- Confirm DB user, password, and database exist

Migration issues:
- Check current revision with `alembic current`
- Inspect history with `alembic history`

Port conflicts:
- Change backend `PORT` in `.env.local`
- Or adjust published ports in compose config

## References

- FastAPI: https://fastapi.tiangolo.com
- SQLAlchemy: https://docs.sqlalchemy.org
- Alembic: https://alembic.sqlalchemy.org
