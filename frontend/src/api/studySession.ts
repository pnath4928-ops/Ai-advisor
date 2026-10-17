import api from '@/lib/api';
import type { StudySession, SessionTimer } from '@/types';

export const studySessionApi = {
  startSession: async (data: { studyTaskId: string; studyTopicId?: string }): Promise<StudySession> => {
    const res = await api.post('/student/sessions/start', data);
    return res.data;
  },

  pauseSession: async (id: string): Promise<StudySession> => {
    const res = await api.post(`/student/sessions/${id}/pause`);
    return res.data;
  },

  resumeSession: async (id: string): Promise<StudySession> => {
    const res = await api.post(`/student/sessions/${id}/resume`);
    return res.data;
  },

  endSession: async (id: string): Promise<{ session: StudySession; taskCompleted: boolean }> => {
    const res = await api.post(`/student/sessions/${id}/end`);
    return res.data;
  },

  getActiveSession: async (): Promise<StudySession | null> => {
    const res = await api.get('/student/sessions/active');
    return res.data;
  },

  getSessionsByTask: async (taskId: string): Promise<StudySession[]> => {
    const res = await api.get(`/student/sessions/task/${taskId}`);
    return res.data;
  },

  getSessionTimers: async (): Promise<SessionTimer> => {
    const res = await api.get('/student/sessions/timers');
    return res.data;
  },
};
