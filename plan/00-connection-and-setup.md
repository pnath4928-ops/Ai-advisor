# 00 — Connection & Setup

- **Scope:** dev proxy, CORS, env vars, Docker networking
- **Status:** FIXED (verified: Vite proxy 3000→5005 returns backend health/login 200)

## Purpose

Make every `/api/*` request from the frontend actually reach the backend, in both
local dev and Docker, before verifying any feature.

## Files involved

| File | Purpose |
|---|---|
| `frontend/vite.config.ts` | Vite dev-server proxy for `/api` |
| `frontend/.env` | `VITE_API_URL`, `VITE_DEV_API_TARGET`, `VITE_DEV_PORT` |
| `frontend/.env.production` | production API base URL |
| `frontend/src/lib/api.ts` | axios instance + interceptors |
| `backend/.env` | `PORT=5005`, Mongo URI, JWT secrets |
| `backend/src/config/env.ts` | env schema/defaults |
| `backend/src/server.ts` | reads `env.PORT` |
| `backend/src/app.ts` | CORS origin, route mounts |
| `docker-compose.yml` | ports, build args, healthchecks |
| `frontend/nginx.conf` | production `/api` reverse proxy |

## Current facts

- `backend/.env:1` → `PORT=5005`; `backend/src/app.ts:16` CORS origin defaults to `http://localhost:3000`.
- `frontend/.env:3` → `VITE_API_URL=/api`; `.env:6` → `VITE_DEV_API_TARGET=http://localhost:5005`.
- `frontend/vite.config.ts:13-20` → server port `3000`, proxy target **hardcoded `http://localhost:5000`** (ignores `VITE_DEV_API_TARGET`).
- `docker-compose.yml`: backend `PORT=5000`; frontend build arg `VITE_API_URL=/api`; nginx `proxy_pass http://backend:5000/api/` — internally consistent.
- `frontend/src/lib/api.ts:4` baseURL falls back to `/api`; `:29` refresh call uses absolute `axios.post('/api/auth/refresh', ...)`, bypassing baseURL.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | Dev proxy targets 5000, backend listens on 5005 | `frontend/vite.config.ts:17` | Make target configurable: `process.env.VITE_DEV_API_TARGET` (or loadEnv) and default to backend's port |
| 2 | Medium | Vite auto-increments port when 3000 is busy, breaking backend CORS allow-list (only `http://localhost:3000`) | `frontend/.env:9`, `backend/src/app.ts:16` | Pin `strictPort: true`, or allow multiple localhost origins in CORS |
| 3 | Medium | Hardcoded refresh URL bypasses `baseURL` (breaks non-local deployments) | `frontend/src/lib/api.ts:29` | Use the axios instance / `authApi.refreshToken` |
| 4 | Low | `.env.production` points at a placeholder `your-app.onrender.com` | `frontend/.env.production:1` | Set real deploy URL before shipping |

## Verification checklist

- [ ] `curl http://localhost:5005/api/health` returns `{ status: "ok" }` (backend up).
- [ ] While frontend dev server is running, `GET http://localhost:3000/api/health` returns the same JSON (proxy works).
- [ ] Browser devtools Network: login request `POST /api/login`... actually `POST /api/auth/login` returns 200 (not 404/ECONNREFUSED).
- [ ] No CORS errors in console when running at the configured port.
- [ ] `docker compose up --build` → `http://localhost:3000/api/health` OK.

## Fix plan

1. Rewrite `vite.config.ts` to read `VITE_DEV_API_TARGET` (and `VITE_DEV_PORT`) via `loadEnv`, defaulting the proxy target to the backend port in `backend/.env`.
2. Add `strictPort: true` for the dev server (or align CORS origins).
3. Replace the hardcoded refresh URL in `lib/api.ts` with a call through the axios instance / `authApi.refreshToken`.
4. Re-verify the checklist above.
