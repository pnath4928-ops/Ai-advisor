import api from '@/lib/api';
import type { AcademicRecord, SubjectTopic, Assignment, Student } from '@/types';

export const teacherApi = {
  getStudents: async (): Promise<Student[]> => {
    const response = await api.get('/teacher/students');
    return response.data;
  },

  addAcademicRecord: async (data: Omit<AcademicRecord, '_id' | 'teacherId'>) => {
    const response = await api.post('/teacher/academic-records', data);
    return response.data;
  },

  updateAcademicRecord: async (id: string, data: Partial<AcademicRecord>) => {
    const response = await api.put(`/teacher/academic-records/${id}`, data);
    return response.data;
  },

  getAcademicRecords: async (): Promise<AcademicRecord[]> => {
    const response = await api.get('/teacher/academic-records');
    return response.data;
  },

  addSubjectTopic: async (data: Omit<SubjectTopic, '_id'>) => {
    const response = await api.post('/teacher/subjects', data);
    return response.data;
  },

  updateSubjectTopic: async (id: string, data: Partial<SubjectTopic>) => {
    const response = await api.put(`/teacher/subjects/${id}`, data);
    return response.data;
  },

  deleteSubjectTopic: async (id: string) => {
    const response = await api.delete(`/teacher/subjects/${id}`);
    return response.data;
  },

  getSubjectTopics: async (): Promise<SubjectTopic[]> => {
    const response = await api.get('/teacher/subjects');
    return response.data;
  },

  createAssignment: async (data: Omit<Assignment, '_id' | 'submitted' | 'teacherId' | 'studentId' | 'subjectName'>) => {
    const response = await api.post('/teacher/assignments', data);
    return response.data;
  },

  createBulkAssignments: async (data: { title: string; description?: string; subjectName: string; dueDate: string; marks: number; studentIds: string[] }) => {
    const response = await api.post('/teacher/assignments/bulk', data);
    return response.data;
  },

  updateAssignment: async (id: string, data: Partial<Assignment>) => {
    const response = await api.put(`/teacher/assignments/${id}`, data);
    return response.data;
  },

  getAssignments: async (): Promise<Assignment[]> => {
    const response = await api.get('/teacher/assignments');
    return response.data;
  },
};
