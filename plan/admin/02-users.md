# Admin — Users

- **Role:** admin
- **Route:** `/dashboard/admin/users`
- **Sidebar label:** Users
- **Status:** FIXED (`isError` + `QueryErrorState`; pagination UI + `page` param; create-user dialog + delete action wired to `createUser`/`deleteUser`; backend `POST /admin/users` now strips the password hash; admin route validators added; search regex escaped).

> Browser pass: create-user dialog verified in Chrome. **`deleteUser` now cascades** — it
> previously deleted only the `User`, leaving `Student`/`Teacher` profiles (and their study
> plans, tasks, topics, progress, sessions, exams, records, subject topics, assignments,
> suggestions, notifications) orphaned. Those orphans populated as `null` and crashed
> teacher/admin lists with `Cannot read properties of null (reading 'name')`. Frontend was
> also hardened with `populatedName`/`populatedEmail` helpers in `lib/utils.ts`.

## Purpose

Browse/filter all system users by role/search. (Backend also supports create/delete.)

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/admin/UsersPage.tsx` | list + search + role filter (read-only) |
| `frontend/src/hooks/useAdmin.ts` | `useAdminUsers` (`['admin','users',params]`) |
| `frontend/src/api/admin.ts` | `getUsers`, plus unused `createUser`/`deleteUser` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/routes/adminRoutes.ts` | CRUD routes (no validators) |
| `backend/src/controllers/adminController.ts:14-59` | handlers |
| `backend/src/services/adminService.ts:8-64` | paged queries, search name/email |

## Data contract

`GET /api/admin/users?role=&search=&page=` → `{ users: [{ _id, name, email, role, createdAt }], total, page, totalPages }` (limit 20).

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | Medium | No error state → failure renders a blank list with count 0 (EmptyState won't show) | `UsersPage.tsx:53-78` | Add `isError` + `QueryErrorState` |
| 2 | Medium | No pagination UI though backend returns `page`/`totalPages` and caps at 20 | `UsersPage.tsx`, `api/admin.ts:40-44` | Add pagination + `page` param |
| 3 | Medium | `createUser`/`deleteUser` exist but are unused — no create/delete UI despite "Manage" title | `api/admin.ts:55-61` | Add UI or remove dead API |
| 4 | High (security) | Backend `POST /admin/users` returns the password hash; no validators on admin routes | `adminService.ts:39-52` | Strip password; add validation |
| 5 | High (security) | Backend admin search interpolates raw input into `$regex` (ReDoS); `escapeRegex` util unused | `adminService.ts:22-23` | Escape input |
| 6 | Low | Filter by role works via server; verify combos | `UsersPage.tsx:21` | — |

## Verification checklist

- [ ] Users list loads with name/email/role.
- [ ] Role filter narrows results (server-side).
- [ ] Search by name/email returns matches.
- [ ] More than 20 users → pagination works (after fix).
- [ ] 200 for `/api/admin/users`.

## Fix plan

1. Add error state and pagination.
2. Decide on create/delete UI vs removing dead API.
3. Backend: strip password from responses, escape regex, add validators.
4. Re-run checklist.
