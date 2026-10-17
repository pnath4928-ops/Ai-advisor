import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['analytics', 'student'],
    queryFn: analyticsApi.getStudentAnalytics,
    refetchInterval: 30000,
  });
};
