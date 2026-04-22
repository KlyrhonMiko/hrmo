# Database Migration: Online → Local

## Summary

Your project has been configured to use a **local PostgreSQL database** running in Docker instead of an online service (Supabase). This is ideal for development.

## What Changed

### 1. Environment Configuration
- Updated `.env.local` as the single environment file for all configuration
- Removed `.env.docker` (consolidating to `.env.local` only)
- Database URL for local tools: `postgresql://postgres:password@localhost:5432/hrmo`
- Database URL for backend container: `postgresql://postgres:password@postgres:5432/hrmo`

### 2. Database Details
- **Host**: `postgres` (Docker service name) or `localhost` (when connecting from host)
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: `password`
- **Database**: `hrmo`
- **Storage**: Docker volume `postgres_data` (persists between container restarts)

### 3. File Storage
- Files are stored **locally** at `backend/uploads/certificates/`
- Supabase storage is not configured for development
- Supabase environment variables are optional and can be added later for production

## Getting Started with Local Database

### Step 1: Start Docker Services
```bash
cd /mnt/sdb4/Programming/Python/Web Projects/hrmo
docker-compose --env-file .env.local up -d
```

### Step 2: Initialize Database Schema
Run migrations to create tables:
```bash
docker-compose --env-file .env.local exec backend alembic upgrade head
```

### Step 3: Seed Sample Data (Optional)
```bash
docker-compose --env-file .env.local exec backend python scripts/seed_data_entries.py
docker-compose --env-file .env.local exec backend python scripts/seed_initial_users.py
```

### Step 4: Verify Everything Works
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs
- Database Admin: http://localhost:8001

## Adminer Access
Navigate to http://localhost:8001/
- Server: `postgres`
- Username: `postgres`
- Password: `password`
- Database: `hrmo`

## Starting Fresh
To completely reset the database and start from scratch:
```bash
docker-compose --env-file .env.local down -v          # Remove containers and volumes
docker-compose --env-file .env.local up -d            # Recreate everything fresh
docker-compose --env-file .env.local exec backend alembic upgrade head  # Create schema
```

## Common Tasks

### View Backend Logs
```bash
docker-compose --env-file .env.local logs -f backend
```

### Access Database Shell
```bash
docker-compose --env-file .env.local exec postgres psql -U postgres -d hrmo
```

### Stop Services
```bash
docker-compose --env-file .env.local down
```

### Rebuild Images
```bash
docker-compose --env-file .env.local build --no-cache
```

## Switching Back to Production/Supabase

To use Supabase later:
1. Set these environment variables in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@supabase-host/database
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
2. The file handler will automatically use Supabase storage if configured

## Notes
- No data migration was needed (fresh start as requested)
- All changes are development-focused
- Production deployment should use managed databases and proper secret management
- Certificate uploads are stored locally but can be switched to Supabase storage
