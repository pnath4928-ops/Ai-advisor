# Student — Dashboard

- **Role:** student
- **Route:** `/dashboard`
- **Sidebar label:** Dashboard
- **Status:** FIXED (study-plans query key standardized; `generateFullPlan` invalidates study-plans/tasks/ai/weak-subjects/analytics/progress; dashboard error banner added). Low follow-ups: hook dedup (#2), DashboardStats type alignment (#5), structured weak-data detection (#6).

## Purpose

Student landing page: stat grid, pending tasks, AI suggestions, weak-subject analysis,
study-plan/task generation shortcuts, and charts.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/StudentDashboard.tsx` | main |
| `frontend/src/hooks/useDashboardStats.ts` | `['analytics','student']` |
| `frontend/src/hooks/useAnalytics.ts` | `useStudentAnalytics` (same key) |
| `frontend/src/components/study/DashboardStatsGrid.tsx` | stat grid |
| `frontend/src/components/charts/StudyHoursChart.tsx`, `SubjectPerformanceChart.tsx` | charts |
| `frontend/src/api/student.ts`, `api/ai.ts`, `api/analytics.ts` | data |

## Backend files

| File | Notes |
|---|---|
| `backend/src/services/analyticsService.ts:180-199` | `/analytics/student` |
| `backend/src/services/aiService.ts` | suggestions / weak-subjects / generate-plan |

## Data contract

| Data | Method + path | Query key |
|---|---|---|
| Study plans | `GET /api/student/study-plans` | `['student','study-plans']` |
| Tasks | `GET /api/student/tasks` | `['student','tasks']` |
| Exams | `GET /api/student/exams` | `['student','exams']` |
| Suggestions | `GET /api/ai/suggestions` | `['ai','suggestions']` |
| Weak subjects | `POST /api/ai/weak-subjects` | `['ai','weak-subjects']` |
| Analytics/stats | `GET /api/analytics/student` | `['analytics','student']` |
| Generate plan | `POST /api/ai/generate-plan` `{scope}` | mutation |
| Generate suggestion | `POST /api/ai/generate` `{type}` | mutation |

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | Study plans query key `['student','study-plans']` (kebab) differs from `useStudent` `['student','studyPlans']` (camel) → split cache; mutations don't refresh dashboard | `StudentDashboard.tsx:47`, `useStudent.ts:17` | Standardize one query key |
| 2 | Medium | `useDashboardStats` and `useStudentAnalytics` share key+queryFn (deduped but redundant/confusing) | `useDashboardStats.ts:5`, `useAnalytics.ts:11` | Consolidate into one hook |
| 3 | Medium | No query error handling; failures show zeros/empty | `StudentDashboard.tsx:46-69` | Add `isError` handling |
| 4 | Medium | `generateFullPlan` doesn't invalidate analytics/dashboard stats | `StudentDashboard.tsx:83-94` | Invalidate `['analytics','student']` |
| 5 | Low | DashboardStatsGrid expects `DashboardStats`, receives `StudentAnalytics` (structural overlap works) | `DashboardStatsGrid.tsx`, `useDashboardStats.ts` | Align types |
| 6 | Low | Weak-subjects academic-data detection via regex on `overallAnalysis` text is fragile | `StudentDashboard.tsx:99-100` | Use a structured field |

## Verification checklist

- [ ] Login as student → dashboard loads.
- [ ] Stats grid shows today/week/month minutes, task counts, streak.
- [ ] Pending tasks list shows real tasks (or empty state).
- [ ] AI suggestions list shows suggestions; accept/reject works.
- [ ] Weak-subject section renders when data exists.
- [ ] "Generate plan" creates a plan + tasks (verify they appear under Study Plans/Tasks).
- [ ] Charts render when analytics exist.
- [ ] 200s for all endpoints.

## Fix plan

1. Standardize the study-plans query key across dashboard/hooks/pages.
2. Consolidate the analytics hook.
3. Add error handling and cross-feature invalidation.
4. Re-run checklist.
