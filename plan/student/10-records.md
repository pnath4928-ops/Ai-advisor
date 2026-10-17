# Student — Records (Academic Records)

- **Role:** student
- **Route:** `/dashboard/student/academic-records`
- **Sidebar label:** Records
- **Status:** FIXED (`isError` + `QueryErrorState` added; query key matches hook key).

## Purpose

Read-only view of academic records entered by teachers (subject, term, score, grade,
attendance, notes).

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/student/StudentAcademicRecordsPage.tsx` | table |
| `frontend/src/api/student.ts` | `getAcademicRecords` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/studentController.ts:194` | `getAcademicRecords` |
| `backend/src/services/studentService.ts:160-165` | populates `teacherId` |

## Data contract

`GET /api/student/academic-records` → `AcademicRecord[]` with `teacherId` populated
`{_id, teacherId}`. Fields used: `subjectName, term, score, grade, attendedClasses,
totalClasses, teacherNotes`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | Low | Uses direct `useQuery` instead of `useStudent` hook (inconsistent) | `StudentAcademicRecordsPage.tsx:9-13` | Optionally use hook |
| 2 | Medium | No error state → failure shows "No records found" | `StudentAcademicRecordsPage.tsx:35-63` | Add `isError` |
| 3 | Low | Query key `['student','academicRecords']` matches hook key (OK) | — | — |

## Verification checklist

- [ ] Records list loads with subject, term, score, grade, attendance.
- [ ] Attendance shows `attended/total`.
- [ ] Empty state when no records.
- [ ] 200 for the endpoint.

## Fix plan

1. Add error state.
2. Re-run checklist.
