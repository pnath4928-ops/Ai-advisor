# Teacher — Assignments

- **Role:** teacher
- **Route:** `/dashboard/teacher/assignments`
- **Sidebar label:** Assignments
- **Status:** FIXED (single create sets studentId; analytics counts by teacherId so bulk included; score max guard; error state)

## Purpose

Bulk-create assignments for selected students, edit them, and review/grade submissions.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/teacher/AssignmentsPage.tsx` | list, create/bulk, review modal |
| `frontend/src/hooks/useTeacher.ts` | `useAssignments`, `useStudents`, `createBulkAssignments`, `updateAssignment` |
| `frontend/src/api/teacher.ts` | also exposes unused `createAssignment` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/teacherController.ts:108-146` | create/bulk/get/update |
| `backend/src/services/teacherService.ts:122-168` | bulk sets `studentId`, not `academicRecordId` |
| `backend/src/validators/teacherValidator.ts:24-58` | schemas |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| List | `GET /api/teacher/assignments` | — | `Assignment[]`, `studentId` populated |
| Bulk create | `POST /api/teacher/assignments/bulk` | `{ title, description?, subjectName, dueDate, marks, studentIds[] }` | `Assignment[]` |
| Update | `PUT /api/teacher/assignments/:id` | `{ title?, dueDate?, marks? }` | `Assignment` |
| Single create | `POST /api/teacher/assignments` | requires `academicRecordId` | `Assignment` (unused by UI) |

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | Bulk assignments set `studentId` but not `academicRecordId` → teacher analytics `totalAssignments`/`submissionRate` stay 0 | `teacherService.ts:135-146`, `analyticsService.ts:55-57` | Also derive/set `academicRecordId`, or change analytics |
| 2 | Medium | Single-created assignments have no `studentId` → populate resolves `null` in list | `teacherService.ts:122-126,167` | Set `studentId` consistently |
| 3 | Medium | "Review" flow always opens an academic-record form with zeroed defaults → can create 0-score records | `AssignmentsPage.tsx:128,135-146` | Add a read-only review path / require values |
| 4 | Low | Score input `max={marks}`; if `marks===0` score locked to 0 | `AssignmentsPage.tsx:422` | Guard for 0 marks |
| 5 | Medium | No error state; dialogs don't close on mutation failure | `AssignmentsPage.tsx:25,82-149` | Add try/catch + `isError` |
| 6 | Low | `updateAssignment` typed `Partial<Assignment>` (allows fields the validator strips) | `api/teacher.ts` | Narrow the type |

## Verification checklist

- [ ] Assignments list loads with student names and submitted/pending status.
- [ ] Bulk-create for multiple students → rows appear for each selected student.
- [ ] Edit title/dueDate/marks → persists.
- [ ] Review a submitted answer and grade it.
- [ ] Tabs/filters show correct subsets.
- [ ] Analytics (teacher dashboard) reflects created assignments (after bug #1 fixed).

## Fix plan

1. Set both `studentId` and `academicRecordId` on assignment creation consistently (backend).
2. Fix analytics query basis or backfill.
3. Add read-only review and safe grading defaults.
4. Add error handling.
5. Re-run checklist.
