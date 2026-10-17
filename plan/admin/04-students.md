# Admin — Students

- **Role:** admin
- **Route:** `/dashboard/admin/students`
- **Sidebar label:** Students
- **Status:** FIXED (backend search now matches name/email via resolved `User` ids + `studentId`, regex escaped; `isError` + `QueryErrorState`; pagination UI; `gradeLevel` filter UI added). Note: create/edit endpoints remain read-only on the frontend (no wrapper/UI).

## Purpose

Browse/search student profiles (name/email, studentId, grade, section).

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/admin/StudentsPage.tsx` | list + search (read-only) |
| `frontend/src/hooks/useAdmin.ts` | `useAdminStudents` (`['admin','students',params]`) |
| `frontend/src/api/admin.ts` | `getStudents` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/adminController.ts:111-137` | handlers |
| `backend/src/services/adminService.ts:118-140` | populates `userId`; **search only studentId** |

## Data contract

`GET /api/admin/students?search=&gradeLevel=&page=` → `{ students: [{ _id, userId:{_id,name,email}, studentId, gradeLevel, section, learningPreference }], total, page, totalPages }`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | UI shows `userId.name/email` + "Search students..." but backend searches only `studentId` → **name/email search returns nothing** | `StudentsPage.tsx:27`, `adminService.ts:129-133` | Extend backend search to name/email |
| 2 | Medium | No error state → blank list on failure | `StudentsPage.tsx:34-66` | Add `isError` |
| 3 | Medium | No pagination UI (limit 20) | `StudentsPage.tsx` | Add pagination |
| 4 | Low | `gradeLevel` filter supported by hook/backend but no UI | `useAdmin.ts:25` | Add grade filter |
| 5 | Medium | Backend has `POST/PUT /admin/students` but no frontend wrapper/UI | `adminRoutes.ts:19-21` | Add UI or note read-only |

## Verification checklist

- [ ] Students list loads with name/email/studentId/grade/section.
- [ ] Search by studentId returns matches.
- [ ] Search by name/email returns matches (after fix #1).
- [ ] Grade filter works (after adding UI).
- [ ] Pagination works beyond 20 (after fix).
- [ ] 200 for `/api/admin/students`.

## Fix plan

1. Extend backend search to name/email.
2. Add error state + pagination (+ grade filter).
3. Decide on student create/edit UI.
4. Re-run checklist.
