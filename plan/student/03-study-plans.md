# Student — Study Plans

- **Role:** student
- **Route:** `/dashboard/student/study-plans`
- **Sidebar label:** Study Plans
- **Status:** FIXED (query key standardized; delete invalidates tasks+topics; backend cascades `StudyTopic` deletion; create payload type aligned; `isError` state; edit date `min` relaxed).

## Purpose

Create/update/delete weekly study plans.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/student/StudyPlansPage.tsx` | list + dialogs |
| `frontend/src/hooks/useStudent.ts` | `useStudyPlans` (`['student','studyPlans']`), CRUD |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/studentController.ts:36-78` | plans CRUD |
| `backend/src/services/studentService.ts:37-73` | delete cascades tasks (not topics) |
| `backend/src/validators/studentValidator.ts:12-20` | `studyPlanSchema` requires `weekStartDate` |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| List | `GET /api/student/study-plans` | — | `StudyPlan[]` |
| Create | `POST /api/student/study-plans` | `{ weekStartDate, status? }` | `StudyPlan` (201) |
| Update | `PUT /api/student/study-plans/:id` | `{ weekStartDate?, status? }` | `StudyPlan` |
| Delete | `DELETE /api/student/study-plans/:id` | — | `{ message }` |

`StudyPlan` = `{ _id, studentId, weekStartDate, status }`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | Query key `['student','studyPlans']` differs from dashboard/GlobalSearch `['student','study-plans']` → split cache | `useStudent.ts:17`, `StudentDashboard.tsx:47` | Standardize key |
| 2 | High | `deleteStudyPlan` cascades tasks on backend but hook doesn't invalidate `['student','tasks']` → orphaned tasks shown | `useStudent.ts:88-103`, `studentService.ts:71` | Invalidate tasks on delete |
| 3 | Medium | Create payload type `Omit<StudyPlan,'_id'\|'studentId'\|'status'>` but page sends `status` | `api/student.ts`, `StudyPlansPage.tsx:34-40` | Align type or drop status |
| 4 | Medium | Backend `deleteStudyPlan` orphans `StudyTopic` docs for deleted tasks | `studentService.ts:71` | Cascade topics too |
| 5 | Low | No error state | `StudyPlansPage.tsx:69-117` | Add `isError` |
| 6 | Low | Date min = today may block editing historical plans | `StudyPlansPage.tsx:127,145` | Relax for edit |

## Verification checklist

- [ ] Plans list loads with dates + status badges.
- [ ] Create a plan → appears; toast.
- [ ] Edit plan date/status → persists.
- [ ] Delete a plan → removed; associated tasks also gone from Tasks page.
- [ ] No duplicate/stale plan entries after CRUD.

## Fix plan

1. Standardize query keys; invalidate tasks (`and topics`) on plan delete.
2. Align create payload type.
3. Cascade topic deletion on backend.
4. Add error state.
5. Re-run checklist.
