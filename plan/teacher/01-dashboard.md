# Teacher — Dashboard

- **Role:** teacher
- **Route:** `/dashboard`
- **Sidebar label:** Dashboard
- **Status:** FIXED (attendance aggregated per subject; assignments counted by teacherId; analytics invalidated on mutations; error/loading states added)

## Purpose

Landing page for teachers: counts of students/records/assignments, a student roster,
and analytics charts.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/teacher/TeacherDashboard.tsx` (via `pages/Dashboard.tsx`) | main |
| `frontend/src/hooks/useAnalytics.ts` | `useTeacherAnalytics` |
| `frontend/src/api/teacher.ts` | students/records/assignments |
| `frontend/src/api/analytics.ts` | `getTeacherAnalytics` |
| `frontend/src/components/charts/GradeDistributionChart.tsx`, `AttendanceChart.tsx` | charts |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/teacherController.ts`, `services/teacherService.ts` | lists |
| `backend/src/controllers/analyticsController.ts`, `services/analyticsService.ts` | `/analytics/teacher` |

## Data contract

| Data | Method + path | Query key | Shape |
|---|---|---|---|
| Students | `GET /api/teacher/students` | `['teacher','students']` | `Student[]` (userId populated `{_id,name,email}`) |
| Records | `GET /api/teacher/academic-records` | `['teacher','academicRecords']` | `AcademicRecord[]` (studentId populated) |
| Assignments | `GET /api/teacher/assignments` | `['teacher','assignments']` | `Assignment[]` (studentId populated) |
| Analytics | `GET /api/analytics/teacher` | `['analytics','teacher']` | `{ gradeDistribution, subjectAverages, attendanceData, topicRatings, submissionRate, totalStudents, totalRecords, totalAssignments }` |

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | Medium | No error handling — failed queries render zeros/empty, no retry | `TeacherDashboard.tsx:27-42` | Use `isError` + `QueryErrorState` |
| 2 | Medium | Renders empty-state ("No students assigned") and 0 counters while still loading (no skeletons) | `TeacherDashboard.tsx:82-129` | Add loading skeletons |
| 3 | Medium | Analytics not invalidated after mutations elsewhere → charts stale | `hooks/useTeacher.ts:36-116` | Invalidate `['analytics','teacher']` |
| 4 | Low | Stat cards use list lengths while analytics section uses different basis; can disagree | `TeacherDashboard.tsx:44-46,178` | Pick one source |
| 5 | Medium | `attendanceData` is per-record, not aggregated per subject → duplicate X-axis bars despite label | `analyticsService.ts:36-39`, `AttendanceChart.tsx:10` | Aggregate by subject server-side |
| 6 | Medium | Bulk-created assignments have no `academicRecordId` → `totalAssignments`/`submissionRate` stay 0 | `teacherService.ts:135-146`, `analyticsService.ts:55-57` | Set `academicRecordId` or change analytics query |

## Verification checklist

- [ ] Login as teacher → dashboard loads without console errors.
- [ ] Student count matches number of students assigned to the teacher (may be 0 if `assignedClasses` not set — see Students plan).
- [ ] Records and Assignments counts render real numbers.
- [ ] Charts render when data exists; no chart renders when empty (no crash).
- [ ] Roster list shows student names and links/behaviors work.
- [ ] Network tab shows 200s for all four endpoints.

## Fix plan

1. Add loading skeletons and error states.
2. Aggregate attendance data per subject (backend) or relabel the chart.
3. Ensure analytics queries invalidate after record/assignment/topic mutations.
4. Re-run checklist.
