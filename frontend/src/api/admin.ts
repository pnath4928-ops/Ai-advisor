import api from '@/lib/api';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
}

export interface AdminTeacher {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  teacherId: string;
  department: string;
  designation: string;
  assignedSubjects: string[];
  assignedClasses: string[];
}

export interface AdminStudent {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  studentId: string;
  gradeLevel: string;
  section: string;
  learningPreference: string;
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAcademicRecords: number;
  totalStudyPlans: number;
  totalAISuggestions: number;
  usersByRole: Record<string, number>;
}

export interface PaginatedResult {
  total: number;
  page: number;
  totalPages: number;
}

export const adminApi = {
  getStats: async (): Promise<SystemStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async (params?: { role?: string; search?: string; page?: number }): Promise<PaginatedResult & { users: AdminUser[] }> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  createUser: async (data: { name: string; email: string; password: string; role: string }): Promise<AdminUser> => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
  getTeachers: async (params?: { search?: string; page?: number }): Promise<PaginatedResult & { teachers: AdminTeacher[] }> => {
    const response = await api.get('/admin/teachers', { params });
    return response.data;
  },
  getStudents: async (params?: { search?: string; gradeLevel?: string; page?: number }): Promise<PaginatedResult & { students: AdminStudent[] }> => {
    const response = await api.get('/admin/students', { params });
    return response.data;
  },
};
