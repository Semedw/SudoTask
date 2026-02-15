# Backend Setup Guide

## Quick Start with Docker

1. **Create `.env` file** (copy from `.env.example` if needed):
   ```bash
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DB_NAME=sudotask
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=db
   DB_PORT=5432
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0
   ```

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Run migrations** (in a new terminal):
   ```bash
   docker-compose exec web python manage.py migrate
   ```

4. **Create superuser** (optional):
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

5. **Seed demo data** (optional):
   ```bash
   docker-compose exec web python manage.py seed
   ```

## API Endpoints

All endpoints are prefixed with `/api/`

### Authentication
- `POST /api/auth/register/` - Register
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/me/` - Current user profile

### Classes
- `POST /api/classes/` - Create class (teacher)
- `GET /api/classes/` - List classes
- `GET /api/classes/:id/` - Get class details
- `PATCH /api/classes/:id/` - Update class
- `DELETE /api/classes/:id/` - Delete class
- `POST /api/classes/:id/regenerate-code/` - Regenerate class code
- `POST /api/classes/join/` - Join class by code (student)
- `GET /api/classes/:id/leaderboard/` - Leaderboard
- `GET /api/classes/:id/analytics/` - Analytics (teacher)

### Tasks
- `POST /api/tasks/` - Create task (teacher)
- `GET /api/tasks/?class_id=:id` - List tasks
- `GET /api/tasks/:id/` - Get task
- `PATCH /api/tasks/:id/` - Update task
- `DELETE /api/tasks/:id/` - Delete task
- `GET /api/tasks/:id/analytics/` - Task analytics (teacher)

### Test Cases
- `POST /api/tasks/testcases/?task_id=:id` - Create test case
- `GET /api/tasks/testcases/?task_id=:id` - List test cases
- `PATCH /api/tasks/testcases/:id/` - Update test case
- `DELETE /api/tasks/testcases/:id/` - Delete test case

### Criteria
- `POST /api/tasks/criteria/?task_id=:id` - Create criteria
- `GET /api/tasks/criteria/?task_id=:id` - List criteria

### Submissions
- `POST /api/tasks/:task_id/submit/` - Submit code (student)
- `GET /api/submissions/?task_id=:id` - List submissions
- `GET /api/submissions/:id/` - Get submission details

## Testing the API

### Register a Teacher
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "username": "teacher",
    "password": "teacher123",
    "password2": "teacher123",
    "role": "TEACHER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "teacher123"
  }'
```

### Create a Class (use access token from login)
```bash
curl -X POST http://localhost:8000/api/classes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Python 101",
    "description": "Introduction to Python"
  }'
```

## Code Execution

The judge service executes code in Docker containers with:
- Network isolation
- Memory limits (256MB default)
- CPU limits
- Timeout (2 seconds default)

For development without Docker, the system falls back to local execution (unsafe).

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check database credentials in `.env`

### Celery not processing tasks
- Check Celery worker logs: `docker-compose logs celery`
- Ensure Redis is running: `docker-compose ps redis`

### Docker execution issues
- Ensure Docker daemon is running
- Check Docker socket permissions
- For development, the system will fall back to local execution
