# SudoTask

A web platform where teachers create programming tasks with test cases, and students submit code that gets automatically graded in a secure sandbox.

## Project Structure

```
SudoTask/
├── backend/              # Django backend
│   ├── accounts/        # User authentication & profiles
│   ├── classroom/       # Classes and memberships
│   ├── tasks/           # Tasks, test cases, criteria
│   ├── submissions/     # Code submissions
│   ├── judge/           # Code execution runner
│   └── sudotask/        # Django project settings
├── saa-s-web-app-ui/    # Next.js frontend
└── docker-compose.yml   # Docker Compose configuration
```

## Tech Stack

### Backend
- **Django** 5.0.1
- **Django REST Framework** 3.14.0
- **PostgreSQL** 15
- **Redis** 7
- **Celery** 5.3.4
- **Docker** (for secure code execution)
- **JWT Authentication** (djangorestframework-simplejwt)

### Frontend
- **Next.js** 16
- **shadcn/ui** components
- **TypeScript**

## Quick Start

### Prerequisites
- Docker and Docker Compose
- (Optional) Python 3.11+ for local development

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SudoTask
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Run migrations**
   ```bash
   docker-compose exec web python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   docker-compose exec web python manage.py createsuperuser
   ```

6. **Seed demo data (optional)**
   ```bash
   docker-compose exec web python manage.py seed
   ```

### Access the Application

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs/
- **Admin Panel**: http://localhost:8000/admin/
- **Frontend**: http://localhost:3000 (if running)

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user profile

### Classes
- `POST /api/classes/` - Create class (teacher only)
- `GET /api/classes/` - List classes
- `GET /api/classes/:id/` - Get class details
- `PATCH /api/classes/:id/` - Update class (owner only)
- `DELETE /api/classes/:id/` - Delete class (owner only)
- `POST /api/classes/:id/regenerate-code/` - Regenerate class code
- `POST /api/classes/join/` - Join class by code (student)
- `GET /api/classes/:id/leaderboard/` - Get class leaderboard
- `GET /api/classes/:id/analytics/` - Get class analytics (teacher)

### Tasks
- `POST /api/tasks/` - Create task (teacher)
- `GET /api/tasks/?class_id=:id` - List tasks
- `GET /api/tasks/:id/` - Get task details
- `PATCH /api/tasks/:id/` - Update task (owner)
- `DELETE /api/tasks/:id/` - Delete task (owner)
- `GET /api/tasks/:id/analytics/` - Get task analytics (teacher)

### Test Cases
- `POST /api/tasks/testcases/?task_id=:id` - Create test case (teacher)
- `GET /api/tasks/testcases/?task_id=:id` - List test cases
- `PATCH /api/tasks/testcases/:id/` - Update test case (teacher)
- `DELETE /api/tasks/testcases/:id/` - Delete test case (teacher)

### Criteria
- `POST /api/tasks/criteria/?task_id=:id` - Create criteria (teacher)
- `GET /api/tasks/criteria/?task_id=:id` - List criteria

### Submissions
- `POST /api/tasks/:task_id/submit/` - Submit code (student)
- `GET /api/submissions/?task_id=:id` - List submissions
- `GET /api/submissions/:id/` - Get submission details

## Demo Credentials

After running `python manage.py seed`:

- **Teacher**: `teacher@example.com` / `teacher123`
- **Student 1**: `student1@example.com` / `student123`
- **Student 2**: `student2@example.com` / `student123`

## Development

### Local Development (without Docker)

1. **Create virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL**
   - Create database: `createdb sudotask`
   - Update `.env` with database credentials

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start Redis** (for Celery)
   ```bash
   redis-server
   ```

6. **Start Django server**
   ```bash
   python manage.py runserver
   ```

7. **Start Celery worker** (in another terminal)
   ```bash
   celery -A sudotask worker --loglevel=info
   ```

### Code Execution

The judge service uses Docker to run student code in isolated containers. For development without Docker, the system falls back to local execution (unsafe, not recommended for production).

## Features

- ✅ User authentication with JWT
- ✅ Role-based access control (Teacher/Student)
- ✅ Class management with unique class codes
- ✅ Task creation with test cases and criteria
- ✅ Secure code execution in Docker sandbox
- ✅ Automatic grading with test cases
- ✅ Leaderboard and analytics
- ✅ Hidden test cases (students can't see expected output)
- ✅ Async code execution with Celery
- ✅ RESTful API with OpenAPI documentation

## Security Considerations

- Code execution runs in Docker containers with:
  - Network isolation
  - Memory limits (256MB default)
  - CPU limits
  - Timeout enforcement (2 seconds default)
  - Read-only filesystem mounts

## Future Enhancements

- Support for C++ and Java
- Real-time submission status updates (WebSockets)
- Code editor with syntax highlighting
- Submission history and versioning
- Advanced analytics and reporting
- Plagiarism detection

## License

MIT
