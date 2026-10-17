# Student — Exams

- **Role:** student
- **Route:** `/dashboard/student/exams`
- **Sidebar label:** Exams
- **Status:** FIXED (`isError` state; add/edit wrapped in try/catch; backend `updateExam` scoped by `studentId`).

## Purpose

Add/edit upcoming exams with type, date, and preparation level.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/student/ExamsPage.tsx` | list + add/edit dialogs |
| `frontend/src/hooks/useStudent.ts` | `useExams`, `addExam`, `updateExam` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/studentController.ts:156-184` | get/add/update |
| `backend/src/services/studentService.ts:131-134` | `Exam.find({studentId}).sort({examDate:1})` |
| `backend/src/validators/studentValidator.ts:49-54` | `examSchema` |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| List | `GET /api/student/exams` | — | `Exam[]` |
| Add | `POST /api/student/exams` | `{ subjectName, examType, examDate, preparationLevel }` | `Exam` (201) |
| Update | `PUT /api/student/exams/:id` | subset | `Exam` |

`Exam` = `{ _id, studentId, subjectName, examType, examDate, preparationLevel }`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | Medium | No error state → 500 shows "No exams found" | `ExamsPage.tsx:23` | Add `isError` |
| 2 | Medium | `addExam`/`updateExam` awaited without try/catch → unhandled rejection | `ExamsPage.tsx:35,43` | Wrap in try/catch |
| 3 | Low | No delete route on backend or UI | — | Optional |
| 4 | Low | Backend has no ownership check on `updateExam/:id` | `studentService.ts` | Scope by student |

## Verification checklist

- [ ] Exams list loads sorted by date.
- [ ] Add an exam → appears; toast.
- [ ] Edit an exam → persists after refresh.
- [ ] Date/preparation-level inputs accept valid values.
- [ ] 200s for GET/POST/PUT.

## Fix plan

1. Add error state + try/catch.
2. Add/confirm ownership scoping.
3. Re-run checklist.
