# Backend Setup Guide

## Docker quick start

1. Create `.env` in project root from `.env.example`.
2. Start services:

```bash
docker compose up --build -d
docker compose exec web python manage.py migrate
```

The `web` service startup runs `python manage.py collectstatic --noinput` before Gunicorn so `/static/admin/*` assets are served.

3. Optional:

```bash
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py seed
```

## Production-oriented compose

Use the production compose profile to avoid exposing DB/Redis/Adminer publicly and to run Gunicorn by default:

```bash
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml exec web python manage.py migrate
```

## API auth model

- Cookie-based auth using httpOnly cookies (`access_token`, `refresh_token`).
- Frontend/clients should:
  1. call `GET /api/auth/csrf/`
  2. send credentials with requests
  3. use `POST /api/auth/refresh/` when needed
- Endpoints:
  - `POST /api/auth/register/`
  - `POST /api/auth/login/`
  - `POST /api/auth/refresh/`
  - `POST /api/auth/logout/`
  - `GET /api/auth/me/`

## Local backend (outside Docker)

```bash
docker compose up db redis -d
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8001
```

If your root `.env` still uses Docker defaults (`DB_HOST=db`, `DB_PORT=5432`), local backend commands now auto-fallback to `localhost:5433` outside containers.

In another terminal:

```bash
cd backend
celery -A sudotask worker --loglevel=info
```
