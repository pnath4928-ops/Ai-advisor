# Student — Profile

- **Role:** student
- **Route:** `/dashboard/student/profile`
- **Sidebar label:** Profile
- **Status:** FIXED (name falls back to populated `userId.name`; `isError` + `QueryErrorState` retry; PUT populates `userId`).

## Purpose

View and edit the student's academic profile (grade, section, learning preference,
preferred study time/technique, academic goal).

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/student/ProfilePage.tsx` | view + edit form |
| `frontend/src/hooks/useStudent.ts` | `useProfile`, `updateProfile` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/controllers/studentController.ts` | get/update profile |
| `backend/src/services/studentService.ts:27,34` | GET populates `userId`; PUT does **not** |
| `backend/src/validators/studentValidator.ts:3-10` | `updateProfileSchema` |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| Get | `GET /api/student/profile` | — | `Student` with `userId` populated `{_id,name,email}` |
| Update | `PUT /api/student/profile` | `{ gradeLevel?, section?, learningPreference?, preferredStudyTime?, preferredStudyTechnique?, academicGoal? }` | `Student` (`userId` **not** populated) |

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | Medium | Display prefers `user?.name` from auth store; if store desynced (refresh bug) name is missing | `ProfilePage.tsx:101`, auth plan | Fall back to populated `profile.userId.name` |
| 2 | Low | PUT response shape differs from GET (userId not populated) — inconsistent | `studentService.ts:34` | Populate on update or normalize |
| 3 | Medium | No query error state (falls to "Profile not found") | `ProfilePage.tsx:67-74` | Add `isError` + retry |
| 4 | Low | Form initialized via effect can reset unsaved edits if profile refetches | `ProfilePage.tsx:37-48` | Guard stale resets |

## Verification checklist

- [ ] Profile loads with real values.
- [ ] Edit each field and save → toast; values persist after refresh.
- [ ] `learningPreference` uses valid enum values.
- [ ] Empty `academicGoal` shows "Not set".
- [ ] 200s for GET/PUT.

## Fix plan

1. Add name fallback and error state.
2. Normalize PUT response (backend) or accept difference.
3. Re-run checklist.
