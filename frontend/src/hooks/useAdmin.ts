import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
  });
};

export const useAdminUsers = (params?: { role?: string; search?: string; page?: number }) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
  });
};

export const useAdminTeachers = (params?: { search?: string; page?: number }) => {
  return useQuery({
    queryKey: ['admin', 'teachers', params],
    queryFn: () => adminApi.getTeachers(params),
  });
};

export const useAdminStudents = (params?: { search?: string; gradeLevel?: string; page?: number }) => {
  return useQuery({
    queryKey: ['admin', 'students', params],
    queryFn: () => adminApi.getStudents(params),
  });
};
