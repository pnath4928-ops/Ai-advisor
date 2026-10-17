import api from '@/lib/api';
import type { StudyTopic } from '@/types';

export const studyTopicApi = {
  createTopics: async (studyTaskId: string, topics: Array<{ topicName: string; plannedMinutes: number }>): Promise<StudyTopic[]> => {
    const res = await api.post('/student/topics', { studyTaskId, topics });
    return res.data;
  },

  getTopicsByTask: async (taskId: string): Promise<StudyTopic[]> => {
    const res = await api.get(`/student/topics/task/${taskId}`);
    return res.data;
  },

  getTopic: async (id: string): Promise<StudyTopic> => {
    const res = await api.get(`/student/topics/${id}`);
    return res.data;
  },

  updateTopic: async (id: string, data: Partial<Pick<StudyTopic, 'topicName' | 'plannedMinutes' | 'studiedMinutes' | 'status'>>): Promise<StudyTopic> => {
    const res = await api.put(`/student/topics/${id}`, data);
    return res.data;
  },

  deleteTopic: async (id: string): Promise<void> => {
    await api.delete(`/student/topics/${id}`);
  },
};
