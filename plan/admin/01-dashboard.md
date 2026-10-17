# Admin — Dashboard

- **Role:** admin
- **Routes:** `/dashboard` and `/dashboard/admin` (duplicated — see issues)
- **Sidebar label:** Dashboard
- **Status:** FIXED (`isError` + `QueryErrorState` (no more silent zeros); duplicate `/dashboard/admin` route removed — admin lands on `/dashboard` via `DashboardPage` and the sidebar Dashboard item (now `/dashboard`) highlights correctly).

## Purpose

System overview: counts of users, students, teachers, records, plans, AI suggestions,
and a breakdown of users by role.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/admin/AdminDashboard.tsx` | stat cards + role breakdown |
| `frontend/src/hooks/useAdmin.ts` | `useAdminStats` (`['admin','stats']`) |
| `frontend/src/api/admin.ts` | `getStats` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/adminController.ts:142` | `getSystemStats` |
| `backend/src/services/adminService.ts:169-200` | aggregations |

## Data contract

`GET /api/admin/stats` →
`{ totalUsers, totalStudents, totalTeachers, totalAcademicRecords, totalStudyPlans, totalAISuggestions, usersByRole: { role: count } }`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | No error handling → API failure renders all cards as `0`, silently wrong | `AdminDashboard.tsx:10,13-18` | Add `isError` + `QueryErrorState` |
| 2 | Medium | Admin dashboard renders at both `/dashboard` (via `DashboardPage`) and `/dashboard/admin`; no nav highlight at `/dashboard` | `App.tsx:66,80`, `Dashboard.tsx:13-15`, `Sidebar.tsx:147` | De-duplicate; route `/dashboard` per role |
| 3 | Low | `usersByRole` rendered via `Object.entries` — fine, matches backend | `AdminDashboard.tsx:65,72` | — |

## Verification checklist

- [ ] Login as admin → stats load with real counts.
- [ ] Role breakdown matches reality.
- [ ] Sidebar "Dashboard" highlights.
- [ ] On API failure an error (not zeros) is shown (after fix).
- [ ] 200 for `/api/admin/stats`.

## Fix plan

1. Add error handling.
2. Resolve the dual dashboard route/nav-highlight issue.
3. Re-run checklist.
