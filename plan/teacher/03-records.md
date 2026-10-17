# Teacher — Records (Academic Records)

- **Role:** teacher
- **Route:** `/dashboard/teacher/academic-records`
- **Sidebar label:** Records
- **Status:** FIXED (type union for populated studentId; backend enforces attended ≤ total; error state; verified 400 on invalid attendance)

## Purpose

Create/edit academic records (subject, term, score, grade, attendance) per student.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/teacher/AcademicRecordsPage.tsx` | table + add/edit dialogs |
| `frontend/src/hooks/useTeacher.ts` | `useAcademicRecords`, `useStudents`, add/update mutations |
| `frontend/src/types/index.ts` | `AcademicRecord` (studentId typed `string` — **wrong**) |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/teacherController.ts` | add/get/update |
| `backend/src/services/teacherService.ts:58-63` | GET populates `studentId` |
| `backend/src/validators/teacherValidator.ts:3-22` | `academicRecordSchema` |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| List | `GET /api/teacher/academic-records` | — | `AcademicRecord[]`, `studentId` populated `{_id, studentId, gradeLevel}` |
| Add | `POST /api/teacher/academic-records` | `{ studentId, subjectName, term, totalClasses, attendedClasses, score, grade, teacherNotes }` | `AcademicRecord` (adds teacherId) |
| Update | `PUT /api/teacher/academic-records/:id` | subset of the above | updated doc |

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | `AcademicRecord.studentId` typed `string` but API returns a populated object; page double-casts | `types/index.ts:40`, `AcademicRecordsPage.tsx:63,123` | Fix the type to `string \| { _id; studentId; gradeLevel }` |
| 2 | Low | Edit sends `studentId` which `updateAcademicRecordSchema` strips silently | `AcademicRecordsPage.tsx:55,63` | Remove from edit payload |
| 3 | Medium | No error state; mutation dialogs don't close on rejection (only toast) | `AcademicRecordsPage.tsx:24,45-50` | Add `isError` + try/catch |
| 4 | Medium | Backend doesn't enforce `attendedClasses ≤ totalClasses` → attendance > 100% possible | `teacherValidator.ts:3-22`, analytics | Validate on backend |

## Verification checklist

- [ ] Records list loads with student names (populated).
- [ ] Add a record → appears in list; toast confirms.
- [ ] Edit a record → values persist after refresh.
- [ ] Score/grade/attendance render correctly; grade dropdown works.
- [ ] Deleting/handling invalid data doesn't crash.
- [ ] 200s in Network tab.

## Fix plan

1. Correct the `AcademicRecord.studentId` type.
2. Drop `studentId` from the update payload.
3. Add error handling + close dialog on failure.
4. Add backend attendance validation.
5. Re-run checklist.
