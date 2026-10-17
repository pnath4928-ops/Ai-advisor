import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

export const useTeacherAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'teacher'],
    queryFn: analyticsApi.getTeacherAnalytics,
  });
};

export const useStudentAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'student'],
    queryFn: analyticsApi.getStudentAnalytics,
  });
};

export const useStudentProgress = () => {
  return useQuery({
    queryKey: ['analytics', 'student', 'progress'],
    queryFn: analyticsApi.getStudentProgress,
  });
};
