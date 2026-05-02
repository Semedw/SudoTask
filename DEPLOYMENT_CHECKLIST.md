# DEPLOYMENT_CHECKLIST

Use this as a **hard gate** before deploying to production (single VPS + Docker Compose).

## Blocking issues and required TODOs

| # | Current issue | Why it undermines deployment | TODO before deploy |
|---|---|---|---|
| 1 | No frontend production container/service | `docker-compose.prod.yml` runs backend/worker/db/redis only; frontend is not deployable as a service | Add frontend Dockerfile + frontend service in prod compose (`next build` + `next start`) | done
| 2 | No reverse proxy/TLS layer | No Nginx/Caddy/Traefik config for 80/443, TLS termination, or safe routing | Add reverse proxy service and TLS cert flow; expose only 80/443 publicly | done
| 3 | Frontend API rewrite is hard-coded to localhost | `next.config.mjs` rewrites to `http://127.0.0.1:8000/api/:path*`, which breaks non-local deployments | Replace rewrite with env-driven destination and production-safe defaults | done
| 4 | Backend port mapping is inconsistent with frontend assumptions | Prod compose maps backend `8001:8000` while frontend default rewrite points to 8000 | Unify API routing strategy (domain/proxy/internal service name) and remove port ambiguity |
| 5 | Judge runtime not wired to Docker daemon | Runner uses `docker.from_env()` but compose does not provide `/var/run/docker.sock` or `DOCKER_HOST` | Add secure Docker daemon access for judge worker and document hardening constraints |
| 6 | Startup flow is manual | Migrations are manual post-start commands; easy to miss during rollout | Add deterministic startup/entrypoint flow for migrate + app start |
| 7 | Static files pipeline is incomplete | `STATIC_ROOT` exists, but no explicit production `collectstatic` + serving path is wired | Add `collectstatic` step and static file serving via proxy (or Whitenoise strategy) |
| 8 | No app-level health endpoint | Container health checks exist for db/redis only; API/service health is not exposed for orchestration | Add `/health` endpoint and health checks for web/celery processes |
| 9 | Production config can silently degrade security | `SECRET_KEY` has insecure fallback if missing; critical env values are easy to misconfigure | Enforce required env vars and fail fast on invalid/missing production settings |
| 10 | No deployment automation (CI only) | CI exists, but no CD/deploy script/workflow, making releases manual and error-prone | Add repeatable deploy + rollback automation for VPS |
| 11 | No documented backup/restore procedure | Data durability and disaster recovery are undefined | Define and automate PostgreSQL backup/restore runbook (and retention policy) |
| 12 | Documentation drift | Existing docs include stale/conflicting setup notes that can cause incorrect production setup | Align README/setup docs to one canonical production process |

## Pre-deploy execution checklist

- [ ] Add frontend production runtime (`predeploy-frontend-runtime`)
- [ ] Add ingress + TLS (`predeploy-ingress-tls`)
- [x] Fix API routing/rewrite strategy (`predeploy-api-routing`)
- [ ] Wire judge Docker runtime securely (`predeploy-judge-runtime`)
- [ ] Automate startup flow: migrate/collectstatic/start (`predeploy-startup-flow`)
- [ ] Add health endpoint + container checks (`predeploy-healthchecks`)
- [ ] Enforce production env guardrails (`predeploy-env-guardrails`)
- [ ] Add deploy + rollback automation (`predeploy-deploy-automation`)
- [ ] Sync and clean deployment documentation (`predeploy-docs-sync`)

## Recommended production invariants

- [ ] `DEBUG=False`
- [ ] Strong unique `SECRET_KEY` (no defaults)
- [ ] Valid `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
- [ ] Secure cookie flags + HTTPS redirect enabled
- [ ] Postgres/Redis not publicly exposed
- [ ] Only reverse proxy ports are public
