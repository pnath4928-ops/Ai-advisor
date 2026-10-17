import { useEffect, useRef, useCallback } from 'react';
import { useStudySessionStore } from '@/store/studySessionStore';

export function useStudyTimer(plannedMinutes: number) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSession = useStudySessionStore((s) => s.activeSession);
  const elapsed = useStudySessionStore((s) => s.elapsed);
  const remaining = useStudySessionStore((s) => s.remaining);
  const progress = useStudySessionStore((s) => s.progress);
  const isRunning = useStudySessionStore((s) => s.isRunning);
  const isPaused = useStudySessionStore((s) => s.isPaused);
  const setPlannedMinutes = useStudySessionStore((s) => s.setPlannedMinutes);
  const setIsRunning = useStudySessionStore((s) => s.setIsRunning);
  const setIsPaused = useStudySessionStore((s) => s.setIsPaused);
  const reset = useStudySessionStore((s) => s.reset);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const state = useStudySessionStore.getState();
    const session = state.activeSession;
    if (!session) return;
    const banked = session.durationMinutes || 0;
    let nextElapsed = banked;
    if (session.status === 'active') {
      const segmentStartMs = new Date(session.resumedAt ?? session.startTime).getTime();
      nextElapsed = banked + Math.max(0, Date.now() - segmentStartMs) / 60000;
    }
    const nextRemaining = Math.max(0, plannedMinutes - nextElapsed);
    const nextProgress =
      plannedMinutes > 0 ? Math.min(100, (nextElapsed / plannedMinutes) * 100) : 0;
    state.updateTimers(nextElapsed, nextRemaining, nextProgress);
  }, [plannedMinutes]);

  const runTimer = useCallback(() => {
    clearTimer();
    tick();
    intervalRef.current = setInterval(tick, 1000);
  }, [clearTimer, tick]);

  const startTimer = useCallback(() => {
    setPlannedMinutes(plannedMinutes);
    setIsRunning(true);
    setIsPaused(false);
    runTimer();
  }, [setPlannedMinutes, plannedMinutes, setIsRunning, setIsPaused, runTimer]);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    clearTimer();
  }, [clearTimer, setIsPaused, setIsRunning]);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
    runTimer();
  }, [runTimer, setIsPaused, setIsRunning]);

  const stopTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer, setIsRunning, setIsPaused]);

  const sessionId = activeSession?._id;
  const sessionStatus = activeSession?.status;

  useEffect(() => {
    if (sessionId && sessionStatus === 'active') {
      runTimer();
    } else {
      clearTimer();
    }
    return () => clearTimer();
  }, [sessionId, sessionStatus, runTimer, clearTimer]);

  return {
    elapsed,
    remaining,
    progress,
    isRunning,
    isPaused,
    activeSession,
    setIsRunning,
    setIsPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    reset,
  };
}
