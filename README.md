# SudoTask

SudoTask is a classroom code-grading platform where teachers create programming tasks and students submit code that is evaluated asynchronously in Docker-isolated runners.

## What it includes

- JWT authentication with teacher/student roles
- Classrooms with join codes
- Tasks with public/hidden test cases
- Asynchronous submission grading (Celery + Redis)
- Teacher/student dashboards built with Next.js

## Core stack

**Backend**
- Django + Django REST Framework
- PostgreSQL
- Celery + Redis
- Docker SDK (sandboxed execution)

**Frontend**
- Next.js (App Router) + React + TypeScript
- Tailwind + shadcn-style UI primitives
- Zustand for auth state

## Quick start (Docker recommended)

### 1) Clone and configure

```bash
git clone <repository-url>
cd SudoTask
cp .env.example .env
```

### 2) Start services

```bash
docker-compose up --build -d
docker-compose exec web python manage.py migrate
```

Optional:

```bash
docker-compose exec web python manage.py seed
```

### 3) Start frontend

```bash
cd "saa-s-web-app-ui (1)"
pnpm install
pnpm dev
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:8000/api`

### Production compose profile

For production-oriented container defaults (Gunicorn runtime and no public DB/Redis/Adminer ports), use:

```bash
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml exec web python manage.py migrate
```

This profile starts the frontend service with `next build` + `next start` and publishes:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8001/api`

## Local development (without backend Docker container)

You can run backend locally while keeping DB/Redis in Docker.

```bash
docker-compose up db redis -d
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

In another terminal:

```bash
cd backend
celery -A sudotask worker --loglevel=info
```

## Essential environment variables

Create `.env` in project root (copy from `.env.example`):

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
LOCAL_DEV_MODE=False
ALLOWED_HOSTS=your-domain.com
CSRF_TRUSTED_ORIGINS=https://your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com

# PostgreSQL
DB_NAME=sudotask
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Redis / Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Security / auth cookies
AUTH_COOKIE_SECURE=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
AUTH_COOKIE_SAMESITE=Lax
# AUTH_COOKIE_SAMESITE allowed values: Lax, Strict, None
# If AUTH_COOKIE_SAMESITE=None, AUTH_COOKIE_SECURE must be True

# Judge limits
JUDGE_DOCKER_IMAGE=python:3.11-slim
JUDGE_TIMEOUT_SECONDS=2
JUDGE_MEMORY_LIMIT_MB=256
JUDGE_CPU_LIMIT=0.5
```

Frontend optional (`saa-s-web-app-ui (1)/.env.local`):

```env
# Recommended for direct API calls (without Next.js rewrite)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

If `NEXT_PUBLIC_API_BASE_URL` is omitted, the frontend defaults to `/api` and relies on the Next.js rewrite in `next.config.mjs`.

For local backend (outside Docker), override `.env` values:
- `LOCAL_DEV_MODE=True`
- `DB_HOST=localhost`, `DB_PORT=5433`
- `CELERY_BROKER_URL=redis://localhost:6380/0`
- `CELERY_RESULT_BACKEND=redis://localhost:6380/0`
- `DEBUG=True`
- `ALLOWED_HOSTS=localhost,127.0.0.1`
- `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- `CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- `AUTH_COOKIE_SECURE=False`
- `SESSION_COOKIE_SECURE=False`
- `CSRF_COOKIE_SECURE=False`
- `SECURE_SSL_REDIRECT=False`

## Project layout (short)

```text
SudoTask/
├── backend/                  # Django API + Celery + judge
│   ├── accounts/
│   ├── classroom/
│   ├── tasks/
│   ├── submissions/
│   ├── judge/
│   └── sudotask/
├── saa-s-web-app-ui (1)/     # Next.js frontend
├── docker-compose.yml
└── .env.example
```

## API summary

Base: `http://localhost:8000/api`

Both slashless and slash-terminated API paths are supported (for example, `/tasks` and `/tasks/`) to stay compatible with frontend/proxy URL normalization.

- `GET /auth/csrf/`, `POST /auth/register/`, `POST /auth/login/`, `POST /auth/refresh/`, `POST /auth/logout/`
- `GET /auth/me/`, `PATCH /auth/me/update/`
- `GET/POST /classes/`, `POST /classes/join/`
- `GET/POST /tasks/`, `GET/POST /tasks/testcases/`, `GET/POST /tasks/criteria/`
- `POST /tasks/:id/submit/`, `POST /tasks/:id/test/`
- `GET /submissions/`, `GET /submissions/:id/`

For frontend API wrappers, see:
- `saa-s-web-app-ui (1)/lib/api/`
- `saa-s-web-app-ui (1)/API_FUNCTIONS.md`

## Architecture summary

Submission flow:

1. Frontend posts code to backend.
2. Backend creates `Submission` and enqueues Celery job.
3. Celery worker executes code in Docker runner per testcase.
4. Results are persisted and returned through submission endpoints.

## Security notes

- Submission execution is Docker-based and network-disabled.
- No local host fallback execution for untrusted submission code.
- Hidden testcase expected output is not exposed to students.
- Auth uses httpOnly cookies (no JWT storage in browser localStorage).
- Replace default `SECRET_KEY` and keep `DEBUG=False` in production.
- **Docker Socket Hardening**: In production, the `celery` container requires access to `/var/run/docker.sock` to spawn isolated runner containers. This gives the `celery` container root-equivalent access to the host. It is strongly recommended to use **Rootless Docker** on your VPS and restrict the container's capabilities using AppArmor or SELinux profiles to mitigate potential breakouts.

## Useful commands

From frontend:

```bash
pnpm dev
pnpm lint
pnpm build
```

From backend:

```bash
gunicorn sudotask.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 60
celery -A sudotask worker --loglevel=info
```

## CI

Minimal CI workflow is defined in `.github/workflows/ci.yml`:
- frontend type/lint + build
- backend `manage.py check` + migration sanity check

## Troubleshooting (quick)

- **Frontend cannot reach API**: check `NEXT_PUBLIC_API_BASE_URL`.
- **Submissions stuck pending**: ensure Redis + Celery worker are running.
- **Judge failures**: ensure Docker daemon is running and accessible.
- **DB connection errors**: verify `DB_HOST/DB_PORT` vs Docker/local mode.
