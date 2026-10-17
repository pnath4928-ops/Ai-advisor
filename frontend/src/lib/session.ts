import { useEffect, useState } from 'react';
import type { StudySession } from '@/types';

export const refId = (value?: string | { _id: string } | null): string | null => {
  if (!value) return null;
  return typeof value === 'string' ? value : value._id ?? null;
};

export const useNow = (enabled: boolean): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  return now;
};

export const sessionElapsedMinutes = (session: StudySession | null, now: number): number => {
  if (!session) return 0;
  if (session.status === 'paused' || session.status === 'completed') {
    return Math.max(0, session.durationMinutes ?? 0);
  }
  const start = new Date(session.startTime).getTime();
  if (Number.isNaN(start)) return 0;
  return Math.max(0, (now - start) / 60000);
};
