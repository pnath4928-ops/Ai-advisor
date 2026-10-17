import api from '@/lib/api';
import type { AISuggestion, AdvisorData } from '@/types';

export interface WeakSubjectsResult {
  weakSubjects: { subjectName: string; score: number; weakTopics: string[]; recommendation: string }[];
  overallAnalysis: string;
}

export interface FullPlanResult {
  plan: { _id: string; studentId: string; weekStartDate: string; status: string };
  tasks: { _id: string; studyPlanId: string; day: string; topic: string; subjectName: string; plannedMinutes: number; studyTechnique: string; completed: boolean }[];
  suggestion: AISuggestion;
}

export const aiApi = {
  generateSuggestion: async (type: 'plan' | 'daily' | 'weakness' | 'revision'): Promise<AISuggestion> => {
    const response = await api.post('/ai/generate', { type });
    return response.data;
  },

  generateFullPlan: async (scope?: 'day' | 'week'): Promise<FullPlanResult> => {
    const response = await api.post('/ai/generate-plan', { scope });
    return response.data;
  },

  analyzeWeakSubjects: async (): Promise<WeakSubjectsResult> => {
    const response = await api.post('/ai/weak-subjects');
    return response.data;
  },

  revisionStrategy: async (): Promise<{ strategy: string }> => {
    const response = await api.post('/ai/revision-strategy');
    return response.data;
  },

  getSuggestions: async (type?: string): Promise<AISuggestion[]> => {
    const params = type ? { type } : {};
    const response = await api.get('/ai/suggestions', { params });
    return response.data;
  },

  acceptSuggestion: async (id: string): Promise<AISuggestion> => {
    const response = await api.post(`/ai/suggestions/${id}/accept`);
    return response.data;
  },

  rejectSuggestion: async (id: string): Promise<void> => {
    await api.delete(`/ai/suggestions/${id}/reject`);
  },
  getAdvisor: async (): Promise<AdvisorData> => {
    const response = await api.get('/ai/advisor');
    return response.data;
  },
  askAI: async (question: string, history?: Array<{ role: 'user' | 'ai'; text: string }>): Promise<{ answer: string; offline: boolean }> => {
    const response = await api.post('/ai/ask', { question, history });
    return response.data;
  },
};
