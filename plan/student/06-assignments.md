# Student — Assignments

- **Role:** student
- **Route:** `/dashboard/student/assignments`
- **Sidebar label:** Assignments
- **Status:** FIXED (teacher assignment creation sets `studentId`; student list matches `studentId` OR `academicRecordId`; submit wrapped in try/catch; `isError` state).

## Purpose

List assignments assigned to the student and submit answers.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/student/StudentAssignmentsPage.tsx` | list + view/submit |
| `frontend/src/hooks/useStudent.ts` | `useAssignments`, `submitAssignment` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/studentController.ts:204-218` | get/submit |
| `backend/src/services/studentService.ts:167-177` | matches by `academicRecordId` or `studentId` |
| `backend/src/validators/studentValidator.ts:70-72` | `submitAssignmentSchema` |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| List | `GET /api/student/assignments` | — | `Assignment[]` (teacherId/studentId as raw IDs) |
| Submit | `POST /api/student/assignments/:id/submit` | `{ studentAnswer }` | `Assignment` |

Fields used: `_id, title, subjectName, dueDate, marks, submitted, studentAnswer`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | Assignments created by teachers via `POST /api/teacher/assignments` have no `studentId` → student list query matches only `academicRecordId`; single-created ones may be invisible | `studentService.ts:167-177`, `teacherService.ts:122-126` | Set `studentId` on creation |
| 2 | Medium | No error state → failure shows "No assignments" | `StudentAssignmentsPage.tsx:21` | Add `isError` + `QueryErrorState` |
| 3 | Medium | Submit awaited without try/catch; rejected promise is unhandled (dialog stays open) | `StudentAssignmentsPage.tsx:61` | Wrap in try/catch |
| 4 | Low | No delete/refresh path (backend also has none) | — | Optional |

## Verification checklist

- [ ] Assignment list loads with due dates, marks, submitted state.
- [ ] Open an assignment → description + answer view.
- [ ] Submit an answer → status flips to submitted; persists after refresh.
- [ ] Empty answer rejected by validation.
- [ ] 200s for GET/submit.

## Fix plan

1. Ensure teacher assignment creation sets `studentId` (see teacher/04).
2. Add error state + try/catch on submit.
3. Re-run checklist.
