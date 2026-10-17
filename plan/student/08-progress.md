# Student — Progress

- **Role:** student
- **Route:** `/dashboard/student/progress`
- **Sidebar label:** Progress
- **Status:** FIXED (student mutations invalidate `['analytics','student','progress']`; `isError` state). Follow-ups: unify `studyStreak` algorithms (#3), reconcile `logProgress` with task progress (#5).

## Purpose

Overall progress analytics: study time, task completion, assignments, exams,
term GPA, achievements, and daily/weekly charts.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/student/StudentProgressPage.tsx` | overview + charts + lists |
| `frontend/src/hooks/useAnalytics.ts` | `useStudentProgress` (`['analytics','student','progress']`) |

## Backend files

| File | Notes |
|---|---|
| `backend/src/services/analyticsService.ts:202-354` | `getStudentProgressData` |
| `backend/src/controllers/analyticsController.ts:28` | `getStudentProgress` |

## Data contract

`GET /api/analytics/student/progress` →
`{ totalStudyHours, todayMinutes, weekMinutes, monthMinutes, avgFocusScore, totalTasks, completedTasks, taskCompletionRate, submittedAssignments, avgAssignmentScore, upcomingExams, completedExams, avgExamScore, avgGpa, studyStreak, assignments[], exams[], performanceByTerm[], recentSessions[], achievements[], charts:{daily[],weekly[]} }`.

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | Query is never invalidated by student mutations → page stays stale (with `refetchOnWindowFocus:false`) | `useStudent.ts:130-175`, `useAnalytics.ts:18` | Invalidate `['analytics','student','progress']` on logProgress/submit/addExam/task CRUD |
| 2 | Medium | Error conflated with empty: failure shows "No progress data available yet" with no retry | `StudentProgressPage.tsx:27` | Add `isError` + `QueryErrorState` |
| 3 | Medium | Two different `studyStreak` algorithms (`/student` vs `/progress`) can disagree | `analyticsService.ts:165-178,356-374` | Unify |
| 4 | Low | `recentSessions`, `avgExamScore` returned but unused | — | Optional display |
| 5 | Low | `logProgress` never updates task progress (diverges from session path) | `studentService.ts:110-122` | Reconcile |

## Verification checklist

- [ ] Progress page loads all overview stats and charts.
- [ ] Values match actual tasks/sessions/exams/assignments.
- [ ] After logging a session/task, values update (after bug #1 fixed).
- [ ] Charts render with data; graceful when empty.
- [ ] 200 for the endpoint.

## Fix plan

1. Add cross-feature invalidation for the progress key.
2. Add error state.
3. Unify streak + progress logic.
4. Re-run checklist.
