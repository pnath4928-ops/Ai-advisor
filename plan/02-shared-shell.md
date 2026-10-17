# 02 — Shared Dashboard Shell

- **Role:** all
- **Route:** `/dashboard` (layout wraps every section)
- **Status:** FIXED (unauthorized route, GlobalSearch wired, notification loading/type)

> Browser pass: **all dialogs now open.** `components/ui/dialog.tsx` wrapped
> `createPortal(...)` in `<AnimatePresence>`; `createPortal` returns a portal object that
> `AnimatePresence` treats as an invalid child and drops, so no dialog in the app mounted.
> The portal now wraps `AnimatePresence`. Verified by opening edit-profile, create plan,
> add academic record, and create-user dialogs in Chrome.

## Purpose

The layout, sidebar navigation, protected routing, top bar (search), and the
notification bell must work for every role.

## Frontend files

| File | Role |
|---|---|
| `frontend/src/App.tsx` | route table |
| `frontend/src/layouts/DashboardLayout.tsx` | sidebar + top bar + `<Outlet/>` |
| `frontend/src/components/Sidebar.tsx` | role-based nav lists |
| `frontend/src/components/ProtectedRoute.tsx` | auth + role guard |
| `frontend/src/components/NotificationBell.tsx` / `NotificationPanel.tsx` | notifications UI |
| `frontend/src/hooks/useNotifications.ts` | notification queries/mutations |
| `frontend/src/components/GlobalSearch.tsx` | full search component (**unused**) |
| `frontend/src/pages/Unauthorized.tsx` | access-denied page (**unrouted**) |

## Backend files

| File | Role |
|---|---|
| `backend/src/controllers/notificationController.ts` | notification handlers |
| `backend/src/services/notificationService.ts` | list/count/mark/delete + `runReminderChecks` |
| `backend/src/routes/notificationRoutes.ts` | routes |

## Data contract (notifications)

| Action | Method + path | Response |
|---|---|---|
| List | `GET /api/notifications` | plain `Notification[]` (max 50, newest first) |
| Unread count | `GET /api/notifications/unread-count` | `{ count }` |
| Mark one | `PUT /api/notifications/:id/read` | `Notification` |
| Mark all | `PUT /api/notifications/read-all` | `{ message }` |
| Delete | `DELETE /api/notifications/:id` | `{ message }` |

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | High | `/unauthorized` route missing; wrong-role users fall through `*` to `/dashboard` and see their own dashboard | `ProtectedRoute.tsx:22`, `App.tsx:80-86` | Add a `/unauthorized` route |
| 2 | Medium | Layout search box is non-functional (no state/handler, bogus `/` shortcut hint); `GlobalSearch` component exists but is never mounted | `DashboardLayout.tsx:63-80`, `GlobalSearch.tsx:36` | Wire `GlobalSearch` (or remove the dead input) |
| 3 | Medium | GlobalSearch admin/teacher/student search by name/email but backend search fields differ (see admin plans) | `GlobalSearch.tsx:229-245` | Align search fields |
| 4 | Low | Admin dashboard renders at both `/dashboard` and `/dashboard/admin`; no nav item highlights at `/dashboard` (exact-match active check) | `App.tsx:66,80`, `Sidebar.tsx:147` | De-duplicate admin dashboard route; handle active state |
| 5 | Low | `NotificationPanel` ignores `isLoading` → flashes empty state on first load | `NotificationPanel.tsx:21` | Use `isLoading` for a skeleton |
| 6 | Low | `Notification` frontend type omits backend `'success'` type | `api/notification.ts:6` vs `models/Notification.ts:5` | Add `'success'` to the union |
| 7 | Low | `QueryErrorState` component exists but is unused everywhere | `components/QueryErrorState.tsx` | Adopt in sections with missing error UI |
| 8 | Low | `GlobalSearch` student plan search matches wrong string ("week" never matches) | `GlobalSearch.tsx:146` | Search on stable fields |

## Verification checklist

- [ ] Sidebar shows the correct nav list for the logged-in role.
- [ ] Every sidebar link navigates to an existing route and highlights when active.
- [ ] Navigating to another role's URL as the wrong role shows access-denied (`/unauthorized`).
- [ ] Notification bell shows unread count; panel lists notifications; mark-read / mark-all / delete work and update the count.
- [ ] Search box (if wired) returns results and navigates on click.
- [ ] Mobile: hamburger opens/closes the sidebar; route change closes it.

## Fix plan

1. Add the `/unauthorized` route and verify role guard.
2. Wire `GlobalSearch` into the top bar (including the `/` shortcut) or remove the dead input.
3. Align search fields with backend capabilities.
4. Use `isLoading` in `NotificationPanel`; add `'success'` to the notification type.
5. Re-run the checklist.
