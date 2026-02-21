# 🧑‍💻 SudoTask

**Automated Code Grading Platform for Classrooms**

SudoTask is a full-stack web platform where teachers create programming tasks with test cases, and students submit code that gets automatically graded in a secure Docker sandbox. Built with Django REST Framework and Next.js.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Docker Setup (Recommended)](#docker-setup-recommended)
  - [Local Development Setup](#local-development-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
  - [Authentication](#authentication)
  - [Classrooms](#classrooms)
  - [Tasks](#tasks)
  - [Test Cases](#test-cases)
  - [Criteria](#criteria)
  - [Submissions](#submissions)
- [Code Execution Engine](#-code-execution-engine)
- [Frontend Architecture](#-frontend-architecture)
- [Authentication Flow](#-authentication-flow)
- [Demo Data & Credentials](#-demo-data--credentials)
- [Docker Services](#-docker-services)
- [Security Considerations](#-security-considerations)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| **JWT Authentication** | Secure token-based auth with access/refresh tokens and auto-refresh |
| **Role-Based Access** | Teacher and Student roles with granular permissions |
| **Class Management** | Teachers create classes with unique join codes; students join with a code |
| **Task Builder** | Create programming tasks with descriptions, difficulty levels, tags, and deadlines |
| **Test Cases** | Public and hidden test cases with weighted scoring |
| **Secure Sandbox** | Code runs inside Docker containers with network isolation, memory/CPU limits, and timeouts |
| **Multi-Language** | Support for Python, C++, Java, and JavaScript execution |
| **Async Grading** | Celery + Redis process submissions asynchronously |
| **Leaderboard** | Per-class student rankings based on cumulative scores |
| **Analytics** | Teacher dashboard with submission stats, pass rates, and score breakdowns |
| **Dark Mode** | Full light/dark theme support with animated circular-reveal transition |
| **Responsive UI** | Mobile-friendly interface built with shadcn/ui components |

---

## 🏗 Architecture Overview

```
┌───────────────┐       ┌──────────────────┐       ┌─────────────┐
│               │       │                  │       │             │
│  Next.js      │◄─────►│  Django REST API  │◄─────►│ PostgreSQL  │
│  Frontend     │ HTTP  │  (port 8001)     │       │ (port 5433) │
│  (port 3000)  │       │                  │       │             │
└───────────────┘       └────────┬─────────┘       └─────────────┘
                                 │
                                 │ Task queue
                                 ▼
                        ┌──────────────────┐       ┌─────────────┐
                        │                  │       │             │
                        │  Celery Worker   │◄─────►│   Redis     │
                        │                  │       │ (port 6380) │
                        └────────┬─────────┘       └─────────────┘
                                 │
                                 │ Spawns
                                 ▼
                        ┌──────────────────┐
                        │  Docker          │
                        │  Sandbox         │
                        │  (code execution)│
                        └──────────────────┘
```

**Request flow for code submission:**
1. Student submits code via the frontend
2. Django API creates a `Submission` record with status `pending`
3. A Celery task (`execute_submission`) is dispatched to the Redis broker
4. The Celery worker picks up the task, sets status to `running`
5. For each test case, the `CodeRunner` spins up an isolated Docker container
6. Student output is compared against expected output
7. Submission is updated with score, pass/fail status, and execution metrics

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Django | 6.0.2 | Web framework |
| Django REST Framework | 3.14.0 | REST API |
| PostgreSQL | 15 (Alpine) | Primary database |
| Redis | 7 (Alpine) | Celery message broker & result backend |
| Celery | 5.3.4 | Async task queue for code execution |
| Docker SDK | 6.1.3 | Secure sandbox code execution |
| SimpleJWT | 5.3.1 | JWT authentication |
| drf-spectacular | 0.27.0 | OpenAPI / Swagger docs |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | React framework (Turbopack) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | — | Radix-based component library |
| Zustand | — | Lightweight state management (auth) |
| Sonner | 1.7.1 | Toast notifications |
| Recharts | 2.15.0 | Analytics charts |
| next-themes | 0.4.6 | Dark/light mode |

---

## 📁 Project Structure

```
SudoTask/
├── docker-compose.yml           # Orchestrates all services
├── .env                         # Environment variables (create from .env.example)
├── README.md
│
├── backend/                     # Django backend application
│   ├── Dockerfile               # Python 3.11 + Docker CLI
│   ├── manage.py                # Django management entry point
│   ├── requirements.txt         # Python dependencies
│   ├── seed_data.py             # Demo data script
│   │
│   ├── sudotask/                # Django project configuration
│   │   ├── settings.py          # Settings (DB, JWT, CORS, Celery, Judge)
│   │   ├── urls.py              # Root URL routing
│   │   ├── celery.py            # Celery application setup
│   │   ├── wsgi.py              # WSGI entry point
│   │   └── asgi.py              # ASGI entry point
│   │
│   ├── accounts/                # User authentication & profiles
│   │   ├── models.py            # Custom User model (email-based, Teacher/Student roles)
│   │   ├── serializers.py       # Register, Login, Profile serializers
│   │   ├── views.py             # Register, Me, UpdateProfile endpoints
│   │   ├── permissions.py       # IsTeacher, IsStudent permission classes
│   │   └── urls.py              # /api/auth/* routes
│   │
│   ├── classroom/               # Class management
│   │   ├── models.py            # ClassRoom, ClassMembership models
│   │   ├── serializers.py       # CRUD + JoinClass serializers
│   │   ├── views.py             # ClassRoom ViewSet + Join, Leaderboard, Analytics
│   │   ├── permissions.py       # IsClassOwner, IsClassMember
│   │   └── urls.py              # /api/classes/* routes
│   │
│   ├── tasks/                   # Programming tasks
│   │   ├── models.py            # Task, TestCase, Criteria models
│   │   ├── serializers.py       # Task CRUD, TestCase, Criteria serializers
│   │   ├── views.py             # Task, TestCase, Criteria ViewSets
│   │   ├── permissions.py       # IsTaskOwner permission
│   │   └── urls.py              # /api/tasks/* routes
│   │
│   ├── submissions/             # Code submissions
│   │   ├── models.py            # Submission, SubmissionTestResult models
│   │   ├── serializers.py       # Submission serializers
│   │   ├── views.py             # Submit code, list submissions
│   │   ├── permissions.py       # Submission permissions
│   │   └── urls.py              # /api/submissions/* routes
│   │
│   ├── judge/                   # Code execution engine
│   │   ├── runner.py            # CodeRunner (Docker + local fallback)
│   │   └── tasks.py             # Celery task: execute_submission
│   │
│   └── management/              # Custom Django commands
│       └── commands/
│           └── seed.py          # `python manage.py seed` command
│
└── saa-s-web-app-ui (1)/       # Next.js frontend application
    ├── package.json             # Dependencies & scripts
    ├── next.config.mjs          # Next.js configuration
    ├── tailwind.config.ts       # Tailwind CSS config
    ├── tsconfig.json            # TypeScript config
    │
    ├── app/                     # Next.js App Router pages
    │   ├── layout.tsx           # Root layout (ThemeProvider, fonts)
    │   ├── page.tsx             # Landing page
    │   ├── globals.css          # Global styles & theme variables
    │   ├── login/page.tsx       # Login page
    │   ├── register/page.tsx    # Registration page
    │   ├── solve/page.tsx       # Code editor / submission page
    │   ├── student/             # Student dashboard
    │   │   ├── layout.tsx       # Auth guard (STUDENT role)
    │   │   ├── page.tsx         # Dashboard (classes, tasks, join class)
    │   │   ├── join/page.tsx    # Standalone join class page
    │   │   └── submissions/     # Student submission history
    │   └── teacher/             # Teacher dashboard
    │       ├── layout.tsx       # Auth guard (TEACHER role)
    │       ├── page.tsx         # Dashboard overview
    │       ├── classes/         # Class management pages
    │       ├── tasks/           # Task management pages
    │       ├── submissions/     # Submission review pages
    │       ├── analytics/       # Analytics dashboard
    │       └── settings/        # Teacher settings
    │
    ├── components/              # Reusable UI components
    │   ├── ui/                  # shadcn/ui primitives (button, card, dialog, etc.)
    │   ├── landing/             # Landing page sections
    │   ├── student/             # Student-specific components
    │   ├── teacher/             # Teacher-specific components
    │   ├── theme-provider.tsx   # next-themes provider
    │   └── theme-toggle.tsx     # Dark/light mode toggle (view transition animation)
    │
    ├── lib/                     # Shared utilities & logic
    │   ├── api/                 # API client & endpoint functions
    │   │   ├── client.ts        # Fetch wrapper with JWT auto-refresh
    │   │   ├── auth.ts          # Auth endpoints (login, register, me)
    │   │   ├── classes.ts       # Classroom endpoints
    │   │   ├── tasks.ts         # Task endpoints
    │   │   └── submissions.ts   # Submission endpoints
    │   ├── auth/                # Authentication state
    │   │   ├── authStore.ts     # Zustand store (login, register, logout)
    │   │   └── useAuth.ts       # useAuth() hook
    │   ├── types/index.ts       # TypeScript type definitions
    │   ├── utils.ts             # Utility functions (cn, etc.)
    │   └── mock-data.ts         # Mock data for development
    │
    └── hooks/                   # Custom React hooks
        ├── use-mobile.tsx       # Mobile breakpoint detection
        ├── use-scroll-animation.ts
        └── use-toast.ts         # Toast notifications
```

---

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose** (v2+)
- **Node.js** 18+ and **pnpm** (for frontend)
- **Python** 3.11+ (only for local backend development without Docker)

### Docker Setup (Recommended)

This spins up PostgreSQL, Redis, Django API, Celery worker, and Adminer.

```bash
# 1. Clone the repository
git clone <repository-url>
cd SudoTask

# 2. Create environment file
cp .env.example .env
# Edit .env with your settings (see Environment Variables section)

# 3. Build and start all services
docker-compose up --build -d

# 4. Run database migrations
docker-compose exec web python manage.py migrate

# 5. (Optional) Create a superuser for the admin panel
docker-compose exec web python manage.py createsuperuser

# 6. (Optional) Seed demo data
docker-compose exec web python manage.py seed
```

### Local Development Setup

If you prefer running the backend outside Docker:

```bash
# 1. Start PostgreSQL and Redis (or use Docker for just these)
docker-compose up db redis -d

# 2. Set up Python virtual environment
cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment
#    Make sure DB_HOST=localhost, DB_PORT=5433 in your .env

# 5. Run migrations
python manage.py migrate

# 6. Seed demo data (optional)
python manage.py seed

# 7. Start the Django dev server
python manage.py runserver 8001

# 8. Start Celery worker (in another terminal)
celery -A sudotask worker --loglevel=info
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd "saa-s-web-app-ui (1)"

# 2. Install dependencies
pnpm install

# 3. Start development server (with Turbopack)
pnpm dev

# The frontend will be available at http://localhost:3000
```

> **Note:** The frontend expects the backend API at `http://127.0.0.1:8001/api`. This is configured via the `NEXT_PUBLIC_API_BASE_URL` environment variable.

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (matches docker-compose defaults)
DB_NAME=sudotask
DB_USER=admin
DB_PASSWORD=admin
DB_HOST=localhost          # Use 'db' when running inside Docker
DB_PORT=5433               # Host port mapped to container's 5432

# Celery / Redis
CELERY_BROKER_URL=redis://localhost:6380/0       # Use redis://redis:6379/0 inside Docker
CELERY_RESULT_BACKEND=redis://localhost:6380/0

# Judge (code execution)
JUDGE_DOCKER_IMAGE=python:3.11-slim
JUDGE_TIMEOUT_SECONDS=2
JUDGE_MEMORY_LIMIT_MB=256
JUDGE_CPU_LIMIT=0.5
```

Frontend environment (optional `.env.local` in the frontend directory):

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api
```

---

## 🗄 Database Schema

### User (`accounts.User`)
Custom user model extending Django's `AbstractUser` with email-based authentication.

| Field | Type | Description |
|---|---|---|
| `id` | BigAutoField | Primary key |
| `email` | EmailField (unique) | Login identifier |
| `username` | CharField | Username |
| `first_name` | CharField | First name |
| `last_name` | CharField | Last name |
| `role` | CharField | `TEACHER` or `STUDENT` |
| `created_at` | DateTimeField | Account creation timestamp |

### ClassRoom (`classroom.ClassRoom`)

| Field | Type | Description |
|---|---|---|
| `id` | BigAutoField | Primary key |
| `teacher` | ForeignKey → User | Class owner (teacher) |
| `name` | CharField(200) | Class name |
| `description` | TextField | Class description |
| `class_code` | CharField(10, unique) | Auto-generated join code (6-10 chars) |
| `created_at` | DateTimeField | Creation timestamp |

### ClassMembership (`classroom.ClassMembership`)

| Field | Type | Description |
|---|---|---|
| `id` | BigAutoField | Primary key |
| `classroom` | ForeignKey → ClassRoom | The class |
| `student` | ForeignKey → User | The student |
| `joined_at` | DateTimeField | Join timestamp |

> **Constraint:** `(classroom, student)` is unique. Only students can join; teachers cannot join their own class.

### Task (`tasks.Task`)

| Field | Type | Description |
|---|---|---|
| `id` | BigAutoField | Primary key |
| `classroom` | ForeignKey → ClassRoom | Parent class |
| `title` | CharField(200) | Task title |
| `description` | TextField | Problem statement (supports Markdown) |
| `difficulty` | CharField | `EASY`, `MEDIUM`, or `HARD` |
| `tags` | ArrayField(CharField) | Tags (e.g., `["python", "loops"]`) |
| `deadline` | DateTimeField (nullable) | Optional deadline |
| `created_at` | DateTimeField | Creation timestamp |

### TestCase (`tasks.TestCase`)

| Field | Type | Description |
|---|---|---|
| `id` | BigAutoField | Primary key |
| `task` | ForeignKey → Task | Parent task |
| `input_data` | TextField | Input fed to stdin |
| `expected_output` | TextField | Expected stdout output |
| `is_hidden` | BooleanField | Hidden from students if `True` |
| `weight_points` | IntegerField | Points awarded for passing |
| `order` | IntegerField | Execution order |

### Criteria (`tasks.Criteria`)

| Field | Type | Description |
|---|---|---|
| `id` | BigAutoField | Primary key |
| `task` | ForeignKey → Task | Parent task |
| `name` | CharField(100) | Criteria name |
| `points` | IntegerField | Max points |
| `description` | TextField | Description |

### Submission (`submissions.Submission`)

| Field | Type | Description |
|---|---|---|
| `id` | BigAutoField | Primary key |
| `task` | ForeignKey → Task | Submitted task |
| `student` | ForeignKey → User | Submitting student |
| `language` | CharField | `python`, `cpp`, `java` |
| `code` | TextField | Source code |
| `status` | CharField | `pending` → `running` → `passed` / `failed` / `error` |
| `score` | IntegerField | Total weighted score |
| `passed_count` | IntegerField | Number of test cases passed |
| `total_count` | IntegerField | Total test cases |
| `execution_time_ms` | IntegerField (nullable) | Total execution time |
| `memory_kb` | IntegerField (nullable) | Memory usage |
| `stdout` | TextField | Combined stdout |
| `stderr` | TextField | Combined stderr |
| `created_at` | DateTimeField | Submission timestamp |

### SubmissionTestResult (`submissions.SubmissionTestResult`)

| Field | Type | Description |
|---|---|---|
| `id` | BigAutoField | Primary key |
| `submission` | ForeignKey → Submission | Parent submission |
| `testcase` | ForeignKey → TestCase | Corresponding test case |
| `passed` | BooleanField | Whether the test passed |
| `student_output` | TextField | Actual output |
| `expected_output` | TextField | Expected output (blank for hidden tests) |
| `stderr` | TextField | Error output |
| `runtime_ms` | IntegerField (nullable) | Per-test execution time |

---

## 📡 API Reference

**Base URL:** `http://localhost:8001/api`

**Authentication:** All endpoints (except register/login) require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register/` | ❌ | Register new user. Returns user + JWT tokens. |
| `POST` | `/auth/login/` | ❌ | Login with email & password. Returns JWT tokens. |
| `POST` | `/auth/refresh/` | ❌ | Refresh access token using refresh token. |
| `GET` | `/auth/me/` | ✅ | Get current user profile. |
| `PATCH` | `/auth/me/` | ✅ | Update current user profile (`first_name`, `last_name`). |

**Register request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "is_teacher": false
}
```

**Login response:**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": { "id": 1, "email": "...", "role": "STUDENT", ... }
}
```

### Classrooms

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/classes/` | ✅ | Any | List user's classes (teachers see owned, students see joined) |
| `POST` | `/classes/` | ✅ | Teacher | Create a new class |
| `GET` | `/classes/:id/` | ✅ | Any | Get class details |
| `PATCH` | `/classes/:id/` | ✅ | Owner | Update class (name, description) |
| `DELETE` | `/classes/:id/` | ✅ | Owner | Delete class |
| `POST` | `/classes/:id/regenerate_code/` | ✅ | Owner | Regenerate class join code |
| `POST` | `/classes/join/` | ✅ | Student | Join a class with `{ "class_code": "ABC123" }` |
| `GET` | `/classes/:id/leaderboard/` | ✅ | Member | Get class leaderboard |
| `GET` | `/classes/:id/analytics/` | ✅ | Owner | Get class analytics (teacher only) |

### Tasks

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/tasks/?class_id=:id` | ✅ | Any | List tasks (optionally filtered by class) |
| `POST` | `/tasks/` | ✅ | Teacher | Create a task |
| `GET` | `/tasks/:id/` | ✅ | Any | Get task details |
| `PATCH` | `/tasks/:id/` | ✅ | Owner | Update task |
| `DELETE` | `/tasks/:id/` | ✅ | Owner | Delete task |
| `GET` | `/tasks/:id/analytics/` | ✅ | Owner | Get task analytics |

**Create task request body:**
```json
{
  "classroom": 1,
  "title": "Sum Two Numbers",
  "description": "Write a program that reads two integers and prints their sum.",
  "difficulty": "EASY",
  "tags": ["python", "basics"],
  "deadline": "2026-03-01T23:59:00Z"
}
```

### Test Cases

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/tasks/testcases/?task_id=:id` | ✅ | Any | List test cases for a task |
| `POST` | `/tasks/testcases/?task_id=:id` | ✅ | Teacher | Create a test case |
| `PATCH` | `/tasks/testcases/:id/` | ✅ | Teacher | Update a test case |
| `DELETE` | `/tasks/testcases/:id/` | ✅ | Teacher | Delete a test case |

**Create test case request body:**
```json
{
  "task": 1,
  "input_data": "5\n10",
  "expected_output": "15",
  "is_hidden": false,
  "weight_points": 10,
  "order": 1
}
```

### Criteria

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/tasks/criteria/?task_id=:id` | ✅ | Any | List criteria for a task |
| `POST` | `/tasks/criteria/?task_id=:id` | ✅ | Teacher | Create criteria |

### Submissions

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/tasks/:task_id/submit/` | ✅ | Student | Submit code for grading |
| `GET` | `/submissions/?task_id=:id` | ✅ | Any | List submissions (filtered by user/task) |
| `GET` | `/submissions/:id/` | ✅ | Any | Get submission details with test results |

**Submit code request body:**
```json
{
  "code": "a = int(input())\nb = int(input())\nprint(a + b)",
  "language": "python"
}
```

**Submission status lifecycle:** `pending` → `running` → `passed` | `failed` | `error`

> 📖 **Interactive API docs** are available at `http://localhost:8001/api/docs/` (Swagger UI powered by drf-spectacular).

---

## ⚙ Code Execution Engine

The judge system (`judge/runner.py` + `judge/tasks.py`) handles secure code execution:

### Execution Flow

```
Submission Created (status: pending)
        │
        ▼
Celery task dispatched: execute_submission(submission_id)
        │
        ▼
Status set to "running"
        │
        ▼
For each TestCase (ordered):
  ┌─────────────────────────────────────────┐
  │  Docker container spawned with:         │
  │  • Network disabled                     │
  │  • Memory limit: 256MB                  │
  │  • CPU limit: 0.5 cores                 │
  │  • Timeout: 2 seconds                   │
  │  • Read-only code mount                 │
  │                                         │
  │  Input piped to stdin                   │
  │  Output captured from stdout/stderr     │
  └─────────────────────────────────────────┘
        │
        ▼
Output normalized & compared to expected output
        │
        ▼
SubmissionTestResult created for each test
        │
        ▼
Final status: passed (all tests) | failed (some failed) | error
Score = sum of weight_points for passed tests
```

### Supported Languages

| Language | Docker Image | Compiler/Runtime |
|---|---|---|
| Python | `python:3.11-slim` | `python3` |
| C++ | — | `g++` (local fallback) |
| Java | — | `javac` + `java` (local fallback) |
| JavaScript | — | `node` (local fallback) |

### Output Comparison

Output is normalized before comparison:
- Trailing whitespace on each line is stripped
- Leading/trailing blank lines are removed
- Newlines are standardized

---

## 🖥 Frontend Architecture

### Routing (Next.js App Router)

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with features, pricing, etc. |
| `/login` | Public | Email & password login |
| `/register` | Public | Account registration (teacher or student) |
| `/student` | Student | Student dashboard — enrolled classes, tasks, join class |
| `/student/join` | Student | Standalone class join page |
| `/student/submissions` | Student | Submission history |
| `/solve?taskId=:id` | Student | Code editor & submission page |
| `/teacher` | Teacher | Teacher dashboard overview |
| `/teacher/classes` | Teacher | Class management |
| `/teacher/tasks` | Teacher | Task management |
| `/teacher/submissions` | Teacher | Review student submissions |
| `/teacher/analytics` | Teacher | Class & task analytics |
| `/teacher/settings` | Teacher | Account settings |

### State Management

- **Auth state:** Zustand store (`lib/auth/authStore.ts`) manages user session, login, register, and logout
- **`useAuth()` hook:** Provides `user`, `isLoading`, `isAuthenticated`, `isTeacher`, `isStudent`
- **Route guards:** Teacher and Student layouts check roles and redirect unauthorized users

### API Client

The API client (`lib/api/client.ts`) features:
- Centralized fetch wrapper for all HTTP methods
- Automatic JWT token injection from `localStorage`
- **Auto-refresh:** On 401 responses, automatically refreshes the access token and retries
- Request queuing during token refresh to avoid race conditions
- Structured error parsing from DRF error responses

### Theming

- **next-themes** with `class` attribute strategy
- Light/dark CSS variables defined in `globals.css`
- **View Transitions API** circular-reveal animation on theme toggle
- Falls back to instant switch on unsupported browsers or when `prefers-reduced-motion` is set

---

## 🔑 Authentication Flow

```
Register/Login
      │
      ▼
Backend returns { access, refresh } JWT tokens
      │
      ▼
Tokens stored in localStorage
      │
      ▼
API client attaches "Bearer <access>" to every request
      │
      ▼
On 401 → auto-refresh using refresh token
      │
      ├── Success → retry original request with new access token
      └── Failure → clear tokens, redirect to /login
```

**JWT Configuration:**
- Access token lifetime: **1 hour**
- Refresh token lifetime: **7 days**
- Tokens rotate on refresh (old refresh token is blacklisted)

---

## 🧪 Demo Data & Credentials

Seed the database with demo data:

```bash
# Docker
docker-compose exec web python manage.py seed

# Local
python manage.py seed
```

This creates:

| Account | Email | Password | Role |
|---|---|---|---|
| Demo Teacher | `teacher@example.com` | `teacher123` | TEACHER |
| Alice Student | `student1@example.com` | `student123` | STUDENT |
| Bob Student | `student2@example.com` | `student123` | STUDENT |

**Demo data includes:**
- 1 classroom: "Introduction to Python" (both students enrolled)
- 1 task: "Sum Two Numbers" (Easy, deadline in 7 days)
- 3 test cases (2 public, 1 hidden) with weighted scoring
- 2 criteria: "Correctness" (30pts) and "Code Quality" (10pts)

---

## 🐳 Docker Services

| Service | Image | Host Port | Container Port | Description |
|---|---|---|---|---|
| `db` | `postgres:15-alpine` | 5433 | 5432 | PostgreSQL database |
| `redis` | `redis:7-alpine` | 6380 | 6379 | Message broker & cache |
| `web` | Custom (Dockerfile) | 8001 | 8000 | Django API server |
| `celery` | Custom (Dockerfile) | — | — | Background task worker |
| `adminer` | `adminer` | 8081 | 8080 | Database admin UI |

**Useful commands:**

```bash
# View logs
docker-compose logs -f web
docker-compose logs -f celery

# Run Django management commands
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
docker-compose exec web python manage.py shell

# Restart a single service
docker-compose restart web

# Stop all services
docker-compose down

# Stop and remove volumes (⚠ deletes database)
docker-compose down -v
```

---

## 🔒 Security Considerations

### Code Execution Sandbox
| Measure | Detail |
|---|---|
| **Network isolation** | Containers run with `network_disabled=True` |
| **Memory limit** | 256 MB (configurable via `JUDGE_MEMORY_LIMIT_MB`) |
| **CPU limit** | 0.5 cores (configurable via `JUDGE_CPU_LIMIT`) |
| **Timeout** | 2 seconds (configurable via `JUDGE_TIMEOUT_SECONDS`) |
| **Filesystem** | Code mounted as read-only (`ro`) |
| **Auto-cleanup** | Containers are removed after execution (`remove=True`) |

### Application Security
- Passwords validated against Django's built-in validators (similarity, length, common, numeric)
- JWT tokens with short-lived access (1h) and rotating refresh tokens
- CORS restricted to `localhost:3000` origins
- CSRF protection enabled
- Role-based permission checks on every API endpoint
- Hidden test cases: students cannot see expected output for hidden tests

### ⚠ Development Mode Warnings
- The local execution fallback (`_run_local_python`) is **unsafe** — only use in development
- `DEBUG=True` should never be used in production
- Change `SECRET_KEY` from the default value in production

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| **Database connection refused** | Ensure PostgreSQL is running: `docker-compose up db -d`. Check `DB_HOST` and `DB_PORT` in `.env` |
| **Celery tasks not executing** | Ensure Redis is running and Celery worker is started. Check `CELERY_BROKER_URL` |
| **CORS errors in browser** | Verify `CORS_ALLOWED_ORIGINS` in `settings.py` includes your frontend URL |
| **Code execution fails** | Ensure Docker daemon is running and the `web`/`celery` container has access to the Docker socket |
| **JWT token expired** | The frontend auto-refreshes tokens. If refresh also fails, the user is redirected to login |
| **Frontend can't reach API** | Check `NEXT_PUBLIC_API_BASE_URL` — default is `http://127.0.0.1:8001/api` |
| **Migrations error** | Run `docker-compose exec web python manage.py migrate` or locally `python manage.py migrate` |

---

## 🚧 Future Enhancements

- [ ] Real-time submission status updates via WebSockets
- [ ] In-browser code editor with syntax highlighting and autocomplete
- [ ] Submission history diff viewer
- [ ] Advanced analytics with charts and exports
- [ ] Plagiarism detection across submissions
- [ ] Bulk task import/export (JSON/CSV)
- [ ] Email notifications for deadlines and grades
- [ ] Multi-file submissions
- [ ] Custom Docker images per task (e.g., specific libraries)
- [ ] Rate limiting on submissions

---

## 📄 License

MIT
