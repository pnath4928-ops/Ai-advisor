# Admin — Teachers

- **Role:** admin
- **Route:** `/dashboard/admin/teachers`
- **Sidebar label:** Teachers
- **Status:** FIXED (backend search now matches name/email via resolved `User` ids + `teacherId`/`department`, regex escaped; `isError` + `QueryErrorState`; pagination UI). Note: create/edit endpoints remain read-only on the frontend (no wrapper/UI).

## Purpose

Browse/search teacher profiles (name/email, teacherId, department, assigned classes).

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/admin/TeachersPage.tsx` | list + search (read-only) |
| `frontend/src/hooks/useAdmin.ts` | `useAdminTeachers` (`['admin','teachers',params]`) |
| `frontend/src/api/admin.ts` | `getTeachers` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/adminController.ts:73-107` | handlers |
| `backend/src/services/adminService.ts:66-96` | populates `userId`; **search only teacherId/department** |

## Data contract

`GET /api/admin/teachers?search=&page=` → `{ teachers: [{ _id, userId:{_id,name,email}, teacherId, department, designation, assignedSubjects[], assignedClasses[] }], total, page, totalPages }`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | UI displays `userId.name/email` and placeholder "Search teachers...", but backend searches only `teacherId`/`department` → **name/email search returns nothing** | `TeachersPage.tsx:27`, `adminService.ts:78-83` | Extend backend search to populated name/email (or search users first) |
| 2 | Medium | No error state → blank list on failure | `TeachersPage.tsx:34-66` | Add `isError` |
| 3 | Medium | No pagination UI (limit 20) | `TeachersPage.tsx` | Add pagination |
| 4 | Medium | Backend has `POST/PUT /admin/teachers` but no frontend wrapper/UI (read-only) | `adminRoutes.ts:16-17` | Add UI or note read-only |
| 5 | Low | `userId` union guard degrades to 'Unknown' if not populated (backend always populates) | `TeachersPage.tsx:41-42` | Fine |

## Verification checklist

- [ ] Teachers list loads with name/email/teacherId/department/class count.
- [ ] Search by teacherId returns matches.
- [ ] Search by name/email returns matches (after fix #1).
- [ ] Pagination works beyond 20 (after fix).
- [ ] 200 for `/api/admin/teachers`.

## Fix plan

1. Extend backend search to name/email.
2. Add error state + pagination.
3. Decide on teacher create/edit UI.
4. Re-run checklist.
