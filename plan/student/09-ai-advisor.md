# Student — AI Advisor

- **Role:** student
- **Route:** `/dashboard/student/ai-advisor`
- **Sidebar label:** AI Advisor
- **Status:** FIXED (fabricated per-category score badges removed; `isError` + retry; `staleTime` 5m added). Note: chat-history ordering (#4) verified correct — backend appends the current question after the history array.

## Purpose

AI-generated study advice: overall score, recommendation, weak subjects, teacher
feedback, study-habit analysis, exam countdowns, plus a chat Q&A.

## Frontend files

| File | Notes |
|---|---|
| `frontend/src/pages/student/AIAdvisorPage.tsx` | advisor + chat |
| `frontend/src/api/ai.ts` | `getAdvisor`, `askAI` |

## Backend files

| File | Notes |
|---|---|
| `backend/src/services/aiService.ts:924-1049` | `getAdvisorData` (calls LLM for recommendation) |
| `backend/src/controllers/aiController.ts:93,112` | advisor + ask |
| `backend/src/routes/aiRoutes.ts:21-30` | `askSchema` |

## Data contract

| Action | Method + path | Request | Response |
|---|---|---|---|
| Advisor | `GET /api/ai/advisor` | — | `AdvisorData` (overallStudyScore, todayRecommendation, weakSubjects{red,yellow,green}, teacherFeedback[], studyHabitAnalysis, examCountdowns[]) |
| Ask | `POST /api/ai/ask` | `{ question, history:[{role,text}] }` | `{ answer, offline }` |

## Known issues

| # | Severity | Issue | File:line | Fix |
|---|---|---|---|---|
| 1 | Medium | Fabricated per-category scores (Academic/Focus/Tasks) = `overallStudyScore * 0.25/0.15/0.2`, mislabeled and inconsistent | `AIAdvisorPage.tsx:114-116` | Remove or expose real sub-scores from backend |
| 2 | Medium | Error conflated with empty → failure shows "No advisor data available yet", no retry | `AIAdvisorPage.tsx:61` | Add `isError` + retry |
| 3 | Low | `/ai/advisor` calls the LLM on every mount (no `staleTime`) → slow/expensive | `AIAdvisorPage.tsx:19-22` | Add caching/staleTime |
| 4 | Low | Chat history is one turn behind (slices before appending new message) | `AIAdvisorPage.tsx:44-45` | Include current question |
| 5 | Low | `examCountdowns[].title` returned but unused | — | Optional |
| 6 | Low | `AI` endpoints require a configured provider; no graceful offline data path for advisor | `aiService.ts` | Ensure `offline` handling |

## Verification checklist

- [ ] Advisor page loads score, recommendation, weak subjects, feedback, habits, countdowns.
- [ ] With no AI key, page still renders something sensible (offline path) rather than breaking.
- [ ] Chat sends a question and renders the answer; offline banner shows when applicable.
- [ ] History/context passed correctly to `/ai/ask`.
- [ ] 200 for GET advisor, 200 for POST ask.

## Fix plan

1. Remove fabricated sub-scores or add real ones to the backend payload.
2. Add error state + retry, and `staleTime` for the advisor query.
3. Fix chat history ordering.
4. Re-run checklist.
