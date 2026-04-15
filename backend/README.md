# HRMO Backend - FastAPI with Supabase & Alembic

A modern Python backend built with FastAPI, SQLAlchemy, and Alembic for database migrations, connected to Supabase PostgreSQL.

## Prerequisites

- Python 3.8+
- Supabase account with a PostgreSQL database
- pip or your preferred Python package manager

## Quick Start

### 1. Set Up Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use an existing one
3. Navigate to **Project Settings** → **Database**
4. Copy your connection details:
   - **Connection string**: `postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres`
   - **Project URL**: `https://[project-id].supabase.co`
   - **Anon Key**: Found in **Settings** → **API**
   - **Service Role Key**: Found in **Settings** → **API**

### 2. Configure Environment Variables

Update `.env.local` in the root directory with your Supabase credentials:

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT_ID.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Run Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations to your database
alembic upgrade head
```

### 5. Run the Development Server

```bash
python main.py
```

Or use uvicorn directly:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:5000`

Check the health status:
```bash
curl http://localhost:5000/health
```

## Project Structure

```
backend/
├── main.py                 # Application entry point
├── alembic/               # Database migrations
│   ├── env.py            # Alembic environment config
│   ├── script.py.mako    # Migration template
│   └── versions/         # Migration files
├── app/
│   ├── core.py           # FastAPI app factory
│   ├── db/
│   │   └── database.py   # Database configuration & session
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic request/response schemas
│   ├── api/
│   │   └── endpoints/    # API route handlers
│   └── services/         # Business logic layer
├── tests/                # Unit and integration tests
├── requirements.txt      # Python dependencies
└── .env.example         # Environment variable template
```

## Creating Models

Example: `app/models/user.py`

```python
from sqlalchemy import Column, Integer, String
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
```

## Creating API Routes

Example: `app/api/endpoints/users.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

Register routes in `app/core.py`:

```python
from app.api.endpoints import users

def create_app() -> FastAPI:
    app = FastAPI()
    # ... middleware setup ...
    app.include_router(users.router)
    return app
```

## Database Migrations

### Create a new migration

```bash
alembic revision --autogenerate -m "Add user table"
```

### Apply migrations

```bash
alembic upgrade head
```

### Rollback migrations

```bash
alembic downgrade -1  # Rollback one migration
alembic downgrade base  # Rollback all migrations
```

### View migration history

```bash
alembic current  # Show current revision
alembic history  # Show all revisions
```

## Testing

Run tests with pytest:

```bash
pytest
```

Run tests with coverage:

```bash
pytest --cov=app tests/
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection | `postgresql://...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anonymous key | `eyJ0eXAi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ0eXAi...` |
| `ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `5000` |
| `HOST` | Server host | `0.0.0.0` |
| `SECRET_KEY` | JWT secret key | Your secret |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `SQL_ECHO` | Log SQL statements | `true`/`false` |

## Integration with Frontend

The frontend is configured to communicate with this backend at `http://localhost:5000` in development mode. Make sure:

1. Backend is running on port 5000
2. `CORS_ORIGINS` includes your frontend URL in `.env.local`
3. Frontend calls API endpoints relative to the backend URL

Example frontend API call:

```typescript
const response = await fetch('http://localhost:5000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', name: 'John' })
});
```

## Useful Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Start development server with auto-reload
python main.py

# Create database migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Run tests
pytest

# Format code with black
black app/

# Check code style
flake8 app/
```

## Troubleshooting

### Connection refused to Supabase

- Verify DATABASE_URL is correct in `.env.local`
- Check that Supabase project is active
- Ensure your IP is not blocked by Supabase firewall

### Migration conflicts

- Delete conflicting migration files from `alembic/versions/`
- Ensure you're on the correct database state before creating new migrations

### Port already in use

```bash
# Change port in .env.local or run on different port
PORT=8000 python main.py
```

## Production Deployment

For production:

1. Set `ENV=production`
2. Use a strong `SECRET_KEY`
3. Disable `SQL_ECHO`
4. Use proper database backups
5. Implement proper error logging
6. Use environment-specific variable files

## Further Reading

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org)
- [Alembic Tutorial](https://alembic.sqlalchemy.org)
- [Supabase Documentation](https://supabase.com/docs)
