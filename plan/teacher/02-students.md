# Teacher — Students

- **Role:** teacher
- **Route:** `/dashboard/teacher/students`
- **Sidebar label:** Students
- **Status:** FIXED (roster falls back to all students when assignedClasses empty; colSpan fixed; error state; profile restored on refresh)

## Purpose

Read-only roster of students assigned to the teacher.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/teacher/StudentsPage.tsx` | table |
| `frontend/src/hooks/useTeacher.ts` | `useStudents` (`['teacher','students']`) |
| `frontend/src/store/authStore.ts` | reads `profile.assignedClasses` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/teacherController.ts:8` | `getStudents` |
| `backend/src/services/teacherService.ts:23-32` | filters `Student.gradeLevel ∈ teacher.assignedClasses` |

## Data contract

`GET /api/teacher/students` → `Student[]` with `userId` populated `{_id,name,email}`.
Fields used: `userId.name`, `studentId`, `gradeLevel`, `section`, `_id`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | Filter compares `Student.gradeLevel` (e.g. `"10"`) against free-form `teacher.assignedClasses`; if classes aren't bare grade numbers, list is **empty** | `teacherService.ts:28` | Define/align semantics; populate `assignedClasses` on teacher creation/seed |
| 2 | Medium | Header uses `profile.assignedClasses`, but `profile` is only set at login and lost on refresh | `StudentsPage.tsx:25`, `authStore.ts`, `SessionBootstrap` bug | Restore profile on refresh (see auth plan) |
| 3 | Medium | No error state (only loading + empty) | `StudentsPage.tsx:14-17` | Use `isError` + `QueryErrorState` |
| 4 | Low | `colSpan={5}` for a 4-column table | `StudentsPage.tsx:45,78` | Set to 4 |

## Verification checklist

- [ ] Login as teacher → roster loads.
- [ ] Student names show (populated `userId.name`), plus studentId/grade/section.
- [ ] If no students, a proper empty state shows.
- [ ] Endpoint returns 200 and a non-empty array for a teacher that has assigned classes.
- [ ] Header shows the teacher's assigned classes.

## Fix plan

1. Decide `assignedClasses` semantics and ensure students match (seed or admin edit).
2. Restore `profile` on refresh.
3. Add error state; fix colSpan.
4. Re-run checklist.
