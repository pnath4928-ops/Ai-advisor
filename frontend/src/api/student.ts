import api from '@/lib/api';
import type { Student, StudyPlan, StudyTask, Exam, AcademicRecord, Assignment, StudyProgress } from '@/types';

export const studentApi = {
  getProfile: async (): Promise<Student> => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<Student>) => {
    const response = await api.put('/student/profile', data);
    return response.data;
  },

  getStudyPlans: async (): Promise<StudyPlan[]> => {
    const response = await api.get('/student/study-plans');
    return response.data;
  },

  createStudyPlan: async (data: Omit<StudyPlan, '_id' | 'studentId'>) => {
    const response = await api.post('/student/study-plans', data);
    return response.data;
  },

  updateStudyPlan: async (id: string, data: Partial<StudyPlan>) => {
    const response = await api.put(`/student/study-plans/${id}`, data);
    return response.data;
  },

  deleteStudyPlan: async (id: string) => {
    const response = await api.delete(`/student/study-plans/${id}`);
    return response.data;
  },

  getTasks: async (): Promise<StudyTask[]> => {
    const response = await api.get('/student/tasks');
    return response.data;
  },

  createTask: async (data: Pick<StudyTask, 'studyPlanId' | 'day' | 'subjectName' | 'plannedMinutes' | 'studyTechnique'>) => {
    const response = await api.post('/student/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<StudyTask>) => {
    const response = await api.put(`/student/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/student/tasks/${id}`);
    return response.data;
  },

  logProgress: async (data: { studyTaskId: string; actualMinutes: number; focusScore: number; notes?: string }) => {
    const response = await api.post('/student/progress', data);
    return response.data;
  },

  getProgress: async (): Promise<StudyProgress[]> => {
    const response = await api.get('/student/progress');
    return response.data;
  },

  getExams: async (): Promise<Exam[]> => {
    const response = await api.get('/student/exams');
    return response.data;
  },

  addExam: async (data: Omit<Exam, '_id' | 'studentId'>) => {
    const response = await api.post('/student/exams', data);
    return response.data;
  },

  updateExam: async (id: string, data: Partial<Exam>) => {
    const response = await api.put(`/student/exams/${id}`, data);
    return response.data;
  },

  getAcademicRecords: async (): Promise<AcademicRecord[]> => {
    const response = await api.get('/student/academic-records');
    return response.data;
  },

  getAssignments: async (): Promise<Assignment[]> => {
    const response = await api.get('/student/assignments');
    return response.data;
  },

  submitAssignment: async (id: string, studentAnswer: string) => {
    const response = await api.post(`/student/assignments/${id}/submit`, { studentAnswer });
    return response.data;
  },
};
