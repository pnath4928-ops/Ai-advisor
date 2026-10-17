# Teacher — Subjects (Subject Topics)

- **Role:** teacher
- **Route:** `/dashboard/teacher/subjects`
- **Sidebar label:** Subjects
- **Status:** FIXED (type union + edit-form normalize; null-guarded populated ref; single useTeacher call; error state)

## Purpose

Create/edit/delete topic ratings under an academic record (e.g. topic quality remarks).

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/teacher/SubjectsPage.tsx` | cards + add/edit/delete |
| `frontend/src/hooks/useTeacher.ts` | `useSubjectTopics`, `useAcademicRecords`, add/update/delete |
| `frontend/src/types/index.ts` | `SubjectTopic` (academicRecordId typed `string` — **wrong**) |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/teacherController.ts:56-98` | add/get/update/delete |
| `backend/src/services/teacherService.ts:98-112` | GET populates `academicRecordId` |
| `backend/src/validators/teacherValidator.ts:24-42` | `subjectTopicSchema` / update |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| List | `GET /api/teacher/subjects` | — | `SubjectTopic[]`, `academicRecordId` populated `{_id, subjectName, studentId}` |
| Add | `POST /api/teacher/subjects` | `{ academicRecordId, topicName, rating, remarks }` | `SubjectTopic` |
| Update | `PUT /api/teacher/subjects/:id` | `{ topicName?, rating?, remarks? }` | `SubjectTopic` |
| Delete | `DELETE /api/teacher/subjects/:id` | — | `{ message }` |

Rating enum: `excellent | good | average | needs_improvement`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | `SubjectTopic.academicRecordId` typed `string` but API returns object; edit form stores the object | `types/index.ts:52`, `SubjectsPage.tsx:62` | Fix type; don't assign object into form |
| 2 | Low | Edit sends `academicRecordId` which the update schema strips | `SubjectsPage.tsx:48` | Remove from edit payload |
| 3 | Medium | `update/deleteSubjectTopic` dereference populated ref without null check → 500 if record deleted | `teacherService.ts:85,99` | Null-guard |
| 4 | Medium | No error state; dialogs stay open on failure | `SubjectsPage.tsx:23,38-58` | Add try/catch + `isError` |
| 5 | Low | `useTeacher()` called twice in one component | `SubjectsPage.tsx:22,35` | Use one instance |

## Verification checklist

- [ ] Topics list loads with the parent academic record/subject shown.
- [ ] Add a topic with a rating and remarks → appears.
- [ ] Edit topic name/rating/remarks → persists.
- [ ] Delete a topic → removed; toast confirms.
- [ ] No crash if the parent academic record was deleted.

## Fix plan

1. Fix the `SubjectTopic.academicRecordId` type and edit-form handling.
2. Null-guard populated refs in the service.
3. Add error handling; consolidate the hook call.
4. Re-run checklist.
