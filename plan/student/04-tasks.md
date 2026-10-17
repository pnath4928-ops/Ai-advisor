# Student — Tasks

- **Role:** student
- **Route:** `/dashboard/student/tasks`
- **Sidebar label:** Tasks
- **Status:** FIXED (backend ownership scoping for tasks/topics; `remainingMinutes` initialized; topic edit is now incremental diff (update/create/delete) instead of destructive delete+recreate; `deleteTask` invalidates topics; `isError` state). Low follow-ups: `window.confirm` (#6), available-days logic (#7).

## Purpose

Create/edit/delete study tasks grouped by day, each with sub-topics.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/student/TasksPage.tsx` | grouped task lists + dialogs |
| `frontend/src/hooks/useStudent.ts` | `useTasks`, `useStudyPlans`, task CRUD |
| `frontend/src/api/studyTopic.ts` | topic CRUD used during task save |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/studentController.ts:88-131` | tasks CRUD |
| `backend/src/services/studentService.ts:75-107` | create/update/delete |
| `backend/src/validators/studentValidator.ts:22-40` | task schemas |
| `backend/src/routes/studentRoutes.ts` | topics endpoints |

## Data contract

| Action | Method + path | Request |
|---|---|---|
| List tasks | `GET /api/student/tasks` | — |
| Create task | `POST /api/student/tasks` | `{ studyPlanId, day, subjectName, plannedMinutes, studyTechnique }` |
| Update task | `PUT /api/student/tasks/:id` | subset |
| Delete task | `DELETE /api/student/tasks/:id` | — |
| Create topics | `POST /api/student/topics` | `{ studyTaskId, topics:[{topicName, plannedMinutes}] }` |
| Get topics | `GET /api/student/topics/task/:taskId` | — |
| Delete topic | `DELETE /api/student/topics/:id` | — |

`StudyTask` = `{ _id, studyPlanId, day, subjectName, plannedMinutes, studiedMinutes, remainingMinutes, progressPercentage, studyTechnique, status, completedAt? }`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | Editing a task deletes **all** its topics then recreates them → destructive, N sequential calls, partial-failure risk | `TasksPage.tsx:229-243` | Diff/update topics instead of delete+recreate |
| 2 | High | Backend has **no ownership checks** on tasks/topics → any student can edit/delete another's data | `studentService.ts:82-95`, `studyTopicController.ts` | Scope all queries by student |
| 3 | Medium | `deleteTask` (hook) doesn't invalidate `['student','topics']` | `useStudent.ts:122` | Invalidate topics |
| 4 | Medium | No query error state | `TasksPage.tsx:204-289` | Add `isError` |
| 5 | Medium | `createTask` doesn't set `remainingMinutes` (defaults 0) until a session recalculates | `studentService.ts:82-87`, `models/StudyTask.ts:43` | Initialize remaining = planned |
| 6 | Low | Uses `window.confirm` for delete (inconsistent with modal UX) | `TasksPage.tsx:186` | Use delete dialog |
| 7 | Low | Available-days filter depends on plan dates; past plans may block all days | `TasksPage.tsx:77-95` | Review logic |

## Verification checklist

- [ ] Tasks list grouped by day with minutes and status.
- [ ] Create a task with topics → task + topics appear.
- [ ] Edit a task (rename, change minutes, edit topics) → persists; topics correct (no lost topics).
- [ ] Delete a task → removed; its topics gone.
- [ ] Grouping/sums correct.
- [ ] 200s for all endpoints.

## Fix plan

1. Replace destructive topic replacement with incremental updates.
2. Add backend ownership scoping for tasks/topics.
3. Add topic invalidation + error state; initialize `remainingMinutes`.
4. Re-run checklist.
