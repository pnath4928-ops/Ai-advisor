# Study Advisor — Section-by-Section Verification & Fix Plan

This folder holds one plan per dashboard section, grouped by role. Each plan documents
the exact frontend files, backend endpoints, data contract, a manual verification
checklist, and the known issues found during a full codebase audit.

All sections have been worked through and fixed. See each plan's `Status` line for the
exact changes and evidence; every phase finished with both typechecks clean and a live
API verification run (scripts `teacher-flow.mjs`, `student-flow.mjs`, `admin-flow.mjs`).

A full **browser** end-to-end pass was then added (Playwright driving real Chrome against
`localhost:3000`), covering register/login/reload/logout, every page of all three roles,
and UI mutations (edit profile, create study plan, create academic record, create user,
RBAC). It surfaced four issues that the API-only scripts could not catch — all fixed:

1. **Session lost on reload** — `SessionBootstrap` released the route tree as soon as
   `GET /auth/me` succeeded, but stored the user in a `useEffect` that runs after that
   commit, so `ProtectedRoute` briefly saw `isAuthenticated:false` and bounced to
   `/login`. Gate now stays on the spinner until the user is actually in the store.
2. **No dialog ever mounted** — `components/ui/dialog.tsx` wrapped `createPortal(...)`
   inside `<AnimatePresence>`. `createPortal` returns a portal object, not a valid React
   element, so `AnimatePresence` dropped it. The portal now wraps `AnimatePresence`.
   (Affected every dialog: edit profile, create plan/task/exam, add record, create user.)
3. **Crash on orphaned reference** — `typeof x.userId === 'object'` is true for
   `null`, so a populated ref that resolved to a deleted user threw
   `Cannot read properties of null (reading 'name')` on teacher/admin lists. Added
   `populatedName` / `populatedEmail` helpers in `lib/utils.ts` and used them everywhere.
4. **Delete user left orphaned profiles** — `adminService.deleteUser` only removed the
   `User`, leaving `Student`/`Teacher` (and their children) dangling, which is what fed
   issue 3. It now cascades to profiles, study plans/tasks/topics, progress, sessions,
   exams, records, subject topics, assignments, suggestions, and notifications.


## Root cause summary (why "backend not connected")

The single biggest reason the frontend appears disconnected in local development:

- `frontend/vite.config.ts:17` hardcodes the dev proxy target to `http://localhost:5000`
- but `backend/.env:1` runs the server on `PORT=5005`
- and `frontend/.env:6` already declares the correct target `VITE_DEV_API_TARGET=http://localhost:5005`, which the Vite config ignores.

So in dev, every `/api/*` request is proxied to a port where nothing is listening.
See `plan/00-connection-and-setup.md`.

Secondary but important: the login "works" only within a single page session. On a
full refresh the Zustand auth store resets (non-persisted) and `SessionBootstrap` is
never mounted, so `ProtectedRoute` bounces you back to `/login`. Also `GET /api/auth/me`
returns a different shape (`_id`, no `user`/`profile` wrapper) than login/register.

## Roles & sections

| Role | Sections |
|---|---|
| Shared | Auth (login/register), Dashboard shell, Notifications, Global search |
| Teacher | Dashboard, Students, Records, Assignments, Subjects |
| Student | Dashboard, Profile, Study Plans, Tasks, Study Session, Assignments, Exams, Progress, AI Advisor, Records |
| Admin | Dashboard, Users, Teachers, Students |

## Plan index

### Foundation
- [00 — Connection & Setup](00-connection-and-setup.md) — proxy/CORS/env/Docker
- [01 — Authentication](01-auth.md) — login, register, refresh, `/me`, session restore
- [02 — Shared Shell](02-shared-shell.md) — layout, sidebar, protected routes, notifications, search

### Teacher
- [Teacher — Dashboard](teacher/01-dashboard.md)
- [Teacher — Students](teacher/02-students.md)
- [Teacher — Records](teacher/03-records.md)
- [Teacher — Assignments](teacher/04-assignments.md)
- [Teacher — Subjects](teacher/05-subjects.md)

### Student
- [Student — Dashboard](student/01-dashboard.md)
- [Student — Profile](student/02-profile.md)
- [Student — Study Plans](student/03-study-plans.md)
- [Student — Tasks](student/04-tasks.md)
- [Student — Study Session](student/05-study-session.md)
- [Student — Assignments](student/06-assignments.md)
- [Student — Exams](student/07-exams.md)
- [Student — Progress](student/08-progress.md)
- [Student — AI Advisor](student/09-ai-advisor.md)
- [Student — Records](student/10-records.md)

### Admin
- [Admin — Dashboard](admin/01-dashboard.md)
- [Admin — Users](admin/02-users.md)
- [Admin — Teachers](admin/03-teachers.md)
- [Admin — Students](admin/04-students.md)

## Status legend

- `TODO` — not yet verified
- `VERIFY` — under verification
- `DONE` — verified working, no action
- `FIXED` — bugs fixed and re-verified

## Execution order

1. **Phase 0 — Foundation:** 00 connection, 01 auth, 02 shared shell
2. **Phase 1 — Teacher:** dashboard → students → records → assignments → subjects
3. **Phase 2 — Student:** dashboard → profile → study plans → tasks → study session → assignments → exams → progress → ai advisor → records
4. **Phase 3 — Admin:** dashboard → users → teachers → students

Every phase must end with: backend + frontend running, login as that role, and each
section checklist fully ticked.

## How to run locally (current)

```bash
# 1. MongoDB (docker) or local mongod
docker compose up -d mongodb

# 2. Backend (port 5005 per backend/.env)
cd backend && npm install && npm run dev

# 3. Frontend (port 3000)
cd frontend && npm install && npm run dev
```

> NOTE: the proxy/port mismatch described above (frontend → 5000, backend → 5005) is fixed in plan 00.
