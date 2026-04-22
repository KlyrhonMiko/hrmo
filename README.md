# HRMO (HR Management Office) Application

Welcome to the HRMO project repository! This application is designed to manage employee records, onboarding, PDS (Personal Data Sheet) submissions, automated tracking of HR-assigned training, and robust role-based directory management.

## 🌟 System Architecture Overview

The HRMO system operates on a modern web stack, dividing responsibilities into distinct modules for optimal performance, maintainability, and scalability.

- **Frontend Configuration:** A Next.js (React) application ensuring a responsive, fluid user interface. It utilizes Tailwind CSS/shadcn for robust styling and components.
- **Backend Service:** A FastAPI (Python) service that handles all business logic, data validation, API endpoints, and direct database operations.
- **Database Architecture:** A solid PostgreSQL database that manages everything from users to complex training and PDS records. Alembic is used for database schema migrations.
- **Containerization:** A complete Docker Compose setup offering encapsulated frontend, backend, database, and database administration views.

### How the System Works as a Whole

1.  **Role-Based Access Control (RBAC):** The system defines strict roles (Admin, President, HR, HR Assistant, Employee) granting specific permissions. A central JWT authentication wrapper governs all frontend and backend routing securely. Expired tokens are tracked and trigger global application logouts to maintain strict security boundaries.
2.  **Employee Onboarding & PDS:** Employees complete a full Personal Data Sheet (PDS) form consisting of Personal, Family, Educational, and other operational details. The frontend UI auto-saves structured data locally via browser draft mechanisms across sessions. Only validated records proceed to database persistence.
3.  **HR Directory Management:** HR administrators can manage the employee directory efficiently. They edit PDS forms segment by segment and seamlessly adjust and verify employee statuses directly via a granular, table-separated modular frontend architecture.
4.  **Training & Event Processing:** Employees can submit training requests strictly via a system of upcoming HR-managed organizational events. Submissions are linked securely. Upon marking a training event as "Completed" in the main tracking console, the backend processes an automated cascade generating continuous training records for all registered individuals.
5.  **Predictive and Analytical Dashboards:** The platform leverages customized backend statistical endpoints to power analytical insights. Utilizing normalized metrics, it populates views such as the Alumni Analytics Dashboard demonstrating top factor impacts and detailed sub-skill breakdowns to predict employability.

---

## 🛠️ How to Setup and Configure

To guarantee a hassle-free start, ensure you have **Docker** and **Docker Compose** installed on your system. Using Docker is the heavily recommended approach for standard development and testing.

### 1. Environment Configuration

Before running the application, you must declare configurations via environment strings. 
Ensure an `.env.local` file is present strictly at the root folder `/`.

```bash
# Example syntax: copy the template configuration
cp .env.example .env.local
```

Inside `.env.local`, you will supply configurations for the Database, URL routing, Application preferences, Security keys, and initial default application accounts:

- **Database Tokens:** `DB_USER`, `DB_PASSWORD`, `DB_NAME` will be interpreted by Docker to spool the database image parameters.
- **Connectivity URIs:** Modify `DOCKER_DATABASE_URL`, `BACKEND_URL`, and `FRONTEND_URL` mappings. By default, they correspond safely to `http://localhost:3000` (Frontend) and `http://localhost:8000` (Backend).
- **Default Accounts:** Initial accounts are bootstrapped into the database automatically using values provided here (e.g., `INITIAL_ADMIN_USERNAME`, `INITIAL_HR_USERNAME`).

### 2. Launching with Docker (Recommended)

Start the entire application service cluster using Docker Compose:

```bash
docker compose up --build
```
This automated flow builds custom images and spins up:
- **hrmo-postgres:** The PostgreSQL Database mapping existing local stores via Volume bindings.
- **hrmo-adminer (Port 8001):** The Database Visualization User Interface attached natively to PostgreSQL.
- **hrmo-backend (Port 8000):** The primary FastAPI Python Service.
- **hrmo-frontend (Port 3000):** The Next.js Javascript End User View application.

---

## 🚀 How to Proceed (Development Flow)

With the Docker containers online, system actions are actively merged onto your terminal outputs representing traffic logs. While hot reloading relies on compose, sometimes it's preferred to launch servers explicitly on your host machine to benefit from quick type-checking tools.

### Backend Iterations

If making schema changes or directly interacting with the Python scripts inside `backend/`:
1. Keep the main PostgreSQL database container running.
2. Initialize and activate a Python virtual environment: `python -m venv .venv` then `source .venv/bin/activate` 
3. Move into the backend logic code: `cd backend`
4. Pull dependencies: `pip install -r requirements.txt`
5. Apply database definitions. Process Alembic Migrations if schema blueprints change: 
   ```bash
   alembic revision --autogenerate -m "Specify your schema update reason"
   alembic upgrade head
   ```

### Frontend Iterations

When revising UI layers inside `frontend/`:
1. Use hot reloading from Docker (Volume mappings sync your changes immediately into container output), or switch to running NPM scripts locally against standard backend endpoints.
2. Entering local node mode: `cd frontend`
3. Fetch or repair registry modules: `npm install`
4. Instantiate Next dev server communicating globally: `npm run dev`

### Project Quality & Production Checks

Before pushing branches or generating production images, certify code compliance against rule sets to prevent fatal errors scaling up:
- **Check Backend:** Use standard analysis suites via `pytest` for endpoint testing and `ruff check .` for Python form linting.
- **Check Frontend:** Audit JavaScript dependencies strictly using `npm run lint` and verify typed constructs via `npm run typecheck`.

> **Important Security Warning regarding production deployment**:
Be sure to explicitly rotate any default hash seeds like `SECRET_KEY=your-secret...` found within your environment configurations securely via environment pipeline processes in production releases.
