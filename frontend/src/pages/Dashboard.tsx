import { useAuthStore } from '@/store/authStore';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';
import { AdminDashboard } from './admin/AdminDashboard';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};
