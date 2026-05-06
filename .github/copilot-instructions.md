# Copilot Instructions for SudoTask

## Build, test, and lint commands

Run from repo root unless a `cd` is shown.

### Frontend (`saa-s-web-app-ui (1)`)

```bash
cd "saa-s-web-app-ui (1)"
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm test:run
```

Single-test examples:

```bash
cd "saa-s-web-app-ui (1)"
pnpm test:run lib/api/client.test.ts
pnpm test:run lib/api/client.test.ts -t "uses /api fallback when env is unset"
```

### Backend (`backend`)

```bash
cd backend
pip install -r requirements.txt
python manage.py check
python manage.py check --deploy
python manage.py makemigrations --check --dry-run
pytest
```

Single-test examples:

```bash
cd backend
pytest tests/test_api.py
pytest tests/test_api.py::TestAuthEndpoints::test_login_valid
```

Backend test config note: `pytest.ini` uses `DJANGO_SETTINGS_MODULE=sudotask.settings_test`; test DB host/port come from `TEST_DB_HOST`/`TEST_DB_PORT` (defaults `localhost:5433`).

## High-level architecture

SudoTask is a two-part web app: a Next.js frontend and a Django REST backend, with asynchronous grading via Celery and Docker-based code execution.

1. **Frontend (Next.js App Router):**
   - UI and role-specific pages live in `app/`.
   - Auth state is managed in Zustand (`lib/auth/authStore.ts`) and initialized via `useAuth`.
   - API calls go through `lib/api/client.ts`.
   - `next.config.mjs` rewrites `/api/:path*` to the backend unless `NEXT_PUBLIC_API_BASE_URL` points elsewhere.

2. **Backend (Django + DRF):**
   - Domain is split by app: `accounts`, `classroom`, `tasks`, `submissions`, `judge`.
   - Main routing is in `backend/sudotask/urls.py`; app routers expose the API under `/api/...`.
   - Auth is cookie JWT + CSRF (custom `CookieJWTAuthentication`).

3. **Submission execution pipeline:**
   - Student submits code to `POST /api/submissions/tasks/{task_id}/submit/`.
   - Backend creates a `Submission` row and enqueues `judge.tasks.execute_submission`.
   - Celery worker runs code inside Docker via `judge/runner.py`, records per-test results, then updates final submission status/score.
   - `POST /api/submissions/tasks/{task_id}/test/` is a synchronous preview path that runs only public testcases and does not persist a `Submission`.

## Key conventions in this repository

1. **Slash and no-slash API compatibility is intentional.**  
   Preserve dual support when adding routes (`SimpleRouter(trailing_slash='/?')`, paired `path` + `re_path`, and auth endpoints registered with both forms).

2. **Frontend API helpers normalize toward trailing slashes.**  
   `lib/api/client.ts` normalizes endpoint paths and API base URLs; API wrappers should use this client instead of calling `fetch` directly.

3. **Cookie-only auth flow with CSRF for mutating requests.**  
   Backend reads JWT from auth cookies (`accounts/authentication.py`), and frontend sends `credentials: "include"` plus CSRF token handling in `lib/api/client.ts`.

4. **Hidden testcase secrecy is enforced in multiple layers.**  
   `tasks/serializers.py` hides hidden testcase expected output for students, `/test/` runs only non-hidden testcases, and async grading stores blank `expected_output` for hidden cases in submission results.

5. **Role enforcement is duplicated intentionally (backend + frontend).**  
   Backend permission classes gate API actions; frontend route access is also guarded in `app/teacher/layout.tsx` and `app/student/layout.tsx` (the `proxy.ts` middleware does not enforce auth).

6. **When editing, follow existing AGENTS/GEMINI constraints.**  
   Keep changes surgical, avoid speculative abstractions, and surface ambiguous requirements before implementing.
