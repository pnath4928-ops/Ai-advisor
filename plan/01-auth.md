# 01 — Authentication

- **Role:** all (student, teacher, admin)
- **Routes:** `/login`, `/register`
- **Status:** FIXED (verified: register student 201, admin 400, /me returns {user,profile})

> Browser pass: **session now survives a hard reload.** `SessionBootstrap` previously let
> the route tree render the instant `GET /auth/me` succeeded, before the user was written
> to the store in a `useEffect`, so `ProtectedRoute` redirected to `/login`. The gate now
> keeps the spinner until `user` is set (or the query errors → logout). Verified end-to-end
> in real Chrome (register → reload → still on `/dashboard`; logout → `/login`).

## Purpose

Login/register must return tokens + user + profile, persist across refreshes, refresh
expired access tokens transparently, and route the user to their role dashboard.

## Frontend files

| File | Role |
|---|---|
| `frontend/src/pages/Login.tsx` | login form |
| `frontend/src/pages/Register.tsx` | registration form (student/teacher only) |
| `frontend/src/hooks/useAuth.ts` | `login`/`register`/`logout`, `useCurrentUser` |
| `frontend/src/api/auth.ts` | axios wrappers |
| `frontend/src/store/authStore.ts` | zustand store (user, profile, isAuthenticated) |
| `frontend/src/lib/api.ts` | request auth header + 401 refresh interceptor |
| `frontend/src/components/SessionBootstrap.tsx` | defined but **never mounted** |

## Backend files

| File | Role |
|---|---|
| `backend/src/controllers/authController.ts` | handlers |
| `backend/src/services/authService.ts` | logic, response shapes |
| `backend/src/routes/authRoutes.ts` | routes |
| `backend/src/validators/authValidator.ts` | zod schemas |
| `backend/src/middleware/auth.ts` | `authenticate`/`authorize` |
| `backend/src/utils/generateToken.ts` | JWT sign/verify |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| Login | `POST /api/auth/login` | `{ email, password }` | `{ user: { id, name, email, role }, accessToken, refreshToken, profile }` |
| Register | `POST /api/auth/register` | `{ name, email, password, role }` | same as login (`profile` = new Student/Teacher doc) |
| Refresh | `POST /api/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| Me | `GET /api/auth/me` | Bearer token | **raw User doc**: `{ _id, name, email, role, createdAt, ... }` (**no `user` wrapper, no `profile`**) |

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | `SessionBootstrap` never rendered + store not persisted → **refresh logs the user out** | `SessionBootstrap.tsx:6` (unused), `authStore.ts:14-34`, `App.tsx:55-88` | Mount `SessionBootstrap` in `App`/layout; restore auth from token |
| 2 | High | `SessionBootstrap` guard `isAuthenticated && !user` is always false after refresh, so it would never call `/me` even if mounted | `SessionBootstrap.tsx:12,17` | Gate on presence of token instead of `isAuthenticated` |
| 3 | High | `GET /me` returns `_id`-based raw user, while login/register return `{ user: { id }, profile }`; `User` type expects `id` | `authService.ts:135-137`, `types/index.ts:1-6` | Normalize `/me` to `{ user: { id, name, email, role }, profile }` **or** map on the client |
| 4 | Medium | After refresh, `profile` is null (Teacher `assignedClasses`, Student profile) until re-fetched; `useCurrentUser`/`/me` returns no profile | `useAuth.ts:10-17`, `authService.getMe` | Add profile to `/me` or fetch profile per-role after restore |
| 5 | High (security) | Public `register` accepts `role: 'admin'` → anyone can self-register as admin | `backend/src/validators/authValidator.ts:7`, `authService.ts:25-30` | Restrict register role to `student|teacher` (admin only via seed/admin) |
| 6 | Low | `authApi.refreshToken` wrapper is unused; interceptor duplicates logic | `api/auth.ts:27`, `lib/api.ts:29` | Consolidate |

## Verification checklist

- [ ] Login as student/teacher/admin → redirected to `/dashboard` with correct role view.
- [ ] Wrong password shows an inline error, no crash.
- [ ] Register a student → lands on student dashboard with a created profile.
- [ ] Register a teacher → lands on teacher dashboard.
- [ ] **Refresh the page while logged in → still logged in** (does not bounce to `/login`).
- [ ] After refresh, sidebar shows name/email/role and role-appropriate nav.
- [ ] After access token expires, a request triggers refresh and retries once; on failure → `/login`.
- [ ] Logout clears tokens and store, returns to `/login`.
- [ ] `POST /api/auth/register` with `role: "admin"` is rejected.

## Fix plan

1. Mount `SessionBootstrap` (once, high in the tree) and change its gate to token presence.
2. Make `/me` return `{ user, profile }` **or** map the raw doc client-side to the `User` type; ensure `id` exists.
3. Add a persistence/rehydration mechanism for the auth store (or bootstrap from token on load).
4. Restrict register role to student/teacher on the backend.
5. Re-run the checklist.
