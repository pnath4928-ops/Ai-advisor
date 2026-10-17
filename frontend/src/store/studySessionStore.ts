import { create } from 'zustand';
import type { StudySession } from '@/types';

interface StudySessionState {
  activeSession: StudySession | null;
  plannedMinutes: number;
  elapsed: number;
  remaining: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  setActiveSession: (session: StudySession | null) => void;
  setPlannedMinutes: (minutes: number) => void;
  setElapsed: (elapsed: number) => void;
  setRemaining: (remaining: number) => void;
  setProgress: (progress: number) => void;
  setIsRunning: (running: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  updateTimers: (elapsed: number, remaining: number, progress: number) => void;
  reset: () => void;
}

const STORAGE_KEY = 'studySessionState';

interface Persisted {
  activeSession: StudySession;
  plannedMinutes: number;
  elapsed: number;
  remaining: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
}

export const computeSessionTimers = (
  session: StudySession,
  plannedMinutes: number
) => {
  const banked = session.durationMinutes || 0;
  let elapsed = banked;
  if (session.status === 'active') {
    const segmentStartMs = new Date(session.resumedAt ?? session.startTime).getTime();
    elapsed = banked + Math.max(0, Date.now() - segmentStartMs) / 60000;
  }
  const remaining = Math.max(0, plannedMinutes - elapsed);
  const progress =
    plannedMinutes > 0 ? Math.min(100, (elapsed / plannedMinutes) * 100) : 0;
  return { elapsed, remaining, progress };
};

const loadPersistedState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Persisted>;
      const session = parsed.activeSession;
      if (session && (session.status === 'active' || session.status === 'paused')) {
        const plannedMinutes = parsed.plannedMinutes || 0;
        const { elapsed, remaining, progress } = computeSessionTimers(session, plannedMinutes);
        return {
          activeSession: session,
          plannedMinutes,
          elapsed,
          remaining,
          progress,
          isRunning: session.status === 'active',
          isPaused: session.status === 'paused',
        };
      }
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

const persisted = loadPersistedState();

export const useStudySessionStore = create<StudySessionState>((set, get) => {
  const persist = () => {
    const s = get();
    if (s.activeSession) {
      const data: Persisted = {
        activeSession: s.activeSession,
        plannedMinutes: s.plannedMinutes,
        elapsed: s.elapsed,
        remaining: s.remaining,
        progress: s.progress,
        isRunning: s.isRunning,
        isPaused: s.isPaused,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    activeSession: persisted?.activeSession || null,
    plannedMinutes: persisted?.plannedMinutes || 0,
    elapsed: persisted?.elapsed || 0,
    remaining: persisted?.remaining || 0,
    progress: persisted?.progress || 0,
    isRunning: persisted?.isRunning || false,
    isPaused: persisted?.isPaused || false,

    setActiveSession: (session) => {
      set({ activeSession: session });
      persist();
    },

    setPlannedMinutes: (plannedMinutes) => {
      set({ plannedMinutes });
      persist();
    },

    setElapsed: (elapsed) => set({ elapsed }),
    setRemaining: (remaining) => set({ remaining }),
    setProgress: (progress) => set({ progress }),

    setIsRunning: (isRunning) => {
      set({ isRunning });
      persist();
    },

    setIsPaused: (isPaused) => {
      set({ isPaused });
      persist();
    },

    updateTimers: (elapsed, remaining, progress) => {
      set({ elapsed, remaining, progress });
      persist();
    },

    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({
        activeSession: null,
        plannedMinutes: 0,
        elapsed: 0,
        remaining: 0,
        progress: 0,
        isRunning: false,
        isPaused: false,
      });
    },
  };
});
